import type { Rarity } from './shared';
import type { ShipDetailAbility, ShipDetailComponent } from './ship';

export enum HostileShipType {
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

export interface Hostile {
  id: number;
  faction: number;
  level: number;
  ship_type: number;
  is_scout: boolean;
  loca_id: number;
  hull_type: number;
  rarity: number;
  count: number;
  strength?: number;
  systems: number[];
  warp: number;
  resources?: ResourceRewardRange[];
}

export interface ResourceRewardRange {
  resource_id: number;
  min: number;
  max: number;
}

export interface HostileDetail {
  id: number;
  loca_id: number;
  faction: number;
  level: number;
  ship_type: HostileShipType;
  is_scout: boolean;
  hull_type: number;
  rarity: Rarity;
  strength: number;
  systems: number[];
  warp: number;
  components: ShipDetailComponent[];
  resources: ResourceRewardRange[];
  ability: ShipDetailAbility;
  stats?: { [key: string]: number };
}

export enum HostileType {
  Any = -1,
  Destroyer = 0,
  Survey = 1,
  Explorer = 2,
  Battleship = 3,
  Armada = 5,
  Scout = 77
}
