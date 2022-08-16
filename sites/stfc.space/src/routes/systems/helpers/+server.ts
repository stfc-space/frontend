import type { Hostile, System, SystemDetail } from '$lib/shared/yuki/models';
import { HostileType, HullType } from '$lib/shared/yuki/models';
import { max } from 'lodash-es';

export enum SortOption {
  Warp,
  Name,
  Level
}

export function systemHostileTypes(system: System | SystemDetail) {
  return {
    int: !!system.hostiles.find((x) => !x.is_scout && x.hull_type == HullType.Destroyer),
    bs: !!system.hostiles.find((x) => !x.is_scout && x.hull_type == HullType.Battleship),
    exp: !!system.hostiles.find((x) => !x.is_scout && x.hull_type == HullType.Explorer),
    arm: !!system.hostiles.find((x) => !x.is_scout && x.hull_type == HullType.Armada),
    sur: !!system.hostiles.find((x) => !x.is_scout && x.hull_type == HullType.Survey)
  };
}

export function sortSystems(
  sort: { ascending: boolean; sortBy: SortOption },
  a: System & { name: string },
  b: System & { name: string }
) {
  const left = sort.ascending ? a : b;
  const right = sort.ascending ? b : a;
  switch (sort.sortBy) {
    case SortOption.Name: {
      return left.name.localeCompare(right.name);
    }
    case SortOption.Level: {
      return left.level - right.level;
    }
    case SortOption.Warp: {
      return left.est_warp - right.est_warp;
    }
  }
}

export function filterSystems(
  filter: {
    name: string;
    page: number;
    faction: number;
    mining: boolean;
    housing: boolean;
    missions: boolean;
    scout: boolean;
    ds: boolean;
    level: [number, number];
    warp: [number, number];
    resources: number[];
    hostiles: number[];
    ns?: number;
    he?: boolean;
    me?: boolean;
  },
  system: System
) {
  if (system.level < filter.level[0]) {
    return false;
  }
  if (system.level > filter.level[1]) {
    return false;
  }
  if (system.est_warp < filter.warp[0]) {
    return false;
  }
  if (system.est_warp > filter.warp[1]) {
    return false;
  }
  if (filter.resources.length > 0) {
    if (filter.me) {
      if (system.mine_resources.find((x: number) => !filter.resources.includes(x)) != null) {
        return false;
      }
      for (const t of filter.resources) {
        if (system.mine_resources.find((x: number) => x == t) == null) {
          return false;
        }
      }
    }
    const filteredArray = filter.resources.filter((value: number) =>
      system.mine_resources.includes(value)
    );
    if (filteredArray.length == 0) {
      return false;
    }
  }
  if (filter.housing && !system.has_player_containers) {
    return false;
  }
  if (filter.missions && !system.has_missions) {
    return false;
  }
  if (filter.ds && !system.is_deep_space) {
    return false;
  }
  if (filter.faction != -1 && filter.faction != -2 && system.faction != filter.faction) {
    return false;
  }
  if (filter.faction == -2 && system.faction != -1) {
    return false;
  }
  if (filter.scout && system.hostiles.find((x) => x.is_scout) == null) {
    return false;
  }
  const n = max(system.node_sizes);
  if (n && n < filter.ns) {
    return false;
  }
  if (filter.hostiles.length > 0) {
    if (filter.he) {
      if (
        system.hostiles.find(
          (x: Hostile) =>
            !filter.hostiles.includes(x.is_scout ? HostileType.Scout : x.hull_type) &&
            x.hull_type != 5
        ) != null
      ) {
        return false;
      }
    }
    for (const t of filter.hostiles) {
      if (
        system.hostiles.find((x: Hostile) => (x.is_scout ? HostileType.Scout : x.hull_type) == t) ==
        null
      ) {
        return false;
      }
    }
  }
  return true;
}
