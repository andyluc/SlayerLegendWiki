---
title: Installation
description: How to install and set up your wiki
tags: [installation, setup]
category: Getting Started
date: 2025-12-13
---

# Installation Guide

This guide will walk you through setting up your wiki for local development.

## Prerequisites

- **Node.js** 18+ and npm
- **Git**
- A **GitHub account**

## Installation Steps

### 1. Clone the Repository

```bash
git clone --recursive https://github.com/yourusername/your-wiki.git
cd your-wiki
```

> **Note**: The `--recursive` flag ensures the wiki-framework submodule is cloned as well.

If you forgot `--recursive`, initialize the submodule manually:

```bash
git submodule init
git submodule update
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including React, Vite, Tailwind CSS, and the markdown processor.

### 3. Configure Environment Variables

Create a `.env.local` file for local development:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your GitHub OAuth Client ID (optional, only needed for editing features):

```env
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
VITE_WIKI_REPO_OWNER=yourusername
VITE_WIKI_REPO_NAME=your-wiki
```

> **Tip**: You can skip this step if you only want to view content without GitHub authentication.

### 4. Customize Configuration

Edit `wiki-config.json` to customize your wiki:

```json
{
  "wiki": {
    "title": "My Awesome Wiki",
    "description": "My documentation site",
    "repository": {
      "owner": "yourusername",
      "repo": "your-wiki",
      "branch": "main",
      "contentPath": "content"
    }
  }
}
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your wiki!

## Directory Structure

After installation, your project should look like this:

```
your-wiki/
├── node_modules/          # Installed dependencies
├── wiki-framework/        # Framework submodule
├── content/               # Your markdown content
├── public/                # Static assets
├── dist/                  # Build output (after npm run build)
├── .env.local            # Your environment variables
└── package.json          # Dependencies
```

## Next Steps

- [Create your first page](/guides/creating-content)
- [Configure sections](/guides/configuration)
- [Set up GitHub OAuth](/guides/github-oauth)
- [Deploy to GitHub Pages](/guides/deployment)

## Troubleshooting

### Submodule Not Cloned

```bash
git submodule update --init --recursive
```

### Port 5173 Already in Use

The dev server will automatically try the next available port (5174, 5175, etc.).

### Dependencies Installation Failed

Try clearing the cache:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Framework Updates Not Showing

Restart the dev server:

```bash
# Press Ctrl+C to stop
npm run dev
```
