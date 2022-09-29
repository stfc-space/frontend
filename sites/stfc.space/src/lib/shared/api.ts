import { browser } from '$app/environment';
import { mande } from './mande';
import type { MandeInstance, Options } from './mande';
import { get, writable } from 'svelte/store';
import type { Building, Officer, Research, Resource, Ship, System } from './yuki/models';

import { PUBLIC_API_URL } from '$env/static/public';

function getAPIUrl() {
  let api_url = PUBLIC_API_URL;
  if (!api_url.endsWith('/')) {
    api_url += '/';
  }
  api_url += 'v1';
  return api_url;
}

class YukiApiImpl {
  private versionResolver: Promise<void> | null = null;

  constructor(private readonly client: MandeInstance) {
    try {
      client.options.query.version = window.localStorage.getItem('dataVersion');
    } catch (e) {
      // Intentionally left empty
    }

    this.versionResolver = client.get<string>('version', { responseAs: 'text' }).then((version) => {
      try {
        window.localStorage.setItem('dataVersion', version);
      } catch {
        // Intentionally left empty
      }
      client.options.query.version = version;
    });
  }

  public async post<T = unknown, Y = unknown>(
    url: string | number,
    data?: Y,
    options?: Options,
    fetchOverride?: Window['fetch']
  ): Promise<T> {
    if (!browser) {
      if (this.versionResolver) {
        await this.versionResolver;
        this.versionResolver = undefined;
      }
    }
    try {
      return await this.client.post(url, data, options, fetchOverride);
    } catch {
      this.client.options.query.version = null;
      return await this.client.post(url, data, options, fetchOverride);
    }
  }

  public async get<T = unknown>(
    url: string | number,
    options?: Options,
    fetchOverride?: Window['fetch']
  ): Promise<T> {
    if (!browser) {
      if (this.versionResolver) {
        await this.versionResolver;
        this.versionResolver = undefined;
      }
    }
    try {
      return await this.client.get(url, options, fetchOverride);
    } catch {
      this.client.options.query.version = null;
      return await this.client.get(url, options, fetchOverride);
    }
  }
}

const api = new YukiApiImpl(
  mande(getAPIUrl(), {
    query: {
      'n': ['web', import.meta.env.GIT_BRANCH].join('-'),
      version: undefined
    }
  })
);

export { api as YukiApi };

const stores = {
  ships: writable(new Map<number, Ship>()),
  officers: writable(new Map<number, Officer>()),
  resources: writable(new Map<number, Resource>()),
  researches: writable(new Map<number, Research>()),
  buildings: writable(new Map<number, Building>()),
  systems: writable(new Map<number, System>()),
  buff_map: writable(new Map<number, { source: number; id: number }[]>())
};

let resourceFetchDone = false;
export async function waitStaticData(fetchOverride?: Window['fetch']) {
  if (!resourceFetchDone) {
    return Promise.all([
      api.get('/resource', undefined, fetchOverride).then((e: Resource[]) => {
        const m = new Map();
        for (const resource of e) {
          m.set(resource.id, resource);
        }
        stores.resources.set(m);
      }),
      api.get('/system', undefined, fetchOverride).then((e: System[]) => {
        const m = new Map();
        for (const system of e) {
          m.set(system.id, system);
        }
        stores.systems.set(m);
      }),
      api.get('/research', undefined, fetchOverride).then((e: Research[]) => {
        const m = new Map();
        for (const resource of e) {
          m.set(resource.id, resource);
        }
        stores.researches.set(m);
      }),
      api.get('/building', undefined, fetchOverride).then((e: Building[]) => {
        const m = new Map();
        for (const resource of e) {
          m.set(resource.id, resource);
        }
        stores.buildings.set(m);
      }),
      api.get('/officer', undefined, fetchOverride).then((e: Officer[]) => {
        const m = new Map();
        for (const officer of e) {
          m.set(officer.id, officer);
        }
        stores.officers.set(m);
      }),
      api.get('/ship', undefined, fetchOverride).then((e: Ship[]) => {
        const m = new Map();
        for (const officer of e) {
          m.set(officer.id, officer);
        }
        stores.ships.set(m);
      }),
      api.get('/config/buffs', undefined, fetchOverride).then((e: { [key: string]: number[] }) => {
        const m = new Map();
        for (const buffMod in e) {
          const buffModI = parseInt(buffMod);
          const n = e[buffMod];
          m.set(
            buffModI,
            n.map((e) => {
              return {
                source: e[0],
                id: e[1]
              };
            })
          );
        }
        stores.buff_map.set(m);
      })
    ])
      .then(() => {
        resourceFetchDone = true;
      })
      .catch((e) => {
        console.error('Failed to load static data:', e);
      });
  }
}

export function getStaticData() {
  return stores;
}
