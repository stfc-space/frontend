import type { Rarity } from './shared';

export * from './shared';
export * from './ship';
export * from './officer';
export * from './research';
export * from './building';
export * from './system';
export * from './hostile';
export * from './consumable';
export * from './mission';
export * from './galaxy';

export interface Resource {
  id: number;
  grade: number;
  rarity: Rarity;
  resource_id: string;
  art_id: number;
  sorting_index: number;
}
