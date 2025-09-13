import config from '../config';

export const khorneCorruptionRoll = async (message: ChatMessagePF2e) => {
  const context = message.getFlag('pf2e', 'context');
  if (!context || context.type !== 'attack-roll') return;

  const speaker = message.speaker;
  const actor = ChatMessage.getSpeakerActor(speaker);
  if (!actor) return;

  // 코른 오염 효과 존재 여부 확인
  const khorneEffect = actor.items.find(
    (item) => item.system.slug === 'chaos-corruptions-khorne-corruption'
  );
  if (!khorneEffect) return;
  console.log(`${config.MODULE_ID} | khorneEffect found`, khorneEffect);

  const corruptionLevel = khorneEffect.system?.badge?.value ?? 0;

  // 굴림 후, 추가 알림을 보내기
  //   const flavor = `
  // <b>코른 오염 효과 발생!</b><br>
  // 이 공격은 코른의 영향을 받았습니다.<br>
  // - 오염 스택: ${corruptionLevel}<br>
  // - 공격자가 <b>Will Save</b>를 시도했는지 확인해주세요.<br>
  // - 실패 시: AC가 가장 낮은 아군에게 공격 대상을 전환해야 합니다.<br>
  // - 대실패 시: <b>해당 공격이 명중하면 피해가 2배</b>입니다.
  // `;

  //   ChatMessage.create({
  //     speaker: speaker,
  //     content: flavor,
  //     whisper: ChatMessage.getWhisperRecipients("GM")
  //   });

  if (game.settings.get(config.MODULE_ID, 'notifyChat')) {
    await khorneEffect.toMessage(undefined, { create: true });
  }
};

/**
 *
 * @param encounterPf2e
 * @param round
 * @returns
 */
export const nurgleCorruptionRoll = async (
  combatantPf2e: CombatantPF2e,
  encounterPf2e: EncounterPF2e
) => {
  const actor = combatantPf2e.actor;
  if (!actor) return;

  // 오염 효과 존재 여부 확인
  const nurgleEffect = actor.items.find(
    (item) => item.system.slug === 'chaos-corruptions-nurgle-corruption'
  );
  if (!nurgleEffect) return;

  // console.log(`${config.MODULE_ID} | nurbleEffect found`, nurgleEffect);

  const corruptionLevel = nurgleEffect.system?.badge?.value ?? 0;

  // 굴림 후, 추가 알림을 보내기
  //   const flavor = `
  // <b>코른 오염 효과 발생!</b><br>
  // 이 공격은 코른의 영향을 받았습니다.<br>
  // - 오염 스택: ${corruptionLevel}<br>
  // - 공격자가 <b>Will Save</b>를 시도했는지 확인해주세요.<br>
  // - 실패 시: AC가 가장 낮은 아군에게 공격 대상을 전환해야 합니다.<br>
  // - 대실패 시: <b>해당 공격이 명중하면 피해가 2배</b>입니다.
  // `;

  //   ChatMessage.create({
  //     speaker: speaker,
  //     content: flavor,
  //     whisper: ChatMessage.getWhisperRecipients("GM")
  //   });

  if (game.settings.get(config.MODULE_ID, 'notifyChat')) {
    await nurgleEffect.toMessage(undefined, { create: true });
  }
};

const getAffectedAuras = (token: TokenPF2e) => {
  const tokenCenter = token.center;
  const inRangeAuras = [];

  // 모든 오라 인스턴스 순회
  for (const sourceToken of canvas.tokens.placeables) {
    if (token.id === sourceToken.id) continue; // 자기 자신은 제외
    if (!sourceToken.document.auras) continue; // 오라가 없는 토큰은 제외

    const auras = sourceToken.document.auras;

    // console.log("auras", auras);

    for (const [key, aura] of auras) {
      // console.log("Aura Slug:", aura.slug);
      // console.log("Radius:", aura.radius);
      // console.log("Effects:", aura.effects);

      const distance = canvas.grid.measureDistance(
        sourceToken.center,
        tokenCenter
      );
      // canvas.grid.measurePath(sourceToken.center, tokenCenter);
      const radius = aura.radius ?? 0;

      if (distance <= radius) {
        inRangeAuras.push({
          from: sourceToken.name,
          auraSlug: aura.slug,
          distance,
          radius
        });
      }
    }
  }
  // console.log("영향받는 오라 목록:", inRangeAuras);
  return inRangeAuras;
};

export const checkCorruptionAuras = async (
  combatantPf2e: CombatantPF2e,
  encounterPf2e: EncounterPF2e
) => {
  const corruptionSlugs = {
    'chaos-corruptions-chaos-undivided-aura':
      'chaos-corruptions-chaos-undivided-corruption',
    'chaos-corruptions-nurgle-aura': 'chaos-corruptions-nurgle-corruption',
    'chaos-corruptions-khorne-aura': 'chaos-corruptions-khorne-corruption',
    'chaos-corruptions-slaanesh-aura': 'chaos-corruptions-slaanesh-corruption',
    'chaos-corruptions-tzeentch-aura': 'chaos-corruptions-tzeentch-corruption'
  };

  // 자동 증가 설정이 꺼져 있으면 종료
  console.log(
    `${config.MODULE_ID} | ${game.settings.get(config.MODULE_ID, 'autoIncrease')}`
  );
  if (!game.settings.get(config.MODULE_ID, 'autoIncrease')) {
    return;
  }

  const actorToken = combatantPf2e.token;
  if (!actorToken) return;

  const affectedAuras = getAffectedAuras(actorToken);

  console.log(`${config.MODULE_ID} | affectedAuras`, affectedAuras);
  // console.log(`affectedAuras`, affectedAuras);

  console.log(
    `${config.MODULE_ID} | 오염 자동 증가 체크 ${game.settings.get(config.MODULE_ID, 'autoIncrease')}, 영향을 받는 오라 ${affectedAuras.length}`
  );
  if (affectedAuras.length === 0) return; // 영향을 받는 오라가 없으면 종료

  for (const { auraSlug, from } of affectedAuras) {
    const corruptionSlug =
      corruptionSlugs[auraSlug as keyof typeof corruptionSlugs];

    if (!corruptionSlug) {
      console.log(`${config.MODULE_ID} | affectedAuras`, affectedAuras);
      continue;
    }

    const corruptionEffect = actorToken.actor.items.find(
      (item) => item.system.slug === corruptionSlug
    );

    if (!corruptionEffect) {
      console.log(
        `${config.MODULE_ID} | ${from}'s ${auraSlug} aura has no corresponding corruption effect`
      );
      continue;
    }

    const currentValue = corruptionEffect.system.badge.value;
    const maxValue = corruptionEffect.system.badge.max;

    if (currentValue >= maxValue) {
      console.log(
        `${config.MODULE_ID} | ${from}'s ${auraSlug} corruption effect is already at maximum`
      );
      continue;
    }

    // corruptionEffect.system.badge.value += 1; // 오염 스택 증가

    await corruptionEffect.update({
      'system.badge.value': corruptionEffect.system.badge.value + 1
    });
  }
};
