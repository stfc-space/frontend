import type { RequestEvent } from '@sveltejs/kit';

export default {};

export function forwardRequest(event: RequestEvent, id?: string) {
  if (event.platform && event.platform.env) {
    if (event.locals.user?.authenticated) {
      if (id) {
        return event.platform.env.USER_STORAGE.fetch(
          `/${event.locals.user.id}/game_profile/${id}`,
          { method: event.request.method, body: event.request.body }
        );
      } else {
        return event.platform.env.USER_STORAGE.fetch(`/${event.locals.user.id}/game_profile`, {
          method: event.request.method,
          body: event.request.body
        });
      }
    } else {
      return { status: 403 };
    }
  } else {
    return null;
  }
}
