/**
 * Cloudflare Pages Function: Delete Data (Universal)
 * Handles deleting skill builds, battle loadouts, spirit collection, and spirit builds
 *
 * POST /api/delete-data
 * Body: {
 *   type: 'skill-build' | 'battle-loadout' | 'my-spirit' | 'spirit-build',
 *   username: string,
 *   userId: number,
 *   itemId?: string (for skill-build/battle-loadout/spirit-build),
 *   spiritId?: string (for my-spirit)
 * }
 */

import { deleteData } from '../../netlify/functions/shared/dataOperations.js';
import { validateDataType, validateDeleteData, getEnvConfig } from '../../netlify/functions/shared/utils.js';

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
    const { type, username, userId, itemId, spiritId } = data;

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
    const dataValidation = validateDeleteData(data, type);
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
      console.error('[delete-data]', envConfig.error);
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { botToken, owner, repo } = envConfig;

    // Determine delete ID based on type
    const deleteId = type === 'my-spirit' ? spiritId : itemId;

    // Delete data
    const result = await deleteData({
      botToken,
      owner,
      repo,
      type,
      username,
      userId,
      deleteId
    });

    return new Response(
      JSON.stringify(result.body),
      {
        status: result.statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[delete-data] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
