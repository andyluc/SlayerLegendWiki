---
title: Battle Loadouts
description: Comprehensive battle loadout manager with skills, spirits, and equipment configuration
tags: [tools, loadouts, battle, planning, configuration]
category: Tools
---

# Battle Loadouts

<div class="not-prose mb-6">
  <a href="/#/battle-loadouts" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
    🎯 Open Battle Loadouts
  </a>
</div>

Create, manage, and save complete battle configurations with our comprehensive loadout system that matches the game's Battle Settings interface.

## Features

### 🎮 Complete Battle Configuration
- **Named Loadouts**: Save multiple loadouts with custom names
- **Skills Section**: Integrate your Skill Builder builds (10 slots)
- **Spirits**: Configure accompanying spirits (coming soon)
- **Skill Stones**: Manage skill stone equipment (coming soon)
- **Promotion Abilities**: Select slayer promotion abilities (coming soon)
- **Familiars**: Configure familiar skills (coming soon)

### 💾 Save & Load System
- **Save Loadouts**: Store up to 10 named loadouts per user (GitHub-backed)
- **Load Saved**: Quickly switch between saved configurations
- **Auto-Update**: Updating a loadout with the same name saves changes
- **Delete Option**: Remove old loadouts you no longer need

### 🔗 Share & Export
- **Shareable URLs**: Generate unique URLs for your complete loadouts
- **Export/Import**: Download loadouts as JSON files
- **Load from URL**: Access shared loadouts instantly
- **Full Data Preservation**: All sections included in exports

### ⚡ Skill Builder Integration
- **Modal Popup**: Open Skill Builder without leaving the page
- **Seamless Saving**: Save skills directly to your loadout
- **Edit Anytime**: Update your skill build without losing other sections
- **Full Integration**: All Skill Builder features available

## How to Use

### Creating a Loadout

1. **Name Your Loadout**: Enter a custom name in the loadout name field
2. **Configure Skills**: Click "Create Build" to open Skill Builder modal
3. **Build Your Skills**: Select and configure up to 10 skills
4. **Save to Loadout**: Click "Save" in the modal to apply to loadout
5. **Add Other Sections**: Configure spirits, stones, etc. (when available)
6. **Save Loadout**: Click "Save Loadout" in the footer (requires sign-in)

### Managing Saved Loadouts

**Viewing Saved Loadouts:**
- Scroll to the "Saved Loadouts" panel
- See all your saved configurations with timestamps
- Shows when each was last updated

**Loading a Loadout:**
- Click on any saved loadout in the panel
- Confirm the load action (replaces current loadout)
- All sections are restored instantly

**Updating a Loadout:**
- Load the loadout you want to update
- Make your changes to any section
- Click "Save Loadout" with the same name
- Changes are saved automatically

**Deleting a Loadout:**
- Click the trash icon next to the saved loadout
- Confirm deletion
- Loadout is permanently removed

### Sharing Loadouts

**Share via URL:**
1. Configure your complete loadout
2. Click the **"Share"** button in the actions panel
3. URL is automatically copied to your clipboard
4. Share the link with friends or community

**Export as JSON:**
1. Click **"Export"** to download as JSON file
2. File includes loadout name and all configurations
3. Use for backup or sharing outside the wiki

**Import from JSON:**
1. Click **"Import"** and select a JSON file
2. Loadout is instantly loaded with all sections
3. Works with files exported from Battle Loadouts

## Loadout Components

### Skills Section
- **Skill Build Integration**: Full Skill Builder functionality
- **10 Skill Slots**: Configure your combat abilities
- **Build Name Display**: Shows which skill build is equipped
- **Edit Anytime**: Modify skills without affecting other sections

### Accompanying Spirit (Coming Soon)
Future feature for configuring spirit companions.

### Skill Stone (Coming Soon)
Future feature for managing skill stone equipment.

### Slayer Promotion Additional Ability (Coming Soon)
Future feature for selecting promotion-specific abilities.

### Familiar Skill (Coming Soon)
Future feature for configuring familiar combat skills.

## Tips & Tricks

### Loadout Organization
- **Create loadouts for different content**: PvP, Boss Fights, Farming, Events
- **Name descriptively**: "Fire AoE Farm", "Boss Single Target", "PvP Sustain"
- **Update regularly**: Keep loadouts current as you progress

### Efficient Workflow
- **Use Skill Builder modal**: No need to leave the page
- **Save frequently**: Prevent loss of configuration work
- **Test variations**: Save multiple versions to compare

### Save Slot Management
- **10 Loadout Limit**: Plan your most important configurations
- **Delete unused**: Free up space by removing old loadouts
- **Export backups**: Keep JSON backups of important loadouts

## Authentication & Storage

### Sign In Required
To save loadouts to your account:
- Sign in with GitHub (top-right user menu)
- Loadouts stored securely in GitHub issues
- Access from any device after sign-in

### Without Sign In
You can still:
- Create and configure loadouts
- Share via URL
- Export to JSON files
- Import from JSON files

But you cannot:
- Save loadouts to your account
- Access saved loadouts across devices

## Technical Details

The Battle Loadouts system is built with:
- React components with sticky UI elements
- GitHub Issues as backend storage
- Netlify serverless functions for save/load/delete
- URL-based loadout encoding for sharing
- JSON import/export for backup
- Modal pattern for builder integration
- Real-time save state feedback

## Future Enhancements

Planned features:
- **Spirit Builder**: Full spirit configuration
- **Skill Stone Builder**: Manage equipped skill stones
- **Promotion Ability Builder**: Select promotion abilities
- **Familiar Builder**: Configure familiar skills
- **Loadout Comparison**: Compare two loadouts side-by-side
- **Duplicate Loadout**: Copy existing loadouts as templates

<div class="not-prose mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
  <p class="text-sm text-blue-900 dark:text-blue-100 mb-2">
    <strong>Ready to configure your battle loadouts?</strong>
  </p>
  <a href="/#/battle-loadouts" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors">
    Launch Battle Loadouts →
  </a>
</div>
