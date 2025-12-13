---
title: Creating Content
description: Learn how to create and organize wiki pages
tags: [content, markdown, pages]
category: Guides
date: 2025-12-13
---

# Creating Content

This guide shows you how to create new pages and organize content in your wiki.

## Creating a New Page

### 1. Choose a Section

Decide which section your page belongs to:
- `getting-started/` - Introductory content
- `guides/` - Step-by-step tutorials
- `reference/` - Technical documentation

### 2. Create the Markdown File

Create a new `.md` file in the appropriate section:

```bash
# Example: Create a troubleshooting guide
touch content/guides/troubleshooting.md
```

### 3. Add Frontmatter

Every page needs YAML frontmatter at the top:

```markdown
---
title: Page Title
description: A brief description of the page
tags: [tag1, tag2, tag3]
category: Category Name
date: 2025-12-13
---

# Page Title

Your content here...
```

#### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Page title (shows in browser tab) |
| `description` | Yes | Brief description (for SEO and search) |
| `tags` | No | Array of tags for categorization |
| `category` | No | Category name |
| `date` | No | Publication date (YYYY-MM-DD) |

### 4. Write Your Content

Use [GitHub Flavored Markdown](markdown-syntax) to write your content.

```markdown
# Main Heading

Introduction paragraph.

## Section 1

Content for section 1.

### Subsection

More detailed content.

## Section 2

```python
# Code blocks are supported
def hello_world():
    print("Hello, World!")
```

## 5. Build Search Index

After creating or updating content, rebuild the search index:

```bash
npm run build:search
```

This makes your new page searchable.

## Accessing Your Page

Pages are accessible via URL:

```
Format: /#/{section}/{page-name}

Examples:
- content/guides/troubleshooting.md → /#/guides/troubleshooting
- content/getting-started/faq.md → /#/getting-started/faq
```

## Content Best Practices

### File Naming

- ✅ Use lowercase: `my-page.md`
- ✅ Use hyphens: `getting-started.md`
- ❌ Avoid spaces: `my page.md`
- ❌ Avoid special chars: `my_page!.md`

### Page Structure

```markdown
---
title: Your Title
description: Description here
tags: [relevant, tags]
category: Category
date: 2025-12-13
---

# Introduction

Brief overview of the page.

## Main Content

Detailed information organized in sections.

### Subsections

Break down complex topics.

## Examples

Provide code examples or screenshots.

## Next Steps

Link to related pages or further reading.
```

### Images

Place images in `public/images/`:

```markdown
![Alt text](/images/screenshot.png)
```

### Internal Links

Link to other pages:

```markdown
[Getting Started](/getting-started)
[Installation Guide](/getting-started/installation)
[Guides](/guides)
```

### Code Blocks

Use fenced code blocks with language specification:

```markdown
​```javascript
console.log("Hello, World!");
​```

​```bash
npm run dev
​```

​```python
def greet(name):
    print(f"Hello, {name}!")
​```
```

## Advanced Features

### Table of Contents

The wiki automatically generates a table of contents from your headings.

Use H2 (`##`) and H3 (`###`) for best results.

### Syntax Highlighting

Supported languages:
- JavaScript, TypeScript, JSX, TSX
- Python, Java, C, C++, C#
- HTML, CSS, SCSS
- Bash, Shell
- JSON, YAML, TOML
- Markdown
- And many more!

### Markdown Extensions

- ✅ Tables
- ✅ Task lists
- ✅ Strikethrough
- ✅ Autolinks
- ✅ Footnotes

## Organizing Content

### Index Pages

Each section should have an `index.md`:

```
content/
├── getting-started/
│   └── index.md          # Section overview
├── guides/
│   └── index.md          # List of guides
└── reference/
    └── index.md          # Reference docs
```

### Logical Grouping

Group related pages together:

```
content/guides/
├── index.md
├── basic-usage.md
├── advanced-features.md
└── troubleshooting.md
```

### Navigation

Link between pages to create a logical flow:

```markdown
← [Previous: Installation](installation) | [Next: Configuration](configuration) →
```

## Tips for Great Content

1. **Start Simple** - Begin with core topics
2. **Use Examples** - Show real-world usage
3. **Add Visuals** - Screenshots and diagrams help
4. **Link Internally** - Connect related pages
5. **Update Regularly** - Keep content current
6. **Get Feedback** - Let users suggest improvements

## Testing Your Content

Before publishing:

1. **Preview Locally** - Check formatting with `npm run dev`
2. **Test Links** - Ensure all links work
3. **Check Search** - Run `npm run build:search` and test
4. **Review on Mobile** - Verify responsive design

## Next Steps

- [Markdown Syntax Guide](markdown-syntax)
- [Using Tags and Categories](using-tags)
- [Customizing Your Wiki](configuration)
