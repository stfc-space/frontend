import { dev } from '$app/env';
import type { RequestHandler } from '@sveltejs/kit';

import game_profiles, { forwardRequest } from './_storage';

export const get: RequestHandler = async (event) => {
  const id = event.params.id;
  if (!dev) {
    return forwardRequest(event, id);
  } else {
    if (id in game_profiles) {
      return {
        body: game_profiles[id]
      };
    } else {
      return {
        headers: {
          'X-NON-PROD': 'MISTAKE'
        },
        status: 404
      };
    }
  }
};

export const put: RequestHandler = async (event) => {
  const id = event.params.id;
  if (!dev) {
    return forwardRequest(event, id);
  } else {
    const content = await event.request.json();
    game_profiles[id] = content;
    return {
      headers: {
        'X-NON-PROD': 'MISTAKE'
      },
      status: 200
    };
  }
};

export const del: RequestHandler = async (event) => {
  const id = event.params.id;
  if (!dev) {
    return forwardRequest(event, id);
  } else {
    delete game_profiles[id];
    return {
      headers: {
        'X-NON-PROD': 'MISTAKE'
      },
      status: 200
    };
  }
};
