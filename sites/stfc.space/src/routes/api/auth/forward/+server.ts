import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (req) => {
  const headers = {
    'location': '/',
    'set-cookie': [
      `ory_kratos_session=${decodeURIComponent(
        req.url.searchParams.get('s')
      )}; Path=/; Secure; HttpOnly; Max-Age=${req.url.searchParams.get('e')}; SameSite=Lax`
    ]
  };

  return new Response(undefined, { status: 303, headers: headers });
};
