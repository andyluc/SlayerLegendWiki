/**
 * Configuration Helper for Cloudflare Functions
 *
 * Gets configuration from environment variables instead of importing wiki-config.json
 * This is necessary because Cloudflare's bundler can't resolve imports outside the functions directory
 */

/**
 * Get wiki configuration from environment variables
 * @param {Object} env - Cloudflare environment object
 * @returns {Object} Wiki configuration
 */
export function getWikiConfig(env) {
  return {
    storage: {
      backend: env.STORAGE_BACKEND || 'github',
      owner: env.WIKI_REPO_OWNER,
      repo: env.WIKI_REPO_NAME,
    },
    repo: {
      owner: env.WIKI_REPO_OWNER,
      name: env.WIKI_REPO_NAME,
    },
  };
}
