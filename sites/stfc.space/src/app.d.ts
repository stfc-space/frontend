declare namespace App {
  export interface Locals {
    user?: { authenticated?: boolean; id: string; session_id: string; logoutUrl?: string | null };
  }
  export interface Session {
    user: unknown;
    theme: string;
    lang: string;
  }

  export interface Platform {
    env: {
      USER_STORAGE: Fetcher;
    };
    context: {
      waitUntil(promise: Promise<any>): void;
    };
  }
}
