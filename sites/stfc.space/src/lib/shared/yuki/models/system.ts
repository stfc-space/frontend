import type { Hostile } from './hostile';

export interface System {
  id: number;
  est_warp: number;
  is_deep_space: boolean;
  faction: number;
  level: number;
  coords_x: number;
  coords_y: number;
  has_mines: boolean;
  has_plantes: boolean;
  has_player_containers: boolean;
  num_station_slots: number;
  has_missions: boolean;
  mine_resources: number[];
  hostiles: Hostile[];
  node_sizes: number[];
}

export interface SystemDetail {
  id: number;
  est_warp: number;
  is_deep_space: boolean;
  faction: number;
  level: number;
  coords_x: number;
  coords_y: number;
  has_mines: boolean;
  has_plantes: boolean;
  has_player_containers: boolean;
  num_station_slots: number;
  has_missions: boolean;
  mines: Mine[];
  planets: Planet[];
  player_container: Planet[];
  spawn_points?: SpawnPoint[];
  missions: number[];
  hostiles: Hostile[];
  node_sizes: number[];
}

export interface Mine {
  id: number;
  resource: number;
  rate: number;
  amount: number;
  coords_x: number;
  coords_y: number;
}

export interface Planet {
  id: number;
  missions?: number[];
  coords_x: number;
  coords_y: number;
  slots?: number;
}

export interface SpawnPoint {
  id: number;
  coords_x: number;
  coords_y: number;
}
