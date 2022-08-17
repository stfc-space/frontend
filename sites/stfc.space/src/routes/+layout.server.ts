import * as libCookie from 'cookie';
import { pick } from '$lib/shared/acceptLanguageParse';

import type { LayoutServerLoad } from './$types';

async function getLogoutUrl(request: Request) {
  const r = await fetch(`/api/auth/self-service/logout/browser`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  return (await r.json<{ logout_url: string }>()).logout_url;
}

export const load: LayoutServerLoad = async ({ request, locals }) => {
  const cookies = libCookie.parse(request.headers.get('cookie') || '');
  const theme = cookies.theme ?? 'dark';
  const lang =
    cookies.lang || pick(['en', 'de'], request.headers['accept-language'], { loose: true }) || 'en';
  const userId = locals?.user?.id;
  return {
    theme,
    lang,
    user: userId
      ? {
          id: userId,
          logoutUrl: await getLogoutUrl(request)
        }
      : null
  };
};
