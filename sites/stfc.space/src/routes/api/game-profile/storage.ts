import { error, RequestEvent } from '@sveltejs/kit';

export default {
  'YdXIWDmPsA3eDCib8a9zg': {
    name: 'Test Profile',
    description: "This is just some weird description\nNothing to see here",
    modified: 1659741681,
    buildings: {
      0: 42
    }
  }
};

export async function forwardRequest(event: RequestEvent, id?: string): Promise<Response> {
  if (event.platform && event.platform.env) {
    if (event.locals.user?.authenticated) {
      if (id) {
        return await event.platform.env.USER_STORAGE.fetch(
          `https://user-storage/${event.locals.user.id}/game_profile/${id}`,
          { method: event.request.method, body: event.request.body }
        );
      } else {
        return await event.platform.env.USER_STORAGE.fetch(
          `https://user-storage/${event.locals.user.id}/game_profile`,
          {
            method: event.request.method,
            body: event.request.body
          }
        );
      }
    } else {
      throw error(403, 'forbidden');
    }
  } else {
    throw error(503, 'internal error');
  }
}
