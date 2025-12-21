/**
 * Netlify Function: GitHub Device Flow - Initiate
 * Proxies GitHub device flow initiation request
 *
 * POST /.netlify/functions/device-code
 * Body: {
 *   client_id: string,
 *   scope: string
 * }
 */

import { initiateDeviceFlow } from './shared/oauth.js';

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
    const { client_id, scope } = JSON.parse(event.body);

    // Initiate device flow
    const result = await initiateDeviceFlow({
      client_id,
      scope
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
    console.error('[device-code] Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
}
