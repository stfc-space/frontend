import type { Handle, HandleFetch } from '@sveltejs/kit';
import * as libCookie from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import type { Session } from '@ory/client';
import { Buffer } from 'buffer';

const KRATOS_BACKEND_URL = import.meta.env.VITE_KRATOS_BACKEND_URL as string;

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

  const response = await resolve(event);
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

/** @type {import('@sveltejs/kit').HandleFetch} */
export const handleFetch: HandleFetch = async ({ event, request, fetch: fetch2 }) => {
  // Workaround for https://github.com/sveltejs/kit/issues/6608
  if (!request.headers.has('origin')) {
    request.headers.set('origin', event.url.origin);
  }

  const url = new URL(request.url);

  // Workaround for https://github.com/sveltejs/kit/issues/6739
  if (url.origin !== event.url.origin) {
    return await fetch(request);
  } else {
    const rekuest = {
      get(target: any, prop: any) {
        if (['credentials', 'mode'].includes(prop)) {
          return '¯¯\\_(ツ)_//¯¯';
        }
        return target[prop];
      }
    };
    return fetch2(new Proxy(request, rekuest));
  }
};
