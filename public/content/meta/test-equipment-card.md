---
title: Equipment Card Test
description: Testing the EquipmentCard component
tags: [test, equipment, component]
category: Testing
date: 2025-12-13
---

# Equipment Card Test Page

This page tests the EquipmentCard component with various equipment items.

## Test 1: Load by Name

### Early Game Weapon
<!-- equipment:Innocence -->

### Mid Game Weapon
<!-- equipment:Effort -->

### Late Game Weapon
<!-- equipment:Pride -->

## Test 2: Load by ID

### Equipment #1
<!-- equipment:1 -->

### Equipment #13
<!-- equipment:13 -->

### Equipment #23
<!-- equipment:23 -->

## Test 3: Multiple Cards in Sequence

<!-- equipment:Innocence -->
<!-- equipment:Coolness -->
<!-- equipment:Desire -->

## Test 4: Different Rarity Tiers

### Common Tier
<!-- equipment:Innocence -->

### Great Tier
<!-- equipment:Effort -->

### Rare Tier
<!-- equipment:Pride -->

### Epic Tier
<!-- equipment:Faith -->

### Legendary Tier
<!-- equipment:Willingness -->

## Test 5: Text Between Cards

The Innocence sword is the first weapon:

<!-- equipment:Innocence -->

After some progression, you'll want to upgrade:

<!-- equipment:Effort -->

And eventually reach end game:

<!-- equipment:Willingness -->

## Expected Results

Each equipment card should display:
- ✅ Equipment image (if available)
- ✅ Equipment name as header
- ✅ Rarity badge (color-coded)
- ✅ Attack stat
- ✅ Cost stat
- ✅ Disassembly value
- ✅ Stage requirement
- ✅ Efficiency calculation
- ✅ Return rate percentage
- ✅ Progression milestone

## Notes

- Images may not appear for all equipment (this is normal)
- Rarity colors should match equipment cost
- All stats should format with commas for large numbers
- Cards should be responsive and work on mobile
- Dark mode should display correctly
