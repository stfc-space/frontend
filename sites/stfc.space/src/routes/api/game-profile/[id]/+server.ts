import { dev } from '$app/env';
import type { RequestHandler } from './$types';

import game_profiles, { forwardRequest } from '../storage';

export const GET: RequestHandler = async (event) => {
  const id = event.params.id;
  if (!dev) {
    return await forwardRequest(event, id);
  } else {
    if (id in game_profiles) {
      return new Response(JSON.stringify(game_profiles[id]), {
        headers: {
          'content-type': 'application/json; charset=utf-8'
        }
      });
    } else {
      return new Response(undefined, {
        status: 404,
        headers: {
          'X-NON-PROD': 'MISTAKE'
        }
      });
    }
  }
};

export const PUT: RequestHandler = async (event) => {
  const id = event.params.id;
  if (!dev) {
    return await forwardRequest(event, id);
  } else {
    const content = await event.request.json();
    game_profiles[id] = content;
    return new Response(undefined, {
      headers: {
        'X-NON-PROD': 'MISTAKE'
      }
    });
  }
};

export const DEL: RequestHandler = async (event) => {
  const id = event.params.id;
  if (!dev) {
    return await forwardRequest(event, id);
  } else {
    delete game_profiles[id];
    return new Response(undefined, {
      headers: {
        'X-NON-PROD': 'MISTAKE'
      }
    });
  }
};
