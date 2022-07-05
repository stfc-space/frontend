import type { BuildCost, Rarity, Requirement } from './shared';

export interface Ship {
  id: number;
  max_tier: number;
  grade: number;
  rarity: Rarity;
  scrap_level: number;
  build_time_in_seconds: number;
  faction: number;
  blueprints_required: number;
  hull_type: number;
  max_level: number;
  build_cost: BuildCost[];
  build_requirements: Requirement[];
  art_id: number;
}

export type ShipComponentArmor = {
  tag: 'Armor';
  plating: number;
  hp: number;
};

export type ShipComponentCargo = {
  tag: 'Cargo';
  max_resources: number;
  protected: number;
};

export type ShipComponentDeflector = {
  tag: 'Deflector';
  deflection: number;
};

export type ShipComponentImpulse = {
  tag: 'Impulse';
  impulse: number;
  dodge: number;
};

export type ShipComponentShield = {
  tag: 'Shield';
  absorption: number;
  mitigation: number;
  hp: number;
  regen_time: number;
};

export type ShipComponentSensor = {
  tag: 'Sensor';
};

export type ShipComponentSpecial = {
  tag: 'Special';
  mining_speed: number;
};

export interface ShipComponentWarpAbility {
  InstantWarp?: {
    base_cost: number;
    cost_resource_id: number;
    cost_multiplier: number;
  };
  Towing?: {
    cost_multiplier: number;
    unlock_research_id: number;
  };
  Cloaking?: {
    base_cost: number;
    cooldown: number;
    duration: number;
    cost_resource_id: number;
    unlock_research_id: number;
  };
}

export type ShipComponentWarp = {
  tag: 'Warp';
  speed: number;
  distance: number;
  tow_multiplier?: number;
  instant_warp_cost?: number;
  abilities: ShipComponentWarpAbility[];
};

export type ShipComponentWeapon = {
  tag: 'Weapon';
  shots: number;
  warm_up: number;
  cool_down: number;
  accuracy: number;
  penetration: number;
  modulation: number;
  minimum_damage: number;
  maximum_damage: number;
  crit_chance: number;
  crit_modifier: number;
  weapon_type: number;
};

export type ShipDetailComponentData =
  | ShipComponentArmor
  | ShipComponentCargo
  | ShipComponentDeflector
  | ShipComponentImpulse
  | ShipComponentShield
  | ShipComponentSensor
  | ShipComponentSpecial
  | ShipComponentWarp
  | ShipComponentWeapon;

export interface ShipDetailComponent {
  id: number;
  art_id: number;
  loca_id: number;
  build_cost: BuildCost[];
  repair_cost: BuildCost[];
  repair_time: number;
  scrap: BuildCost[];
  data: ShipDetailComponentData;
  order: number;
  build_time_in_seconds: number;
}

export interface OfficerBonusValue {
  value: number;
  bonus: number;
}

export interface OfficerBonus {
  attack: OfficerBonusValue[];
  defense: OfficerBonusValue[];
  health: OfficerBonusValue[];
}

export interface Scrap {
  hull_id: number;
  scrap_time_seconds: number;
  level: number;
  resources: BuildCost[];
}

export interface TierBuffs {
  cargo: number;
  protected: number;
}

export interface Tier {
  tier: number;
  buffs: TierBuffs;
  duration: number;
  components: ShipDetailComponent[];
}

export interface ShipDetail {
  id: number;
  art_id: number;
  max_tier: number;
  rarity: Rarity;
  grade: number;
  scrap_level: number;
  build_time_in_seconds: number;
  faction: number;
  blueprints_required: number;
  hull_type: number;
  max_level: number;
  build_cost: BuildCost[];
  repair_cost: BuildCost[];
  repair_time: number;
  build_requirements: Requirement[];
  officer_bonus: OfficerBonus;
  crew_slots: CrewSlot[];
  tiers: Tier[];
  levels: ShipDetailLevel[];
  ability: ShipDetailAbility;
  scrap: Scrap[];
  base_scrap: BuildCost[];
}

export interface ShipDetailAbility {
  id: number;
  value_is_percentage: boolean;
  values: Value[];
  art_id: number;
  show_percentage: boolean;
  value_type: number;
}

export interface Value {
  value: number;
  chance: number;
}

export interface CrewSlot {
  slots: number;
  unlock_level: number;
}

export interface ShipDetailLevel {
  level: number;
  xp: number;
  shield: number;
  health: number;
}
