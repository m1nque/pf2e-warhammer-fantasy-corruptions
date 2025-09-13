declare global {
  // Global game variable
  const game: Game;
  const canvas: Canvas;
  const CONFIG: any;
  const foundry: {
    utils: {
      getProperty: (object: any, property: string, value?: any) => any;
      // 기타 유틸리티 함수들...
    };
    documents: {
      TokenDocument: any;
    };
  };

  // libWrapper 모듈
  const libWrapper: {
    register: (
      moduleId: string,
      path: string,
      fn: Function,
      type: 'WRAPPER' | 'MIXED' | 'OVERRIDE'
    ) => void;
  };

  // 후크 시스템
  const Hooks: {
    on(
      hook: string,
      callback: (...args: any[]) => void,
      options?: { once: boolean }
    ): number;
    off(hook: string, callback: (...args: any[]) => void): number;
    once(hook: string, callback: (...args: any[]) => void): number;
  };

  interface Collection<T> {
    find: (predicate: (item: T) => boolean) => T | undefined;
    // 기타 Collection 메서드들...
  }

  // 기본 인터페이스
  interface TokenDocumentPF2e extends foundry.documents.TokenDocument {
    // 토큰 문서 관련 속성 및 메서드
    auras?: Map<string, any>;
  }

  interface TokenPF2e extends Token {
    document: TokenDocumentPF2e;
    actor?: ActorPF2e;
    center: { x: number; y: number };
  }

  interface ActorPF2e extends Actor {
    items: Collection<ItemPF2e>;
  }

  interface ItemPF2e extends Item {
    system: {
      slug: string;
      badge?: {
        value: number;
        max: number;
      };
      // 기타 시스템 관련 속성들...
    };
    toMessage: (chatData?: any, options?: any) => Promise<ChatMessage>;
  }

  class ChatMessagePF2e extends ChatMessage {
    getFlag(scope: string, key: string): any;
    speaker: {
      token?: string;
      alias?: string;
      scene?: string;
      actor?: string;
    };
    static getSpeakerActor(speaker: any): ActorPF2e | null;
    static getWhisperRecipients(name: string): string[];
  }

  interface CombatantPF2e {
    token: TokenPF2e;
    actor: ActorPF2e;
  }

  interface EncounterPF2e {
    // 전투 인카운터 관련 속성 및 메서드
  }
}
