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

/**
 * Handle admin action requests
 * @param {Object} adapter - Platform adapter (Netlify, Cloudflare, etc)
 * @returns {Promise<Response>} API response
 */
export async function handleAdminAction(adapter) {
  console.log('[Admin Actions] Request received');

  // Get repository info from config
  const config = await adapter.getWikiConfig();
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
      const action = adapter.getQueryParam('action');

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

        default:
          return adapter.createJsonResponse({ error: 'Invalid action' }, 400);
      }
    }

    if (method === 'POST') {
      // POST endpoints for mutations
      const body = await adapter.getBody();
      const { action, username, reason, addedBy, removedBy, bannedBy, unbannedBy } = body;

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
