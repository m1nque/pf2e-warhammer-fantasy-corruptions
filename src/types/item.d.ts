declare global {
  declare class ItemPF2e<
    TParent extends ActorPF2e | null = ActorPF2e | null
  > extends Item<TParent> {
    readonly isExpired: boolean;
    readonly slug: string | null;
    readonly sourceId: string | null;
    prepareRuleElements(options?: RuleElementOptions): RuleElementPF2e[];
    toMessage(
      event?: Event,
      options?: object
    ): Promise<ChatMessagePF2e | undefined>;
    toChat(event?: Event): Promise<ChatMessagePF2e | undefined>;
  }

  declare class EffectPF2e<
    TParent extends ActorPF2e | null = ActorPF2e | null
  > extends AbstractEffectPF2e<TParent> {
    /** Current badge (counter/value/formula) */
    get badge(): EffectBadge | null;

    /** Effect level */
    get level(): number;

    /** Whether the effect is expired */
    get isExpired(): boolean;

    /** Whether this effect creates an aura */
    get isAura(): boolean;

    /** Whether this effect is identified (not hidden) */
    get isIdentified(): boolean;

    /** Whether this effect originates from an aura */
    get fromAura(): boolean;

    /** Prepare base data (init duration, badge clamping, etc.) */
    protected override prepareBaseData(): void;

    /** Prepare rule elements (auto-ignore if expired & auto-expiration enabled) */
    protected override prepareRuleElements(
      options?: RuleElementOptions
    ): RuleElementPF2e[];

    /** Increase the counter badge value */
    increase(): Promise<void>;

    /** Decrease the counter badge value or delete effect if needed */
    decrease(): Promise<void>;

    /** Get roll options, trimming effect slug */
    override getRollOptions(
      prefix?: string,
      options?: { includeGranter?: boolean }
    ): string[];

    /** Handle badge reevaluation on encounter events */
    onEncounterEvent(event: BadgeReevaluationEventType): Promise<void>;

    /** Hook: pre-create logic (initialize start time, formula badge evaluation) */
    protected override _preCreate(
      data: this['_source'],
      operation: DatabaseCreateOperation<TParent>,
      user: UserPF2e
    ): Promise<boolean | void>;

    /** Hook: pre-update logic (badge clamping, deletion logic, duration patching) */
    protected override _preUpdate(
      changed: DeepPartial<EffectSource>,
      operation: DatabaseUpdateOperation<TParent>,
      user: UserPF2e
    ): Promise<boolean | void>;

    /** Hook: on delete (unregister effect) */
    protected override _onDelete(
      operation: DatabaseDeleteOperation<TParent>,
      userId: string
    ): void;
  }
  // Interface adds structural properties
  interface EffectPF2e<TParent extends ActorPF2e | null = ActorPF2e | null>
    extends AbstractEffectPF2e<TParent> {
    flags: EffectFlags;
    readonly _source: EffectSource;
    system: EffectSystemData;
  }
  type BadgeReevaluationEventType = 'turn-start' | 'turn-end' | 'encounter-end';
}

export {};
