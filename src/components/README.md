# Parent Project Components

This directory contains **Slayer Legend-specific components** that are too specialized for the generic wiki framework.

## Directory Structure

```
src/components/
└── calculators/          # Game-specific calculator components
    ├── DamageCalculator.jsx
    ├── EnhancementCalculator.jsx
    ├── FusionCalculator.jsx
    ├── StatCalculator.jsx
    └── index.js
```

## Calculators

### DamageCalculator
Calculates damage output based on Slayer Legend mechanics:
- Attack stat
- Critical Damage %
- Critical Chance %
- Elemental Bonus %

### EnhancementCalculator
Calculates gold costs for equipment enhancement in Slayer Legend:
- Current level
- Target level
- Gold per level formula

### FusionCalculator
Calculates equipment fusion requirements:
- 5:1 fusion ratio (5 items → 1 higher grade)
- Target grade selection
- Result probability

### StatCalculator
Calculates stat changes after promotion:
- Base stats
- Promotion tier multipliers
- Stat growth formulas

## Usage in Markdown

These components can be used directly in markdown files:

```markdown
---
title: Damage Calculator
---

# Calculate Your Damage

<DamageCalculator />
```

## Adding New Components

When adding new components, ask yourself:

### Add here (`src/components/`) if:
- ✅ Specific to Slayer Legend mechanics
- ✅ Uses game-specific formulas or data
- ✅ Wouldn't work for other wikis

### Add to framework (`wiki-framework/src/components/`) if:
- ✅ Generic and reusable
- ✅ Works with any data structure
- ✅ Solves common wiki problems

**See `/COMPONENTS-MOVED.md` for detailed guidelines.**

## Imports

These components import common UI elements from the framework:

```javascript
import Button from '../../wiki-framework/src/components/common/Button';
```

This ensures consistent styling while keeping game-specific logic separate.
