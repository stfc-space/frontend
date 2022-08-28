import type { AbilityFlag, Buff, BuildCost, Rarity } from './shared';

export interface Officer {
  id: number;
  art_id: number;
  faction: number;
  class: number;
  rarity: Rarity;
  synergy_id: number;
  max_rank: number;
  ability: OfficerAbility;
  captain_ability: OfficerAbility;
  below_decks_ability?: OfficerAbility;
}

export interface OfficerAbility {
  id: number;
  value_is_percentage: boolean;
  max_level: number;
  art_id: number;
  flag: AbilityFlag;
}

export interface OfficerDetail {
  id: number;
  art_id: number;
  faction: number;
  class: number;
  rarity: Rarity;
  synergy_id: number;
  max_rank: number;
  ability: Buff;
  captain_ability: Buff;
  below_decks_ability?: Buff;
  levels: OfficerDetailLevel[];
  stats: Stat[];
  ranks: Rank[];
  trait_config?: OfficerTraitConfig;
}

export interface OfficerDetailLevel {
  level: number;
  xp: number;
}

export interface Rank {
  rank: number;
  max_level: number;
  shards_required: number;
  rating_factor: number;
  costs: BuildCost[];
}

export interface Stat {
  level: number;
  attack: number;
  defense: number;
  health: number;
}

export interface OfficerTraitProgression {
  required_rank: number;
  trait_id: number;
}

export interface OfficerTrait {
  trait_id: number;
  cost: OfficerTraitCost[];
}

export interface OfficerTraitCost {
  level: number;
  costs: BuildCost[];
}

export interface OfficerTraitConfig {
  progression: OfficerTraitProgression[];
  traits: OfficerTrait[];
}
