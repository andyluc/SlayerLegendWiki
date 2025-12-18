/**
 * Cloudflare Pages Function: Load Data (Universal)
 * Handles loading skill builds, battle loadouts, spirit collection, and spirit builds
 *
 * GET /api/load-data?type=TYPE&userId=USER_ID
 * Query Params:
 *   type: 'skill-build' | 'battle-loadout' | 'my-spirit' | 'spirit-build'
 *   userId: number
 */

import { loadData } from '../../netlify/functions/shared/dataOperations.js';
import { validateDataType, validateLoadData, getEnvConfig } from '../../netlify/functions/shared/utils.js';

export async function onRequest(context) {
  const { request, env } = context;

  // Only allow GET
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Parse query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const userId = url.searchParams.get('userId');

    // Validate type
    const typeValidation = validateDataType(type);
    if (!typeValidation.valid) {
      return new Response(
        JSON.stringify({ error: typeValidation.error }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate required fields
    const dataValidation = validateLoadData({ type, userId });
    if (!dataValidation.valid) {
      return new Response(
        JSON.stringify({ error: dataValidation.error }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get environment configuration
    const envConfig = getEnvConfig(env);
    if (envConfig.error) {
      console.error('[load-data]', envConfig.error);
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { botToken, owner, repo } = envConfig;

    // Load data
    const result = await loadData({
      botToken,
      owner,
      repo,
      type,
      userId
    });

    return new Response(
      JSON.stringify(result.body),
      {
        status: result.statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[load-data] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
