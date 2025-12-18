/**
 * Cloudflare Pages Function: GitHub Bot Operations
 * Handles all bot-authenticated GitHub operations
 *
 * POST /api/github-bot
 * Body: {
 *   action: string,
 *   params: object
 * }
 */

import { routeBotAction } from '../../netlify/functions/shared/githubBot.js';
import { validateBotAction, getEnvConfig } from '../../netlify/functions/shared/utils.js';

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
    const { action, params } = await request.json();

    // Validate action
    const validation = validateBotAction(action);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get environment configuration
    const envConfig = getEnvConfig(env);
    if (envConfig.error) {
      console.error('[github-bot]', envConfig.error);
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { botToken, owner, repo } = envConfig;

    // Route to appropriate handler
    const result = await routeBotAction(action, {
      botToken,
      owner,
      repo,
      params
    });

    return new Response(
      JSON.stringify(result.body),
      {
        status: result.statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[github-bot] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
