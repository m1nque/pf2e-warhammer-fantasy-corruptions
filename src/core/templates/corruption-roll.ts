

export interface CorruptionRoll {
  content: string;
  type: 'reflex' | 'will' | 'fortitude';
  dc?: number;
  proficiency: number;  
}

export function appendCorruptionSaveButton(roll: CorruptionRoll) {

  const action = `corruption${roll.type}-save`;

  const corruptionIcon = ``;

    const willSave = `
    <div class="chaos-conditions-${action}">
      <button type="button" data-action="${action}">${corruptionIcon} Will Save</button>
    </div>
  `;

}