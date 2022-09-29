import type { Reward } from './shared';

export interface Mission {
  id: number;
  faction: number;
  recommeded_level: number;
  total_rewards: Reward[];
  pickup_systems: number[];
  warp: number;
  warp_for_completion: number;
}

export interface MissionDetail {
  id: number;
  chain: number;
  first_task_id: number;
  tasks: MissionTask[];
  warp: number;
  warp_for_completion: number;
  pickup_systems: number[];
  faction: number;
}

export enum MissionTaskType {
  EventCount,
  PropertyValueWatch,
  TargetDestination, // DOME
  PlanetDestination, // DONE
  StarbaseModuleLevel, // DONE
  DefeatNpcInstantiated, // DONE
  DefeatNpcGlobal, // DONE
  StartMining,
  MineResources, // DONE
  ReturnFleetToStation, // DONE
  BuildFromBlueprint,
  DummyObjective,
  DilemmaObjective, // no attributes
  RecruitNewOfficer,
  JoinAlliance,
  AttackStarbase,
  DonateResources, // DONE
  CompleteFactionMissions,
  UpgradeShip,
  StockpileResources, // DONE
  OfficerLevelAndRank,
  DefeatFactionShips,
  AssignOfficerToDrydock,
  MoveStarbase
}

export interface MissionTaskAttributesNpc {
  id: number;
  stats: {
    health: number;
    defense: number;
    attack: number;
    dpr: number;
    strength: number;
    hull_hp: number;
    shield_hp: number;
    armor: number;
    absorption: number;
    dodge: number;
    accuracy: number;
    armor_piercing: number;
    shield_piercing: number;
    critical_chance: number;
    critical_damage: number;
  };
  hull_type: number;
}

export interface MissionTaskAttributes {
  target_system?: number;
  resource_id?: number;
  resource_amount?: number;
  level?: number;
  module_id?: number;
  count?: number;
  npc?: MissionTaskAttributesNpc;
}

export interface MissionDialogue {
  character_id: number;
  lines: number[];
}

export interface MissionTask {
  id: number;
  auto_complete: boolean;
  next_steps: number[];
  rewards: Reward[];
  type: MissionTaskType;
  attributes: MissionTaskAttributes;

  dialogue_start: MissionDialogue[];
  dialogue_end: MissionDialogue[];
  dialogue_dilemma: MissionDialogue[];
}
