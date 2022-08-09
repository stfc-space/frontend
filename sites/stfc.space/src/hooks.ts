import type { GetSession, Handle } from '@sveltejs/kit';
import * as libCookie from 'cookie';
import { pick } from '$lib/shared/acceptLanguageParse';
import { SignJWT, jwtVerify } from 'jose';
import type { Session } from '@ory/client';
import { Buffer } from 'buffer';

const KRATOS_BACKEND_URL = import.meta.env.VITE_KRATOS_BACKEND_URL as string;

export const getSession: GetSession = async (event) => {
  const request = event.request;
  const cookies = libCookie.parse(request.headers.get('cookie') || '');
  const theme = cookies.theme || 'dark';
  const lang =
    cookies.lang || pick(['en', 'de'], request.headers['accept-language'], { loose: true }) || 'en';
  const userId = event?.locals?.user?.id;
  return {
    theme,
    lang,
    user: userId
      ? {
          id: userId,
          logoutUrl: null
        }
      : null
  };
};

const jwtSecret = Uint8Array.from(Buffer.from(import.meta.env.JWT_SECRET as string, 'base64'));

export const handle: Handle = async ({ event, resolve }) => {
  const request = event.request;
  if (request.headers.get('x-svelte-int') === '1') {
    const response = await resolve(event);
    return response;
  }

  const cookies = libCookie.parse(request.headers.get('cookie') || '');
  const orySession = cookies['ory_kratos_session'];

  const setCookies = [];

  if (orySession) {
    const rSession = cookies['r-session'];
    try {
      const result = await jwtVerify(rSession, jwtSecret);
      if (result.payload.sid !== orySession) {
        throw 'Invalid token. Session Mismatch.';
      }
      event.locals.user = {
        authenticated: true,
        id: result.payload.uid as string,
        session_id: result.payload.sid as string
      };
    } catch (e) {
      console.error('Token validation failed', e);
      const fetchResult = await fetch(
        new Request(`${KRATOS_BACKEND_URL}/sessions/whoami`, {
          headers: {
            'cookie': decodeURIComponent(request.headers.get('cookie')), // Fixup cookie for local development
            'x-svelte-int': '1'
          }
        })
      );
      const whoami = (await fetchResult.json()) as Session;
      const jwt = await new SignJWT({ 'uid': whoami.identity.id, 'sid': orySession })
        .setProtectedHeader({ alg: 'HS512' })
        .setIssuedAt()
        .setIssuer('stfc.space')
        .setAudience('stfc.space')
        .setExpirationTime('2h')
        .sign(jwtSecret);

      event.locals.user = {
        authenticated: true,
        id: whoami.identity.id,
        session_id: orySession
      };

      cookies['r-session'] = jwt;
      setCookies.push(`r-session=${jwt}; HttpOnly; Path=/; Max-Age=7200`);
    }
  } else {
    event.locals.user = null;
  }

  const response = await resolve(event, {
    ssr: !event.url.pathname.startsWith('/playground')
  });
  if (!response) {
    console.error('Failed to get response');
    return undefined;
  }

  if (setCookies.length > 0) {
    for (const c of setCookies) {
      response.headers.append('set-cookie', c);
    }
  }

  return response;
};
