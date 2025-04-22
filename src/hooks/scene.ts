import '@illandril/foundryvtt-types';

Hooks.on("renderSceneConfig", (app, html, data) => {
  // Scene 설정창이 열릴 때

  const corruptionFieldHtml = `
  <div class="form-group">
    <label>Chaos Corruption (Slaanesh)</label>
    <input type="number" name="flags.pf2e-warhammer-fantasy-corruptions.slaanesh" value="${getProperty(app.object.data.flags, 'pf2e-warhammer-fantasy-corruptions.slaanesh') ?? 0}" />
  </div>
  `;

  html.find('div.tab[data-tab="basic"]').append(corruptionFieldHtml);
});


