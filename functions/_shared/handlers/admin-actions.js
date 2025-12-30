/**
 * Admin Actions Handler
 * Platform-agnostic handler for admin operations (add/remove admins, ban/unban users)
 * All actions are authenticated server-side
 */

import { getOctokit } from '../../../wiki-framework/src/services/github/api.js';
import {
  addAdmin as addAdminService,
  removeAdmin as removeAdminService,
  banUser as banUserService,
  unbanUser as unbanUserService,
  getAdmins,
  getBannedUsers,
  getCurrentUserAdminStatus
} from '../../../wiki-framework/src/services/github/admin.js';
import {
  getAllDonators,
  saveDonatorStatus,
  removeDonatorStatus
} from '../../../wiki-framework/src/services/github/donatorRegistry.js';

/**
 * Handle admin action requests
 * @param {Object} adapter - Platform adapter (Netlify, Cloudflare, etc)
 * @param {Object} configAdapter - Config adapter instance
 * @returns {Promise<Response>} API response
 */
export async function handleAdminAction(adapter, configAdapter) {
  console.log('[Admin Actions] Request received');

  // Get repository info from config
  const config = configAdapter.getWikiConfig();
  const { owner, repo } = config.wiki.repository;

  // Authentication check
  const token = adapter.getAuthToken();
  if (!token) {
    console.error('[Admin Actions] No auth token provided');
    return adapter.createJsonResponse({ error: 'Authentication required' }, 401);
  }

  // Set token for this request
  process.env.GITHUB_TOKEN = token;

  try {
    const method = adapter.getMethod();

    if (method === 'GET') {
      // GET endpoints for fetching lists
      const params = adapter.getQueryParams();
      const action = params.action;

      switch (action) {
        case 'get-admins':
          console.log('[Admin Actions] Fetching admin list');
          const admins = await getAdmins(owner, repo, config);
          return adapter.createJsonResponse({ admins });

        case 'get-banned-users':
          console.log('[Admin Actions] Fetching banned users list');
          const bannedUsers = await getBannedUsers(owner, repo, config);
          return adapter.createJsonResponse({ bannedUsers });

        case 'get-admin-status':
          console.log('[Admin Actions] Checking current user admin status');
          const status = await getCurrentUserAdminStatus(owner, repo, config);
          return adapter.createJsonResponse(status);

        case 'get-all-donators':
          console.log('[Admin Actions] Fetching all donators');
          const donators = await getAllDonators(owner, repo);
          return adapter.createJsonResponse({ donators });

        default:
          return adapter.createJsonResponse({ error: 'Invalid action' }, 400);
      }
    }

    if (method === 'POST') {
      // POST endpoints for mutations
      const body = await adapter.getBody();
      const { action, username, reason, amount, addedBy, removedBy, bannedBy, unbannedBy } = body;

      // Verify authenticated user
      const octokit = getOctokit();
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const currentUsername = user.login;

      console.log(`[Admin Actions] Action: ${action}, User: ${currentUsername}`);

      switch (action) {
        case 'add-admin':
          if (!username) {
            return adapter.createJsonResponse({ error: 'Username required' }, 400);
          }
          console.log(`[Admin Actions] Adding admin: ${username} by ${currentUsername}`);
          const updatedAdmins = await addAdminService(username, owner, repo, currentUsername, config);
          return adapter.createJsonResponse({
            success: true,
            message: `Successfully added ${username} as administrator`,
            admins: updatedAdmins
          });

        case 'remove-admin':
          if (!username) {
            return adapter.createJsonResponse({ error: 'Username required' }, 400);
          }
          console.log(`[Admin Actions] Removing admin: ${username} by ${currentUsername}`);
          const updatedAdminsAfterRemoval = await removeAdminService(username, owner, repo, currentUsername, config);
          return adapter.createJsonResponse({
            success: true,
            message: `Successfully removed ${username} from administrators`,
            admins: updatedAdminsAfterRemoval
          });

        case 'ban-user':
          if (!username || !reason) {
            return adapter.createJsonResponse({ error: 'Username and reason required' }, 400);
          }
          console.log(`[Admin Actions] Banning user: ${username} by ${currentUsername}`);
          const bannedUsers = await banUserService(username, reason, owner, repo, currentUsername, config);
          return adapter.createJsonResponse({
            success: true,
            message: `Successfully banned ${username}`,
            bannedUsers
          });

        case 'unban-user':
          if (!username) {
            return adapter.createJsonResponse({ error: 'Username required' }, 400);
          }
          console.log(`[Admin Actions] Unbanning user: ${username} by ${currentUsername}`);
          const bannedUsersAfterUnban = await unbanUserService(username, owner, repo, currentUsername, config);
          return adapter.createJsonResponse({
            success: true,
            message: `Successfully unbanned ${username}`,
            bannedUsers: bannedUsersAfterUnban
          });

        case 'assign-donator-badge':
          if (!username) {
            return adapter.createJsonResponse({ error: 'Username required' }, 400);
          }
          console.log(`[Admin Actions] Assigning donator badge: ${username} by ${currentUsername}`);

          // Get user ID from GitHub
          let userId;
          try {
            const { data: targetUser } = await octokit.rest.users.getByUsername({ username });
            userId = targetUser.id;
          } catch (error) {
            return adapter.createJsonResponse({ error: `User not found: ${username}` }, 404);
          }

          // Create donator status
          const donatorStatus = {
            isDonator: true,
            donatedAt: new Date().toISOString(),
            badge: config.features?.donation?.badge?.badge || '💎',
            color: config.features?.donation?.badge?.color || '#ffd700',
            assignedBy: `admin:${currentUsername}`,
          };

          if (amount) donatorStatus.amount = amount;
          if (reason) donatorStatus.reason = reason;

          await saveDonatorStatus(owner, repo, username, userId, donatorStatus);

          return adapter.createJsonResponse({
            success: true,
            message: `Successfully assigned donator badge to ${username}`,
            donatorStatus
          });

        case 'remove-donator-badge':
          if (!username) {
            return adapter.createJsonResponse({ error: 'Username required' }, 400);
          }
          console.log(`[Admin Actions] Removing donator badge: ${username} by ${currentUsername}`);

          // Get user ID from GitHub (optional for removal)
          let userIdForRemoval;
          try {
            const { data: targetUser } = await octokit.rest.users.getByUsername({ username });
            userIdForRemoval = targetUser.id;
          } catch (error) {
            console.warn(`[Admin Actions] Could not fetch user ID for ${username}, proceeding with username only`);
          }

          await removeDonatorStatus(owner, repo, username, userIdForRemoval);

          return adapter.createJsonResponse({
            success: true,
            message: `Successfully removed donator badge from ${username}`
          });

        default:
          return adapter.createJsonResponse({ error: 'Invalid action' }, 400);
      }
    }

    return adapter.createJsonResponse({ error: 'Method not allowed' }, 405);

  } catch (error) {
    console.error('[Admin Actions] Error:', error);
    return adapter.createJsonResponse({
      error: error.message || 'Internal server error'
    }, 500);
  } finally {
    // Clean up token
    delete process.env.GITHUB_TOKEN;
  }
}
