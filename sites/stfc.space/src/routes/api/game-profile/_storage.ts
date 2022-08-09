import type { RequestEvent } from '@sveltejs/kit';

export default {
  'YdXIWDmPsA3eDCib8a9zg': {
    name: 'Test Profile',
    modified: 1659741681,
    buildings: {
      0: 42
    }
  }
};

export function forwardRequest(event: RequestEvent, id?: string) {
  if (event.platform && event.platform.env) {
    if (event.locals.user?.authenticated) {
      if (id) {
        return event.platform.env.USER_STORAGE.fetch(
          `https://user-storage/${event.locals.user.id}/game_profile/${id}`,
          { method: event.request.method, body: event.request.body }
        );
      } else {
        return event.platform.env.USER_STORAGE.fetch(
          `https://user-storage/${event.locals.user.id}/game_profile`,
          {
            method: event.request.method,
            body: event.request.body
          }
        );
      }
    } else {
      return { status: 403 };
    }
  } else {
    return { status: 503 };
  }
}
