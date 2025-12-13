---
title: Welcome
description: Getting started with your wiki
tags: [introduction, welcome]
category: Getting Started
date: 2025-12-13
---

# Welcome to Your Wiki

This is your wiki homepage. Edit this file at `content/getting-started/index.md` to customize this page.

## Quick Start

1. **Edit Configuration**: Modify `wiki-config.json` to customize your wiki title, sections, and settings
2. **Add Content**: Create new markdown files in the `content/` directories
3. **Customize Theme**: Edit `tailwind.config.js` for styling changes
4. **Build Search**: Run `npm run build:search` after adding content

## Project Structure

```
your-wiki/
├── wiki-framework/        # Framework submodule (don't edit!)
├── content/               # Your markdown content
│   ├── getting-started/
│   ├── guides/
│   └── reference/
├── public/                # Static assets
├── wiki-config.json      # Wiki configuration
└── .env.local            # Environment variables
```

## Features

- 📝 **Markdown-Powered** - Write content in GitHub Flavored Markdown
- 🎨 **Modern UI** - Clean, responsive design with dark mode
- 🔍 **Full-Text Search** - Fast client-side search
- 🔐 **GitHub Authentication** - Secure OAuth login
- ✏️ **Collaborative Editing** - Edit pages via pull requests
- 📜 **Version History** - Track changes with Git
- 🚀 **Easy Deployment** - Deploy to GitHub Pages

## Next Steps

1. [Installation Guide](installation)
2. [Configuration Guide](/guides/configuration)
3. [Content Creation](/guides/creating-content)

## Need Help?

- [Framework Documentation](https://github.com/BenDol/GithubWiki)
- [Report Issues](https://github.com/yourusername/your-wiki/issues)

Happy wiki building! 🎉
