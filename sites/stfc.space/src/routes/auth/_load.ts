import { error, LoadEvent, redirect } from '@sveltejs/kit';
import type { FlowTypeId } from '$lib/shared/auth';
import type { UiContainer } from '@ory/client';
import { browser } from '$app/env';
import { goto } from '$app/navigation';

export const runLoad = async (flowType: FlowTypeId, { url, fetch }: LoadEvent) => {
  const flowID = url.searchParams.get('flow');

  console.log('Load');
  if (!flowID) {
    const r = await fetch(`/api/auth/self-service/${flowType}/browser`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log(r);
    if (r.status != 200) {
      const t = await r.text();
      if (r.status == 303 || r.status == 302) {
        throw redirect(r.status, r.headers.get('location'));
      } else {
        console.log('Magic');
        throw error(r.status, t);
      }
    } else {
      const v = (await r.json()) as { id: string };
      console.log(v);
      if (!v || !v.id) {
        throw redirect(302, '/');
      } else {
        // NOTE(alexander): Redirect doesn't work herein the latest sveltkit build anymore
        // if the path is the same no redirect happens for query param
        // TODO(alexander): Check if this will be fixed or not and if so change this back what it _should_ be
        url.searchParams.set('flow', v.id);
        if (!browser) {
          throw redirect(302, url.pathname + url.search);
        } else {
          return v as { id: string; ui: UiContainer };
        }
      }
    }
  } else {
    if (flowType == 'error') {
      // TODO(alexander): Handle this
    } else {
      const r = await fetch(`/api/auth/self-service/${flowType}/flows?id=${flowID}`, {
        redirect: 'manual',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!r.ok) {
        throw redirect(302, '/auth/error');
      }

      return (await r.json()) as { id: string; ui: UiContainer };
    }
  }
};
