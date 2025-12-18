# Cloudflare Pages Deployment Guide

This wiki supports deployment to both **Netlify** and **Cloudflare Pages**. This guide explains how to deploy to Cloudflare Pages while maintaining full compatibility with Netlify.

## Architecture

The codebase uses a **dual-platform architecture** that automatically detects the hosting platform and adjusts endpoints accordingly:

```
netlify/functions/shared/     # Shared business logic (platform-agnostic)
├── utils.js                  # Common utilities and validation
├── githubBot.js              # GitHub bot operations
├── dataOperations.js         # Load, save, delete operations
└── oauth.js                  # OAuth proxy operations

netlify/functions/            # Netlify Functions (Netlify-specific adapters)
├── github-bot.js
├── save-data.js
├── load-data.js
├── delete-data.js
├── access-token.js
└── device-code.js

functions/api/                # Cloudflare Pages Functions (Cloudflare-specific adapters)
├── github-bot.js
├── save-data.js
├── load-data.js
├── delete-data.js
├── access-token.js
└── device-code.js

src/utils/apiEndpoints.js     # Platform detection and endpoint routing (parent project)
wiki-framework/src/utils/apiEndpoints.js  # Platform detection (framework)
```

## Platform Detection

The system automatically detects the platform at runtime:

1. **Development**: `import.meta.env.DEV === true`
   - Uses Vite dev server proxy for OAuth
   - Direct URLs for data operations

2. **Netlify**: Default production platform
   - Functions at `/.netlify/functions/`
   - Detected by absence of Cloudflare-specific env vars

3. **Cloudflare Pages**:
   - Functions at `/api/`
   - Detected by `VITE_CF_PAGES=1` or `VITE_PLATFORM=cloudflare`

## Cloudflare Pages Setup

### 1. Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Connect your GitHub repository
4. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: (leave empty)

### 2. Configure Environment Variables

In Cloudflare Pages project settings → **Environment variables**, add:

```bash
# Required
WIKI_BOT_TOKEN=<your_bot_github_token>
WIKI_REPO_OWNER=<your_github_username>
WIKI_REPO_NAME=<your_repo_name>
VITE_GITHUB_CLIENT_ID=<your_github_oauth_client_id>

# Cloudflare-specific
VITE_PLATFORM=cloudflare
VITE_CF_PAGES=1

# Optional (if different from production)
VITE_WIKI_REPO_OWNER=<your_github_username>
VITE_WIKI_REPO_NAME=<your_repo_name>
```

**Important**: Cloudflare Pages automatically sets `CF_PAGES=1` at build time, but you need to expose it to Vite by setting `VITE_CF_PAGES=1` in environment variables.

### 3. Update GitHub OAuth App

Update your GitHub OAuth App callback URL to include Cloudflare Pages domain:

- Callback URL: `https://your-site.pages.dev/` (or your custom domain)

### 4. Deploy

Push to your repository's main branch. Cloudflare Pages will automatically:
1. Build your application
2. Deploy Cloudflare Functions from `functions/api/`
3. Serve your static assets

## Netlify Setup (Existing)

Your existing Netlify setup continues to work unchanged:

### Environment Variables

```bash
# Required
WIKI_BOT_TOKEN=<your_bot_github_token>
WIKI_REPO_OWNER=<your_github_username>
WIKI_REPO_NAME=<your_repo_name>
VITE_GITHUB_CLIENT_ID=<your_github_oauth_client_id>

# Optional
VITE_PLATFORM=netlify
```

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Function Differences

### Netlify Functions

**Signature**:
```javascript
export async function handler(event) {
  // event.httpMethod
  // event.body
  // event.queryStringParameters
  // process.env.VAR_NAME

  return {
    statusCode: 200,
    body: JSON.stringify({ data: 'value' })
  };
}
```

**Location**: `netlify/functions/`

### Cloudflare Pages Functions

**Signature**:
```javascript
export async function onRequest(context) {
  // context.request - Request object
  // context.env - Environment variables
  // await context.request.json()
  // new URL(context.request.url).searchParams

  return new Response(
    JSON.stringify({ data: 'value' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
```

**Location**: `functions/api/`

## Shared Business Logic

Both platforms use the same business logic from `netlify/functions/shared/`:

- **utils.js**: Validation, error handling, configuration
- **githubBot.js**: All GitHub bot operations
- **dataOperations.js**: Load, save, delete operations
- **oauth.js**: OAuth proxy operations

