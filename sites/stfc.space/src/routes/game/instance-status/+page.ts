import { YukiApi } from '$lib/shared/api';
import { error } from '@sveltejs/kit';
import { waitLocale } from 'svelte-i18n';
import type { PageLoad } from './$types';

export enum Status {
  Online,
  Offline,
  Maintenance,
  Incident,
  Retired
}

export enum Region {
  Global,
  UsEast1,
  EuWest1,
  ApNorthEast1
}

interface GameStatus {
  instance_latency_labels: string[];
  instances: {
    id: number;
    latency_ms: number[];
    region: Region;
    status: Status;
    metadata: string;
  }[];
}

export const load: PageLoad = async ({ fetch }) => {
  try {
    let result: GameStatus;
    await Promise.all([
      YukiApi.get('/game/status', undefined, fetch).then((e: GameStatus) => {
        result = e;
      }),
      waitLocale()
    ]);

    return {
      status: result
    };
  } catch (e) {
    throw error(500, `Could not load ${e}`);
  }
};
