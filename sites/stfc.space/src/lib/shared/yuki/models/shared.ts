export interface BuildCost {
  resource_id: number;
  amount: number;
}

export interface Requirement {
  requirement_type: RequirementType;
  requirement_id: number;
  requirement_level: number;
  power_gain?: number;
}

export enum RequirementType {
  BuildingLevel = 'BuildingLevel',
  FactionRank = 'FactionRank',
  ResearchLevel = 'ResearchLevel'
}

export enum Rarity {
  Base = 0,
  Common = 1,
  Uncommon = 2,
  Rare = 3,
  Epic = 4
}

export function filterRarity(filterRarity: number, rarity: Rarity) {
  if (filterRarity == -1) {
    return true;
  }
  switch (rarity as string | Rarity) {
    case 'Common':
    case Rarity.Common:
      return filterRarity == 1;
    case 'Uncommon':
    case Rarity.Uncommon:
      return filterRarity == 2;
    case 'Rare':
    case Rarity.Rare:
      return filterRarity == 3;
    case 'Epic':
    case Rarity.Epic:
      return filterRarity == 4;
  }
  return true;
}

export enum ItemType {
  Component = 0,
  Blueprint = 1,
  Resource = 3,
  Mission = 5,
  Connection = 6,
  Consumable = 8,
  Officer = 9,
  OfficerShard = 11,
  Cosmetic = 12,
  Shield = 103
}

export interface Reward {
  amount: number;
  type: ItemType;
  resource_id: number;
}

export interface InventoryReward {
  type: ItemType;
  id: number;
}

export interface BuffValue {
  value: number;
  chance: number;
}

export enum AbilityFlag {
  BuildingCost,
  BuildingSpeed,
  ResearchCost,
  ResearchSpeed,
  ComponentCost,
  ShipBuildSpeed,
  ShipBuildCost,
  ShipTierUpSpeed,
  // Ship related stuff
  WeaponAllDamage,
  WeaponShots,
  WwaponWarmup,
  WeaponCooldown,
  Accuracy,
  Peneration,
  Modulation,
  Dodge,
  Armor,
  Absorption,
  CritChance,
  CritDamage,
  MiningRate,
  ImpulseSpeed,
  WarpSpeed,
  WarpRange,
  Defense,
  Piercing,
  RepairTime,
  RepairCost,
  CargoCapacity,
  CargoProtection,
  ShieldHp,
  HullHp,
  ShieldRegenTime,
  ShieldMitigation,

  // Other generic stuff
  XpReward,
  OfficerStats,
  ResourceProduction,
  ResourceProductionStorage,
  WarehouseStorage,
  VaulStorage,
  ScrapSpeed,
  FactionPointRewards,
  FactionPointLossReductionFed,
  FactionPointLossReductionKlg,
  FactionPointLossReductionRom,

  ArmadaSize,
  DiscoEfficiency,

  CloakCooldown,
  CloakDuration,
  CloakCost,
  CloakHiddenChance,
  CerritosCooldown,
  CerritosDuration,
  BelowDeckAbility,
  AmalgamBonus,
  RepairCostEfficiency,
  FactionPointGainFed,
  FactionPointGainKlg,
  FactionPointGainRom,
  HostileCargo,
  StellaBonus,
  NanoprobeLootBonus,
  ArmadaCargo,
  AmalgamHostileLoot,
  SupportDuration,
  HangarSize,
  InternalUnused,

  AddState,
  RemoveState,
  CaptainValue,
  OfficerValue,

  Invalid
}

export interface Buff {
  id: number;
  value_is_percentage: boolean;
  values: BuffValue[];
  art_id: number;
  show_percentage: boolean;
  value_type: number;
  flag: AbilityFlag;
}

export function abilityValue(ability: Buff, rank: number): number {
  return ability.value_type == 0 ? ability.values[rank].value : ability.values[rank].chance;
}

export enum Faction {
  Any = -1,
  Federation = 2064723306,
  Klingon = 4153667145,
  Romulan = 669838839,
  Swarm = 2489857622,
  Borg = 2943562711,
  Eclipse = 1750120904,
  Rogue = 2143656960,
  Assimilated = 157476182
}

export enum HullType {
  Any = -1,
  Destroyer = 0,
  Survey = 1,
  Explorer = 2,
  Battleship = 3,
  Defense = 4,
  Armada = 5
}

export enum ShipType {
  Antaak,
  ArmadaTarget,
  Battleship,
  Boss,
  Combat,
  Destroyer,
  Elite,
  Explorer,
  Patrol,
  Revenge,
  Survey,
  Trader,
  Transport,
  WarFleet
}
