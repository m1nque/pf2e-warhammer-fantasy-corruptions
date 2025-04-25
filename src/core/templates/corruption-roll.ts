

export interface CorruptionRoll {
  content: string;
  type: 'reflex' | 'will' | 'fortitude';
  dc: number;
  proficiency: number;  
}

export function appendCorruptionSaveButton(roll: CorruptionRoll) {

  const corruptionIcon = ``;

    const willSave = `
    <div class="chaos-conditions-will-save">
      <button type="button" data-action="will-save">${corruptionIcon} Will Save</button>
    </div>
  `;

}