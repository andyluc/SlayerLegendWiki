/**
 * Netlify Function: Save Data (Universal)
 * Handles saving skill builds, battle loadouts, spirit collection, and grid submissions
 *
 * POST /.netlify/functions/save-data
 * Body: {
 *   type: 'skill-build' | 'battle-loadout' | 'my-spirit' | 'spirit-build' | 'grid-submission',
 *   username: string,
 *   userId: number,
 *   data: object,
 *   spiritId?: string (for my-spirit updates),
 *   replace?: boolean (for grid-submission replace mode)
 * }
 */

import { Octokit } from '@octokit/rest';

/**
 * Handle grid submission (weapon-centric)
 * Grid submissions are stored as comments (one per submission)
 * The first comment is the primary/active layout
 */
async function handleGridSubmission(octokit, owner, repo, config, data, username, replace) {
  try {
    // Add metadata to submission
    const fullSubmission = {
      ...data,
      submittedBy: username || 'Anonymous',
      submittedAt: new Date().toISOString(),
    };

    // Search for existing grid submissions issue with this weapon label
    // Only search for OPEN issues - closed issues are considered deleted
    const weaponLabel = `weapon:${data.weaponName}`;
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      labels: config.label,
      state: 'open', // IMPORTANT: Only open issues, closed = deleted
      per_page: 10,
    });

    // Find issue with matching weapon label
    let existingIssue = issues.find(issue =>
      issue.labels.some(label =>
        (typeof label === 'string' && label === weaponLabel) ||
        (typeof label === 'object' && label.name === weaponLabel)
      )
    );

    // Format submission as comment with JSON code block
    const submissionComment = `Submitted by **${username || 'Anonymous'}** on ${fullSubmission.submittedAt}\n\n` +
      `\`\`\`json\n${JSON.stringify(fullSubmission, null, 2)}\n\`\`\``;

    if (existingIssue) {
      // Security: Verify issue was created by bot account
      const botUsername = process.env.WIKI_BOT_USERNAME;
      if (existingIssue.user.login !== botUsername) {
        console.warn(`[save-data] Security: Grid issue #${existingIssue.number} created by ${existingIssue.user.login}, expected ${botUsername}`);
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Invalid data source' }),
        };
      }

      // Issue exists for this weapon
      if (replace) {
        // Get all comments on the issue
        const { data: comments } = await octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number: existingIssue.number,
          per_page: 100,
        });

        if (comments.length > 0) {
          // Security: Filter to only bot-created comments
          const botUsername = process.env.WIKI_BOT_USERNAME;
          const botComments = comments.filter(c => c.user.login === botUsername);

          if (botComments.length === 0) {
            console.warn(`[save-data] Security: No bot comments found on grid issue #${existingIssue.number}`);
            return {
              statusCode: 403,
              body: JSON.stringify({ error: 'Invalid grid data' }),
            };
          }

          // Update the first bot comment (primary layout)
          await octokit.rest.issues.updateComment({
            owner,
            repo,
            comment_id: botComments[0].id,
            body: submissionComment,
          });

          console.log(`[save-data] Replaced first comment on issue #${existingIssue.number} for ${data.weaponName}`);

          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              action: 'replaced',
              issueNumber: existingIssue.number,
              issueUrl: existingIssue.html_url,
            }),
          };
        } else {
          // No comments yet, create the first one
          await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: existingIssue.number,
            body: submissionComment,
          });

          console.log(`[save-data] Created first comment on issue #${existingIssue.number} for ${data.weaponName}`);

          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              action: 'replaced',
              issueNumber: existingIssue.number,
              issueUrl: existingIssue.html_url,
            }),
          };
        }
      } else {
        // Append as new comment
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: existingIssue.number,
          body: submissionComment,
        });

        console.log(`[save-data] Added new comment to issue #${existingIssue.number} for ${data.weaponName}`);

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            action: 'added',
            issueNumber: existingIssue.number,
            issueUrl: existingIssue.html_url,
          }),
        };
      }
    } else {
      // Create new issue for this weapon
      const issueBody = `This issue tracks community-submitted engraving grid layouts for **${data.weaponName}**.\n\n` +
        `The first comment is used as the primary layout in the builder.\n\n` +
        `Each comment represents a different submission.`;

      const labels = [config.label, weaponLabel];

      const { data: newIssue } = await octokit.rest.issues.create({
        owner,
        repo,
        title: `${config.titlePrefix} ${data.weaponName}`,
        body: issueBody,
        labels,
      });

      // Create the first comment with the submission
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: newIssue.number,
        body: submissionComment,
      });

      console.log(`[save-data] Created new issue #${newIssue.number} with first comment for ${data.weaponName}`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          action: 'created',
          issueNumber: newIssue.number,
          issueUrl: newIssue.html_url,
        }),
      };
    }
  } catch (error) {
    console.error('[save-data] Grid submission error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to submit grid layout',
        details: error.response?.data || null,
      }),
    };
  }
}

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { type, username, userId, data, spiritId, replace = false } = JSON.parse(event.body);

    // Validate required fields
    // Grid submissions allow anonymous users (username/userId optional)
    if (!type || !data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: type, data' }),
      };
    }

    // For user-centric types (not grid-submission), require username and userId
    if (type !== 'grid-submission' && (!username || !userId)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: username, userId' }),
      };
    }

    // Validate type
    const validTypes = ['skill-build', 'battle-loadout', 'my-spirit', 'spirit-build', 'grid-submission'];
    if (!validTypes.includes(type)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }),
      };
    }

    // Get bot token from environment
    const botToken = process.env.WIKI_BOT_TOKEN;
    if (!botToken) {
      console.error('[save-data] WIKI_BOT_TOKEN not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Initialize Octokit with bot token
    const octokit = new Octokit({ auth: botToken });

    // Get repo info from environment
    // Try both VITE_ prefixed (for local dev) and non-prefixed (for Netlify)
    const owner = process.env.WIKI_REPO_OWNER || process.env.VITE_WIKI_REPO_OWNER;
    const repo = process.env.WIKI_REPO_NAME || process.env.VITE_WIKI_REPO_NAME;

    if (!owner || !repo) {
      console.error('[save-data] Repository config missing');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Set type-specific constants
    const configs = {
      'skill-build': {
        label: 'skill-builds',
        titlePrefix: '[Skill Builds]',
        maxItems: 10,
        itemName: 'build',
        itemsName: 'builds',
      },
      'battle-loadout': {
        label: 'battle-loadouts',
        titlePrefix: '[Battle Loadouts]',
        maxItems: 10,
        itemName: 'loadout',
        itemsName: 'loadouts',
      },
      'my-spirit': {
        label: 'my-spirits',
        titlePrefix: '[My Spirits]',
        maxItems: 50,
        itemName: 'spirit',
        itemsName: 'spirits',
      },
      'spirit-build': {
        label: 'spirit-builds',
        titlePrefix: '[Spirit Builds]',
        maxItems: 10,
        itemName: 'build',
        itemsName: 'builds',
      },
      'grid-submission': {
        label: 'engraving-grid-submissions',
        titlePrefix: '[Engraving Grid Submissions]',
        maxItems: null, // No limit for grid submissions
        itemName: 'submission',
        itemsName: 'submissions',
        weaponCentric: true, // Flag for weapon-centric vs user-centric
      },
    };
    const config = configs[type];

    // Validate data structure
    if (type === 'grid-submission') {
      // Grid submission validation
      if (!data.weaponId || !data.weaponName || !data.gridType || !data.completionEffect || !data.activeSlots) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Grid submission must have weaponId, weaponName, gridType, completionEffect, and activeSlots' }),
        };
      }
    } else if (type !== 'my-spirit' && !data.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `${config.itemName} must have a name` }),
      };
    }

    if (type === 'my-spirit' && !data.spirit) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Spirit data must include a spirit object' }),
      };
    }

    if (type === 'skill-build' && (!data.maxSlots || !data.slots)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Build must have maxSlots and slots' }),
      };
    }

    // Handle grid submissions differently (weapon-centric vs user-centric)
    if (type === 'grid-submission') {
      return await handleGridSubmission(octokit, owner, repo, config, data, username, replace);
    }

    // Get existing items (for user-centric types)
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      labels: config.label,
      state: 'open',
      per_page: 100,
    });

    let existingIssue = null;

    // Search by user ID label
    existingIssue = issues.find(issue =>
      issue.labels.some(label =>
        (typeof label === 'string' && label === `user-id:${userId}`) ||
        (typeof label === 'object' && label.name === `user-id:${userId}`)
      )
    );

    // Parse existing items
    let items = [];
    if (existingIssue) {
      // Security: Verify issue was created by bot account
      const botUsername = process.env.WIKI_BOT_USERNAME;
      if (existingIssue.user.login !== botUsername) {
        console.warn(`[save-data] Security: Issue #${existingIssue.number} created by ${existingIssue.user.login}, expected ${botUsername}`);
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Invalid data source' }),
        };
      }

      try {
        items = JSON.parse(existingIssue.body || '[]');
        if (!Array.isArray(items)) items = [];
      } catch (e) {
        items = [];
      }
    }

    // Check if updating existing item
    let itemIndex = -1;
    if (type === 'my-spirit' && spiritId) {
      // For my-spirit updates, find by spiritId
      itemIndex = items.findIndex(item => item.id === spiritId);
    } else if (type !== 'my-spirit') {
      // For other types, find by name
      itemIndex = items.findIndex(item => item.name === data.name);
    }

    if (itemIndex !== -1) {
      // Update existing item
      items[itemIndex] = {
        ...data,
        id: items[itemIndex].id, // Preserve original ID
        createdAt: items[itemIndex].createdAt, // Preserve creation date
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new item
      if (items.length >= config.maxItems) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `Maximum ${config.maxItems} ${config.itemsName} allowed. Please delete an old ${config.itemName} first.`,
          }),
        };
      }

      // Generate ID for new item
      data.id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      data.createdAt = new Date().toISOString();
      data.updatedAt = new Date().toISOString();

      items.push(data);
    }

    // Save items to GitHub
    const issueTitle = `${config.titlePrefix} ${username}`;
    const issueBody = JSON.stringify(items, null, 2);
    const userIdLabel = `user-id:${userId}`;

    if (existingIssue) {
      // Update existing issue
      await octokit.rest.issues.update({
        owner,
        repo,
        issue_number: existingIssue.number,
        title: issueTitle,
        body: issueBody,
      });

      console.log(`[save-data] Updated ${config.itemsName} for ${username}`);
    } else {
      // Create new issue
      const labels = [config.label, userIdLabel];

      const { data: newIssue } = await octokit.rest.issues.create({
        owner,
        repo,
        title: issueTitle,
        body: issueBody,
        labels,
      });

      // Lock the issue
      try {
        await octokit.rest.issues.lock({
          owner,
          repo,
          issue_number: newIssue.number,
          lock_reason: 'off-topic',
        });
      } catch (lockError) {
        console.warn(`[save-data] Failed to lock issue:`, lockError.message);
      }

      console.log(`[save-data] Created ${config.itemsName} issue for ${username}`);
    }

    // Return response with dynamic key names
    const response = {
      success: true,
    };
    response[config.itemName] = data;
    response[config.itemsName] = items;

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('[save-data] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
}
