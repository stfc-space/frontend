import type { OfficerAbility } from './officer';
import type { Buff, BuildCost, Requirement, Reward } from './shared';

export interface Research {
  id: number;
  unlock_level: number;
  art_id: number;
  view_level: number;
  max_level: number;
  research_tree: number;
  buffs: OfficerAbility[];
  first_level_requirements: Requirement[];
  row: number;
  column: number;
}

export interface ResearchDetail {
  id: number;
  art_id: number;
  view_level: number;
  research_tree: number;
  buffs: Buff[];
  levels: ResearchDetailLevel[];
  row: number;
  column: number;
  unlock_level: number;
}

export interface ResearchDetailLevel {
  id: number;
  strength: number;
  strength_increase: number;
  research_time_in_seconds: number;
  costs: BuildCost[];
  hard_currency_cost: number;
  requirements: Requirement[];
  required_by: Requirement[];
  rewards: Reward[];
}
