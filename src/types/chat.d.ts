declare global {
  declare class ChatMessagePF2e extends ChatMessage {
    /** Associated PF2e actor */
    get actor(): ActorPF2e | null;

    /** Associated target, if any */
    get target(): {
      actor: ActorPF2e;
      token: TokenDocumentPF2e<ScenePF2e>;
    } | null;

    /** The associated journal entry (if from inline content) */
    get journalEntry(): JournalEntry | null;

    /** Whether this is a d20-based check roll */
    get isCheckRoll(): boolean;

    /** Whether this is a reroll of a previous check */
    get isReroll(): boolean;

    /** Whether this is a rerollable check (with hero point or similar) */
    get isRerollable(): boolean;

    /** Whether this is a damage roll (not check or table) */
    get isDamageRoll(): boolean;

    /** Associated item, if any (includes self-effects, spells, or strikes) */
    get item(): ItemPF2e | null;

    /** Strike data if this is a strike roll */
    protected get _strike(): StrikeData | null;

    /** Actor's token (based on speaker) */
    get token(): TokenDocumentPF2e<ScenePF2e> | null;

    /** Generate enriched HTML content */
    override getHTML(): Promise<JQuery>;

    /** Show roll details in inspector */
    showDetails(): Promise<void>;

    /** Internal roll data combination of actor/item */
    override getRollData(): Record<string, unknown>;

    /** PF2e-specific flags */
    flags: ChatMessageFlagsPF2e;

    /** Original source data */
    readonly _source: ChatMessageSourcePF2e;

    /** Author user */
    author: UserPF2e | null;

    /** Internal hover events */
    protected #onHoverIn(event: MouseEvent | PointerEvent): void;
    protected #onHoverOut(event: MouseEvent | PointerEvent): void;

    /** Handle creation (init hooks, cards, rest messages) */
    protected override _onCreate(
      data: this['_source'],
      operation: MessageCreateOperationPF2e,
      userId: string
    ): void;
  }

  interface MessageCreateOperationPF2e extends ChatMessageCreateOperation {
    /** Whether this is a "Rest for the Night" system message */
    restForTheNight?: boolean;
  }
}

export {};
