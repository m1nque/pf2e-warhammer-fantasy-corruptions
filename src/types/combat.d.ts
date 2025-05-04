declare global {
  declare class CombatantPF2e<
    TParent extends EncounterPF2e | null = EncounterPF2e | null,
    TTokenDocument extends TokenDocumentPF2e | null = TokenDocumentPF2e | null
  > extends Combatant<TParent, TTokenDocument> {
    declare initialized: boolean;

    static override createDocuments<
      TDocument extends foundry.abstract.Document
    >(
      this: ConstructorOf<TDocument>,
      data?: (TDocument | PreCreate<TDocument['_source']>)[],
      operation?: Partial<DatabaseCreateOperation<TDocument['parent']>>
    ): Promise<TDocument[]>;

    static fromActor(
      actor: ActorPF2e,
      render?: boolean,
      options?: { combat?: EncounterPF2e }
    ): Promise<CombatantPF2e<EncounterPF2e> | null>;

    get encounter(): TParent;

    get roundOfLastTurn(): number | null;

    get playersCanSeeName(): boolean;

    overridePriority(initiative: number): number | null;

    hasHigherInitiative(
      this: RolledCombatant<NonNullable<TParent>>,
      { than }: { than: RolledCombatant<NonNullable<TParent>> }
    ): boolean;

    startTurn(): Promise<void>;

    endTurn(options: { round: number }): Promise<void>;

    override prepareData(): void;

    override prepareBaseData(): void;

    toggleDefeated(options?: {
      to?: boolean;
      overlayIcon?: boolean;
    }): Promise<void>;

    toggleNameVisibility(): Promise<void>;

    override updateResource(): { value: number } | null;

    override _getInitiativeFormula(): string;

    protected override _onUpdate(
      changed: DeepPartial<this['_source']>,
      operation: DatabaseUpdateOperation<TParent>,
      userId: string
    ): void;

    protected override _onDelete(
      operation: DatabaseDeleteOperation<TParent>,
      userId: string
    ): void;

    protected override _initialize(options?: Record<string, unknown>): void;
  }

  interface CombatantPF2e<
    TParent extends EncounterPF2e | null = EncounterPF2e | null,
    TTokenDocument extends TokenDocumentPF2e | null = TokenDocumentPF2e | null
  > extends Combatant<TParent, TTokenDocument> {
    flags: CombatantFlags;
  }

  interface CombatantFlags extends DocumentFlags {
    pf2e: {
      initiativeStatistic: SkillSlug | 'perception' | null;
      roundOfLastTurn: number | null;
      roundOfLastTurnEnd: number | null;
      overridePriority: Record<number, number | null | undefined>;
    };
  }

  type RolledCombatant<TEncounter extends EncounterPF2e> = CombatantPF2e<
    TEncounter,
    TokenDocumentPF2e
  > & {
    initiative: number;
  };

  declare class EncounterPF2e extends Combat {
    declare initialized: boolean;

    declare metrics: EncounterMetrics | null;

    /** Sort by initiative, breaking ties by priority then ID */
    protected override _sortCombatants(
      a: CombatantPF2e<this, TokenDocumentPF2e>,
      b: CombatantPF2e<this, TokenDocumentPF2e>
    ): number;

    /** Public accessor to compare initiative */
    getCombatantWithHigherInit(
      a: RolledCombatant<this>,
      b: RolledCombatant<this>
    ): RolledCombatant<this> | null;

    /** XP and threat analysis */
    analyze(): EncounterMetrics | null;

    protected override _initialize(options?: Record<string, unknown>): void;

    override prepareData(): void;

    override prepareDerivedData(): void;

    override createEmbeddedDocuments(
      embeddedName: 'Combatant',
      data: PreCreate<foundry.documents.CombatantSource>[],
      operation?: Partial<DatabaseCreateOperation<this>>
    ): Promise<CombatantPF2e<this, TokenDocumentPF2e<ScenePF2e>>[]>;

    override rollInitiative(
      ids: string[],
      options?: RollInitiativeOptionsPF2e
    ): Promise<this>;

    setMultipleInitiatives(initiatives: SetInitiativeData[]): Promise<void>;

    override setInitiative(
      id: string,
      value: number,
      statistic?: string
    ): Promise<void>;

    resetActors(): Promise<void>;

    protected override _onCreate(
      data: this['_source'],
      operation: DatabaseCreateOperation<null>,
      userId: string
    ): void;

    protected override _onUpdate(
      changed: DeepPartial<this['_source']>,
      operation: DatabaseUpdateOperation<null>,
      userId: string
    ): void;

    protected override _onDelete(
      operation: DatabaseDeleteOperation<null>,
      userId: string
    ): void;

    /** Re-declare combatants with PF2e type */
    declare readonly combatants: foundry.abstract.EmbeddedCollection<
      CombatantPF2e<this, TokenDocumentPF2e | null>
    >;

    declare scene: ScenePF2e;

    rollNPC(options: RollInitiativeOptionsPF2e): Promise<this>;
  }

  interface EncounterPF2e extends Combat {}

  interface EncounterMetrics {
    threat: ThreatRating;
    budget: {
      spent: number;
      max: number;
      partyLevel: number;
    };
    award: {
      xp: number;
      recipients: ActorPF2e[];
    };
    participants: {
      party: ActorPF2e[];
      opposition: ActorPF2e[];
    };
  }

  interface SetInitiativeData {
    id: string;
    value: number;
    statistic?: SkillSlug | 'perception' | null;
    overridePriority?: number | null;
  }
}

export {};
