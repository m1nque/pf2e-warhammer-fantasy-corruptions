declare global {
  // Global game variable
  const game: Game;
  const canvs: Canvas;
  const Hooks: {
    on(
      hook: string,
      callback: (...args: any[]) => void,
      options?: { once: boolean }
    ): number;
    off(hook: string, callback: (...args: any[]) => void): number;
    once(hook: string, callback: (...args: any[]) => void): number;
  };
}

export {};
