export interface GalaxyNode {
  id: number;
  coords_x: number;
  coords_y: number;
  connections: Connection[];
}

export interface Connection {
  unlock_ids: number[];
  from: number;
  to: number;
  distance: number;
  costs: number[];
}

export interface MissionWarpUnlock {
  id: number;
  from: number;
  to: number;
}

export type Galaxy = Array<GalaxyNode>;
export type MissionWarpUnlocks = Array<MissionWarpUnlock>;
