import { dev } from '$app/env';
import type { RequestHandler } from '@sveltejs/kit';

import { nanoid } from 'nanoid';

import game_profiles, { forwardRequest } from './_storage';

export const GET: RequestHandler = async (event) => {
  if (!dev) {
    return forwardRequest(event);
  } else {
    return {
      headers: {
        'X-NON-PROD': 'MISTAKE'
      },
      body: Object.entries(game_profiles).map(([k, v]) => {
        return { id: k, ...(v as object) };
      })
    };
  }
};

export const POST: RequestHandler = async (event) => {
  if (!dev) {
    return forwardRequest(event);
  } else {
    const id = nanoid();
    const content = await event.request.json();
    game_profiles[id] = content;
    return {
      headers: {
        'X-NON-PROD': 'MISTAKE'
      },
      body: id
    };
  }
};
