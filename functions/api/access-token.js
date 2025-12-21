/**
 * Cloudflare Pages Function: GitHub Device Flow - Access Token
 * Proxies GitHub device flow token polling request
 *
 * POST /api/access-token
 * Body: {
 *   client_id: string,
 *   device_code: string,
 *   grant_type: string
 * }
 */

import { pollAccessToken } from './_lib/oauth.js';

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
    const { client_id, device_code, grant_type } = await request.json();

    // Poll for access token
    const result = await pollAccessToken({
      client_id,
      device_code,
      grant_type
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
    console.error('[access-token] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
