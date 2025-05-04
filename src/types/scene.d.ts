declare global {
  declare class TokenPF2e<
    TDocument extends TokenDocumentPF2e = TokenDocumentPF2e
  > extends Token<TDocument> {
    /** Auras */
    readonly auras: AuraRenderers;

    /** Flanking lines */
    readonly flankingHighlight: FlankingHighlightRenderer;

    get isTiny(): boolean;

    get localShape(): TokenShape;

    get footprint(): GridOffset[];

    get isVisible(): boolean;

    get animation(): Promise<boolean> | null;

    get isAnimating(): boolean;

    get hasLowLightVision(): boolean;

    get hasDarkvision(): boolean;

    get linkToActorSize(): boolean;

    get highlightId(): string;

    get mechanicalBounds(): PIXI.Rectangle;

    get layer(): TokenLayerPF2e<this>;

    isAdjacentTo(token: TokenPF2e): boolean;

    canControl(user: UserPF2e, event: PIXI.FederatedPointerEvent): boolean;

    canFlank(
      flankee: TokenPF2e,
      context?: { reach?: number; ignoreFlankable?: boolean }
    ): boolean;

    isFlanking(
      flankee: TokenPF2e,
      context?: { reach?: number; ignoreFlankable?: boolean }
    ): boolean;

    buddiesFlanking(
      flankee: TokenPF2e,
      context?: { reach?: number; ignoreFlankable?: boolean }
    ): TokenPF2e[];

    emitHoverIn(event: MouseEvent | PointerEvent): void;

    emitHoverOut(event: MouseEvent | PointerEvent): void;

    showFloatyText(params: ShowFloatyEffectParams): Promise<void>;

    distanceTo(
      target: TokenOrPoint,
      options?: { reach?: number | null }
    ): number;

    clone(): this;

    render(renderer: PIXI.Renderer): void;

    animate(
      updateData: Record<string, unknown>,
      options?: TokenAnimationOptionsPF2e
    ): Promise<void>;

    protected _applyRenderFlags(flags: Record<string, boolean>): void;

    protected _refreshVisibility(): void;

    protected _drawBar(
      number: number,
      bar: PIXI.Graphics,
      data: TokenResourceData
    ): void;

    protected _drawEffects(): Promise<void>;

    protected _canView(
      user: UserPF2e,
      event: PIXI.FederatedPointerEvent
    ): boolean;

    protected _canDrag(
      user: UserPF2e,
      event?: TokenPointerEvent<this>
    ): boolean;

    protected _canControl(
      user: UserPF2e,
      event?: PIXI.FederatedPointerEvent
    ): boolean;

    protected _onControl(options?: {
      releaseOthers?: boolean;
      pan?: boolean;
    }): void;

    protected _onRelease(options?: Record<string, unknown>): void;

    protected _onDragLeftStart(event: TokenPointerEvent<this>): void;

    protected _onDragLeftMove(event: TokenPointerEvent<this>): void;

    protected _onDragLeftDrop(
      event: TokenPointerEvent<this>
    ): Promise<void | TDocument[]>;

    protected _onDragLeftCancel(event: TokenPointerEvent<this>): void;

    protected _onApplyStatusEffect(statusId: string, active: boolean): void;

    protected _onUpdate(
      changed: DeepPartial<TDocument['_source']>,
      operation: TokenUpdateOperation<TDocument['parent']>,
      userId: string
    ): void;

    protected onOppositeSides(
      flankerA: TokenPF2e,
      flankerB: TokenPF2e,
      flankee: TokenPF2e
    ): boolean;

    protected _isVisionSource(): boolean;
  }

  interface TokenAnimationOptionsPF2e extends TokenAnimationOptions {
    spin?: boolean;
  }

  type ShowFloatyEffectParams =
    | number
    | { create: NumericFloatyEffect }
    | { update: NumericFloatyEffect }
    | { delete: NumericFloatyEffect };

  type NumericFloatyEffect = { name: string; value?: number | null };

  type TokenOrPoint =
    | TokenPF2e
    | (Point & {
        actor?: never;
        document?: never;
        bounds?: never;
      });
}

export {};
