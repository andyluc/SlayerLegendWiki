# Wiki Configuration Management

## Source of Truth

**`wiki-config.json` (root directory)** is the single source of truth for your wiki configuration.

## How It Works

### Automatic Copy Process
The framework needs `wiki-config.json` to be publicly accessible at runtime (the browser fetches it). To maintain a single source of truth while meeting this requirement:

1. **Edit only the root `wiki-config.json`** - This is committed to git
2. **`public/wiki-config.json`** is auto-generated - This is NOT committed (in .gitignore)
3. **Build scripts automatically copy** root → public

### When Config is Copied

The config is automatically copied from root to public:

- **Before `npm run dev`** - via `predev` script
- **Before `npm run build`** - via `prebuild` script
- **Manually** - via `node scripts/copyConfig.js`

### Important Rules

✅ **DO:**
- Edit `wiki-config.json` in the root directory
- Commit changes to root `wiki-config.json`
- Run `npm run dev` or `npm run build` after config changes

❌ **DON'T:**
- Edit `public/wiki-config.json` directly (it will be overwritten)
- Commit `public/wiki-config.json` to git (it's in .gitignore)
- Manually copy the config (scripts do this automatically)

## Configuration Schema

Your `wiki-config.json` should follow this structure:

```json
{
  "wiki": {
    "title": "Your Wiki Title",
    "description": "Your wiki description",
    "logo": "/logo.svg",
    "repository": {
      "owner": "github-username",
      "repo": "repo-name",
      "branch": "main",
      "contentPath": "content"
    }
  },
  "sections": [
    {
      "id": "section-id",
      "title": "Section Title",
      "path": "section-path",
      "icon": "🎮",
      "showInHeader": true,
      "allowContributions": true,
      "order": 1
    }
  ],
  "features": {
    "search": true,
    "tableOfContents": true,
    "pageHistory": true,
    "editPages": true,
    "darkMode": true,
    "tags": true,
    "buildSharing": true,
    "calculators": true,
    "progressTracking": true
  },
  "theme": {
    "primaryColor": "#dc2626"
  }
}
```

## Making Configuration Changes

### Standard Workflow (Recommended)
1. **Start dev server:**
   ```bash
   npm run dev
   ```
   This automatically runs both the Vite dev server AND the config watcher.

2. **Edit** `wiki-config.json` - changes auto-copy to public/
3. **Refresh browser** (Ctrl+Shift+R) to see changes

That's it! The config watcher is now built into `npm run dev`.

### Alternative: Manual Copy
If you need to run the dev server without the config watcher:
```bash
npm run dev:server    # Dev server only
```

Then manually copy when needed:
```bash
node scripts/copyConfig.js
```

### For Production Builds
```bash
npm run build
```
The `prebuild` script copies config and builds search index automatically.

## Troubleshooting

**Config changes not appearing?**
- Make sure you edited the ROOT `wiki-config.json`, not `public/wiki-config.json`
- Restart the dev server (`npm run dev`)
- Hard refresh browser (Ctrl+Shift+R)

**"Config not found" error?**
- Run `node scripts/copyConfig.js` manually
- Check that root `wiki-config.json` exists and is valid JSON

## Files Involved

```
wiki-project/
├── wiki-config.json              # ✅ Edit this (committed to git)
├── public/
│   └── wiki-config.json          # ❌ Auto-generated (not committed)
├── scripts/
│   └── copyConfig.js             # Copy script
└── .gitignore                    # Ignores public/wiki-config.json
```
