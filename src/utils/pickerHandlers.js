/**
 * Picker Handlers - Game-specific logic for inserting picker content
 *
 * Each handler receives:
 * - data: The data object from the picker's onSelect callback
 * - editorApi: The editor API with insertAtCursor method
 */

// Handle skill selection from picker
export const handleSkillSelect = (data, editorApi) => {
  const { skill, mode, alignment } = data;

  // Insert skill syntax into content
  // Format: {{skill:Fire Slash:detailed}} or {{skill:1:compact}}
  let skillSyntax = `{{skill:${skill.name}:${mode}}}`;

  // Apply alignment wrapper if needed
  if (alignment && alignment !== 'none') {
    let style;
    if (alignment === 'center') {
      style = 'display: flex; justify-content: center;';
    } else if (alignment === 'left') {
      style = 'display: flex; justify-content: flex-start;';
    } else if (alignment === 'right') {
      style = 'display: flex; justify-content: flex-end;';
    }
    skillSyntax = `<div style="${style}">\n\n${skillSyntax}\n\n</div>`;
  }

  // Insert at cursor position with trailing spaces and paragraph breaks
  // Two spaces at end of line create hard break, blank line separates blocks
  editorApi.insertAtCursor(`\n\n${skillSyntax}  \n\n`);
};

// Handle equipment selection from picker
export const handleEquipmentSelect = (data, editorApi) => {
  const { equipment, mode, alignment } = data;

  // Insert equipment syntax into content
  // Format: {{equipment:Innocence:detailed}} or {{equipment:1:compact}}
  let equipmentSyntax = `{{equipment:${equipment.name}:${mode}}}`;

  // Apply alignment wrapper if needed
  if (alignment && alignment !== 'none') {
    let style;
    if (alignment === 'center') {
      style = 'display: flex; justify-content: center;';
    } else if (alignment === 'left') {
      style = 'display: flex; justify-content: flex-start;';
    } else if (alignment === 'right') {
      style = 'display: flex; justify-content: flex-end;';
    }
    equipmentSyntax = `<div style="${style}">\n\n${equipmentSyntax}\n\n</div>`;
  }

  // Insert at cursor position with trailing spaces and paragraph breaks
  // Two spaces at end of line create hard break, blank line separates blocks
  editorApi.insertAtCursor(`\n\n${equipmentSyntax}  \n\n`);
};

// Handle spirit selection from picker
export const handleSpiritSelect = (data, editorApi) => {
  const { spirit, mode, alignment, level, inline = true } = data;

  // Insert spirit syntax into content
  // Format: {{spirit:Loar:detailed:4:inline}} or {{spirit:Loar:compact:4:block}}
  const displayType = inline ? 'inline' : 'block';
  let spiritSyntax = `{{spirit:${spirit.name}:${mode}:${level}:${displayType}}}`;

  // Apply alignment wrapper if needed
  if (alignment && alignment !== 'none') {
    let style;
    if (alignment === 'center') {
      style = 'display: flex; justify-content: center;';
    } else if (alignment === 'left') {
      style = 'display: flex; justify-content: flex-start;';
    } else if (alignment === 'right') {
      style = 'display: flex; justify-content: flex-end;';
    }
    spiritSyntax = `<div style="${style}">\n\n${spiritSyntax}\n\n</div>`;
  }

  // Insert at cursor position with trailing spaces and paragraph breaks
  // Two spaces at end of line create hard break, blank line separates blocks
  editorApi.insertAtCursor(`\n\n${spiritSyntax}  \n\n`);
};

// Handle battle loadout selection from picker
export const handleBattleLoadoutSelect = (data, editorApi) => {
  const { syntax } = data;

  // Insert battle loadout syntax into content
  // Format: {{battle-loadout:userId:loadoutId:mode}}
  editorApi.insertAtCursor(`\n\n${syntax}  \n\n`);
};

// Handle skill build selection from picker
export const handleSkillBuildSelect = (data, editorApi) => {
  const { syntax } = data;

  // Insert skill build syntax into content
  // Format: {{skill-build:userId:buildId:mode}}
  editorApi.insertAtCursor(`\n\n${syntax}  \n\n`);
};
