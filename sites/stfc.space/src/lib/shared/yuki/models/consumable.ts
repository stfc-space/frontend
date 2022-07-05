import type { Buff, Rarity } from './shared';

export interface Consumable {
  id: number;
  rarity: Rarity;
  grade: number;
  requires_slot: boolean;
  buff: Buff;
  duration_seconds: number;
  category: ConsumableCategory;
  art_id: number;
}

export enum ConsumableCategory {
  Station = 2950573209,
  Galaxy = 1056678826,
  Combat = 1870147103
}
