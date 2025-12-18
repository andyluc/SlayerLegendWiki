/**
 * Cloudflare Pages Function: Save Data (Universal)
 * Handles saving skill builds, battle loadouts, spirit collection, and grid submissions
 *
 * POST /api/save-data
 * Body: {
 *   type: 'skill-build' | 'battle-loadout' | 'my-spirit' | 'spirit-build' | 'grid-submission',
 *   username: string,
 *   userId: number,
 *   item: object,
 *   weaponId?: string (required for grid-submission)
 * }
 */

import { saveData } from '../../netlify/functions/shared/dataOperations.js';
import { validateDataType, validateSaveData, getEnvConfig } from '../../netlify/functions/shared/utils.js';

export async function onRequest(context) {
  const { request, env } = context;

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
    const data = await request.json();
    const { type, username, userId, item, weaponId } = data;

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
    const dataValidation = validateSaveData(data, type);
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
      console.error('[save-data]', envConfig.error);
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { botToken, owner, repo } = envConfig;

    // Save data
    const result = await saveData({
      botToken,
      owner,
      repo,
      type,
      username,
      userId,
      item,
      weaponId
    });

    return new Response(
      JSON.stringify(result.body),
      {
        status: result.statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[save-data] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
