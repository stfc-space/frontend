import type { Load } from '@sveltejs/kit';
import type { FlowTypeId } from '$lib/shared/auth';
import type { UiContainer } from '@ory/client';

export const createLoad =
  (flowType: FlowTypeId): Load =>
  async ({ url, fetch }) => {
    const flowID = url.searchParams.get('flow');

    if (!flowID) {
      const r = await fetch(`/api/auth/self-service/${flowType}/browser`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (r.status != 200) {
        const t = await r.text();
        if (r.status == 303 || r.status == 302) {
          return {
            status: r.status,
            redirect: r.headers.get('location')
          };
        } else {
          return {
            status: r.status,
            error: t
          };
        }
      }

      const v = (await r.json()) as { id: string };
      if (!v || !v.id) {
        return {
          status: 302,
          redirect: '/'
        };
      } else {
        return {
          status: 302,
          redirect: '?flow=' + v.id
        };
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
          return {
            status: 302,
            redirect: '/auth/error'
          };
        }

        const v = (await r.json()) as { id: string; ui: UiContainer };
        return {
          props: { flowID: v.id, authUi: v.ui }
        };
      }
    }
  };
