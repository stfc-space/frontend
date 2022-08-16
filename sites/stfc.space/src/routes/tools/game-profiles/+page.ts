export interface GameProfileBuffConfig {
  level: number;
  research: { [key: string | number]: number };
  buildings: { [key: string | number]: number };
  officers: { [key: string | number]: [number, number] };
  syndicate_level: number;
  exocomps: number[];
}

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const n = await (await fetch('/api/game-profile')).json();
  return { game_profiles: n };
};