This ensures:
- **No code duplication**: Business logic written once
- **Consistency**: Same behavior on both platforms
- **Maintainability**: Update logic in one place

## API Endpoint Resolution

The client code automatically selects the correct endpoints:

```javascript
import { getSaveDataEndpoint } from '../utils/apiEndpoints.js';

// Automatically resolves to:
// - Development: '/.netlify/functions/save-data' (or Vite proxy)
// - Netlify: '/.netlify/functions/save-data'
// - Cloudflare: '/api/save-data'

fetch(getSaveDataEndpoint(), {
  method: 'POST',
  body: JSON.stringify(data)
});
```

## Testing Locally

### Netlify Dev

```bash
npm run dev
# or
netlify dev
```

This runs both Vite and Netlify Functions locally at `http://localhost:8888`.

### Cloudflare Wrangler (Coming Soon)

```bash
# Install Wrangler
npm install -g wrangler

# Run Pages locally
wrangler pages dev dist --compatibility-date=2024-01-01

# Note: You may need to build first
npm run build
```

## Migration Checklist

### From Netlify to Cloudflare Pages

- [x] All serverless functions ported to Cloudflare Pages format
- [x] Shared business logic layer created
- [x] API endpoint utilities implemented
- [x] Framework services updated
- [x] Parent project components updated
- [ ] Test all features on Cloudflare Pages staging
- [ ] Update DNS settings (if using custom domain)
- [ ] Update GitHub OAuth callback URLs
- [ ] Monitor for any platform-specific issues

### Maintaining Both Platforms

To support both Netlify and Cloudflare deployments:

1. **Keep both function directories**:
   - `netlify/functions/` for Netlify
   - `functions/api/` for Cloudflare

2. **Update shared logic first**:
   - Make changes in `netlify/functions/shared/`
   - Both platforms use the same business logic

3. **Test on both platforms**:
   - Deploy to Netlify staging/production
   - Deploy to Cloudflare Pages preview/production

4. **Use platform detection**:
   - Never hardcode platform-specific URLs
   - Always use `apiEndpoints.js` utilities

## Troubleshooting

### "Server configuration error" in Functions

**Problem**: Functions return 500 error with "Server configuration error"

**Solution**: Check environment variables are set correctly:
- `WIKI_BOT_TOKEN`
- `WIKI_REPO_OWNER`
- `WIKI_REPO_NAME`

### OAuth Not Working

**Problem**: GitHub OAuth fails or redirects incorrectly

**Solution**:
1. Verify `VITE_GITHUB_CLIENT_ID` is set
2. Check GitHub OAuth App callback URL includes your domain
3. Ensure `VITE_PLATFORM` is set correctly

### Functions Not Found (404)

**Problem**: Fetch calls return 404 for function endpoints

**Solution**:
- **Cloudflare**: Ensure `VITE_CF_PAGES=1` is set
- **Netlify**: Verify `netlify.toml` has correct `functions` path
- Check platform detection logs in browser console

### Wrong Endpoints in Production

**Problem**: Production site uses development endpoints

**Solution**:
- Ensure `import.meta.env.DEV` is false in production
- Check build logs for platform detection
- Verify environment variables are set

## Performance Considerations

### Cloudflare Pages

**Advantages**:
- **Edge Functions**: Run closer to users globally
- **Faster Cold Starts**: V8 Isolates vs. containers
- **Unlimited Requests**: No function invocation limits on paid plans
- **Free Tier**: 100,000 requests/day

**Limitations**:
- **CPU Time**: 50ms/request on free tier (30s on paid)
- **Memory**: 128MB per request
- **Bundle Size**: 1MB per function

### Netlify

**Advantages**:
- **Longer Execution**: 10s on free tier (26s on paid)
- **More Memory**: 1GB per function
- **Larger Bundle**: 50MB per function

**Limitations**:
- **Request Limits**: 125,000 requests/month on free tier
- **Cold Starts**: Slightly slower than Cloudflare

## Support

For issues specific to:
- **Cloudflare Pages**: [Cloudflare Community](https://community.cloudflare.com)
- **Netlify**: [Netlify Support](https://answers.netlify.com)
- **Wiki Framework**: [GitHub Issues](https://github.com/BenDol/GithubWiki/issues)
