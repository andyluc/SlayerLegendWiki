/**
 * Cloudflare Pages Function: GitHub Device Flow - Initiate
 * Proxies GitHub device flow initiation request
 *
 * POST /api/device-code
 * Body: {
 *   client_id: string,
 *   scope: string
 * }
 */

import { initiateDeviceFlow } from '../../netlify/functions/shared/oauth.js';

export async function onRequest(context) {
  const { request } = context;

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Parse request body
    const { client_id, scope } = await request.json();

    // Initiate device flow
    const result = await initiateDeviceFlow({
      client_id,
      scope
    });

    return new Response(
      JSON.stringify(result.body),
      {
        status: result.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('[device-code] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
