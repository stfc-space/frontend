import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from '@sveltejs/kit';

import { nanoid } from 'nanoid';

import game_profiles, { forwardRequest } from './storage';

export const GET: RequestHandler = async (event) => {
  if (!dev) {
    return await forwardRequest(event);
  } else {
    return json(
      Object.entries(game_profiles).map(([k, v]) => {
        return { id: k, ...(v as object) };
      }),
      {
        headers: {
          'X-NON-PROD': 'MISTAKE'
        }
      }
    );
  }
};

export const POST: RequestHandler = async (event) => {
  if (!dev) {
    return await forwardRequest(event);
  } else {
    const id = nanoid();
    const content: any = await event.request.json();
    if (!content.modified) {
      content.modified = Math.floor(new Date().getTime() / 1000);
    }
    game_profiles[id] = content;
    return json(id, {
      headers: {
        'X-NON-PROD': 'MISTAKE'
      }
    });
  }
};
