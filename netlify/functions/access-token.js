/**
 * Netlify Function: GitHub Device Flow - Access Token
 * Proxies GitHub device flow token polling request
 *
 * POST /.netlify/functions/access-token
 * Body: {
 *   client_id: string,
 *   device_code: string,
 *   grant_type: string
 * }
 */

import { pollAccessToken } from './shared/oauth.js';

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { client_id, device_code, grant_type } = JSON.parse(event.body);

    // Poll for access token
    const result = await pollAccessToken({
      client_id,
      device_code,
      grant_type
    });

    return {
      statusCode: result.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.body),
    };
  } catch (error) {
    console.error('[access-token] Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
}
