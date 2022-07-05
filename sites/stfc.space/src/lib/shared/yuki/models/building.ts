import type { OfficerAbility } from './officer';
import type { Buff, BuildCost, Requirement, Reward } from './shared';
import type { ShipDetailComponent } from './ship';

export interface Building {
  id: number;
  max_level: number;
  unlock_level: number;
  first_level_requirements: Requirement[];
  buffs: OfficerAbility[];
}

export interface BuildingDetail {
  id: number;
  levels: BuildingDetailLevel[];
  buffs: Buff[];
  unlock_level?: number;
}

export interface BuildingDetailLevel {
  id: number;
  strength: number;
  strength_increase: number;
  build_time_in_seconds: number;
  costs: BuildCost[];
  hard_currency_cost: number;
  requirements: Requirement[];
  required_by?: Requirement[];
  rewards: Reward[];
  weapons?: ShipDetailComponent[];
  stats?: { [key: string]: number } | null;
}
