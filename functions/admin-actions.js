/**
 * Admin Actions API Endpoint (Netlify)
 * Handles admin operations: add/remove admins, ban/unban users
 * All actions are authenticated server-side
 */

import { NetlifyAdapter } from './_shared/adapters/netlify.js';
import { handleAdminAction } from './_shared/handlers/admin-actions.js';

export default async (req, context) => {
  const adapter = new NetlifyAdapter(req, context);
  return handleAdminAction(adapter);
};

export const config = {
  path: '/api/admin-actions'
};
