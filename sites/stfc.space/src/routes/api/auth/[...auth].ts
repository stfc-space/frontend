import type { RequestHandler } from '@sveltejs/kit';
import { Buffer } from 'buffer';

const KRATOS_BACKEND_URL = import.meta.env.VITE_KRATOS_BACKEND_URL as string;

interface RequestEvent<Params = Record<string, string>> {
  request: Request;
  url: URL;
  params: Params;
  locals: App.Locals;
  platform: Readonly<App.Platform>;
}

export const post: RequestHandler = async (event) => {
  return await forwardRequest(event, 'post');
};

export const get: RequestHandler = async (event) => {
  return await forwardRequest(event, 'get');
};

async function forwardRequest(event: RequestEvent, method: string) {
  const { auth } = event.params;
  const search = event.url.searchParams.toString();
  const q = search.length > 0 ? '?' + search : '';
  const url = `${KRATOS_BACKEND_URL}/${auth}${q}`;

  if (auth === 'ui/welcome') {
    // A special for redirecting to the home page
    // if we were being redirected to the hosted UI
    // welcome page.
    return Response.redirect('/', 303);
  }

  const headerCopy = new Headers(event.request.headers);

  headerCopy.delete('host');
  headerCopy.delete('via');

  const response = await fetch(url, {
    method,
    redirect: 'manual',
    headers: headerCopy,
    body: method === 'get' ? null : event.request.body
  });

  // This just a bunch of stuff that breaks cloudfront
  // TODO(alexander): We _should_ probably filter this inside the CloudFront Lambda
  // but this was easier for now and works correctly
  const disallowedHeaders = [
    'Transfer-Encoding',
    'Content-Encoding',
    'Content-Length',
    'Alt-Svc',
    'Nel',
    'Server',
    'Connection',
    'Expect',
    'Keep-Alive',
    'Proxy-Authenticate',
    'Proxy-Authorization',
    'Proxy-Connection',
    'Trailer',
    'Upgrade',
    'X-Accel-Buffering',
    'X-Accel-Charset',
    'X-Accel-Limit-Rate',
    'X-Accel-Redirect',
    'X-Amz-Cf-*',
    'X-Amz-Cf-Id',
    'X-Cache',
    'X-Edge-*',
    'X-Forwarded-Proto',
    'X-Real-IP'
  ];
  const disallowedHeadersWild = ['X-Amz-Cf-', 'X-Edge-'];

  const responseHeaders = new Headers(response.headers);

  for (const header of disallowedHeaders) {
    responseHeaders.delete(header);
  }

  // Get cookie header
  let cookies = [];

  const respHeaders = responseHeaders as {
    getAll?: (n: string) => string[];
    raw?: () => { [key: string]: string | string[] };
  };

  // This will work in Cloudflare Workers :)
  if (respHeaders.getAll) {
    cookies = respHeaders.getAll('set-cookie');
  } else if (respHeaders.raw) {
    const headers = respHeaders.raw();
    if (headers['set-cookie'] !== undefined) {
      cookies = headers['set-cookie'] as string[];
    }
  } else {
    console.error('Incompatible header parsing');
  }

  const resBody = Buffer.from(await response.arrayBuffer());

  const headers = {};
  responseHeaders.forEach((value, key: string) => {
    if (key == 'set-cookie') {
      return;
    }

    for (const h of disallowedHeadersWild) {
      if (key.startsWith(h)) {
        return;
      }
    }
    if (key in headers) {
      if (!Array.isArray(headers[key])) {
        headers[key] = [headers[key], value];
      } else {
        headers[key].push(value);
      }
    } else {
      headers[key] = value;
    }
  });

  if (cookies.length > 0) {
    headers['set-cookie'] = cookies;
  }

  headers['cache-control'] = 'no-cache, stale-if-error=0';

  const r = {
    body: resBody,
    status: response.status,
    statusText: response.statusText,
    headers: headers
  };
  return r;
}
