import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async (req) => {
  const headers = {
    'location': '/',
    'set-cookie': [
      `ory_kratos_session=${decodeURIComponent(
        req.url.searchParams.get('s')
      )}; Path=/; Secure; HttpOnly; Max-Age=${req.url.searchParams.get('e')}; SameSite=Lax`
    ]
  };

  return {
    status: 303,
    headers: headers
  };
};
