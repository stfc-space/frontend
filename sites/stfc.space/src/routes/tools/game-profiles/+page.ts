export interface GameProfile {
  id: string;
  name: string;
  description: string;
  modified: number;
  level: number;
  research: { [key: string | number]: number };
  buildings: { [key: string | number]: number };
  officers: { [key: string | number]: [number, number] };
  syndicate_level: number;
  exocomps: number[];
}

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const n: GameProfile[] = await (await fetch('/api/game-profile')).json();
  return { game_profiles: n };
};
