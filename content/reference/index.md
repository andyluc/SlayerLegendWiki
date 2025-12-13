---
title: Reference
description: Technical reference documentation
tags: [reference, documentation, api]
category: Reference
date: 2025-12-13
---

# Reference Documentation

Technical reference and API documentation for your wiki.

## Configuration Reference

### wiki-config.json

Complete reference for wiki configuration file.

```json
{
  "wiki": {
    "title": "string - Wiki title",
    "description": "string - Wiki description",
    "logo": "string - Path to logo image",
    "repository": {
      "owner": "string - GitHub username/org",
      "repo": "string - Repository name",
      "branch": "string - Default branch (usually 'main')",
      "contentPath": "string - Path to content directory"
    }
  },
  "sections": [
    {
      "id": "string - Unique section ID",
      "title": "string - Display title",
      "path": "string - URL path",
      "icon": "string - Optional emoji or icon",
      "showInHeader": "boolean - Show in navigation",
      "allowContributions": "boolean - Allow editing",
      "order": "number - Display order"
    }
  ],
  "features": {
    "search": "boolean - Enable search",
    "tableOfContents": "boolean - Show TOC",
    "pageHistory": "boolean - Show Git history",
    "editPages": "boolean - Allow editing",
    "darkMode": "boolean - Enable dark mode",
    "tags": "boolean - Enable tags"
  },
  "theme": {
    "primaryColor": "string - Hex color code"
  }
}
```

## Frontmatter Reference

Required and optional fields for page frontmatter:

### Required Fields

```yaml
---
title: string          # Page title
description: string    # Page description
---
```

### Optional Fields

```yaml
---
tags: array           # ["tag1", "tag2"]
category: string      # Category name
date: string         # YYYY-MM-DD format
author: string       # Author name
---
```

## File Structure Reference

```
your-wiki/
├── wiki-framework/              # Framework submodule
│   ├── src/                     # React components
│   ├── scripts/                 # Build scripts
│   ├── vite.config.base.js     # Base Vite config
│   └── package.json             # Framework dependencies
├── content/                     # Markdown content
│   ├── getting-started/
│   ├── guides/
│   └── reference/
├── public/                      # Static assets
│   ├── images/
│   └── logo.svg
├── logs/                        # Debug logs (dev only)
├── node_modules/                # Dependencies
├── dist/                        # Build output
├── wiki-config.json            # Wiki configuration
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
├── index.html                   # HTML entry point
├── main.jsx                     # JavaScript entry
├── .env.local                   # Environment variables
├── .gitignore                   # Git ignore patterns
└── README.md                    # Project documentation
```

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run build:search` | Build search index |
| `npm run lint` | Lint code (if configured) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GITHUB_CLIENT_ID` | No | GitHub OAuth Client ID |
| `VITE_WIKI_REPO_OWNER` | No | Repository owner |
| `VITE_WIKI_REPO_NAME` | No | Repository name |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open search |
| `Ctrl+Shift+D` | Toggle dev tools panel |
| `Escape` | Close modals/dialogs |

## Markdown Extensions

Supported markdown features:

- **GitHub Flavored Markdown (GFM)**
- Tables
- Task lists
- Strikethrough
- Autolinks
- Syntax highlighting
- Footnotes
- Heading anchors
- Auto-generated TOC

## URL Structure

```
Base URL: /#/

Pages:
  /#/{section}/{page}
  Example: /#/guides/creating-content

Sections:
  /#/{section}
  Example: /#/getting-started

Search:
  /#/search
  /#/search?q=query

Edit Page:
  /#/{section}/{page}/edit
  Example: /#/guides/creating-content/edit

Page History:
  /#/{section}/{page}/history
  Example: /#/guides/creating-content/history
```

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## Framework API

### useWikiConfig Hook

```javascript
import { useWikiConfig } from './hooks/useWikiConfig';

const { config, loading, error } = useWikiConfig();
```

### useSection Hook

```javascript
import { useSection } from './hooks/useWikiConfig';

const section = useSection('getting-started');
```

### useSearch Hook

```javascript
import { useSearch } from './hooks/useSearch';

const { searchIndex, fuse, loading, error } = useSearch();
```

## Support

- [Framework Repository](https://github.com/BenDol/GithubWiki)
- [Issues & Bug Reports](https://github.com/yourusername/your-wiki/issues)
- [Discussions](https://github.com/yourusername/your-wiki/discussions)
