import * as libCookie from 'cookie';
import { pick } from '$lib/shared/acceptLanguageParse';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, locals }) => {
  const cookies = libCookie.parse(request.headers.get('cookie') || '');
  const theme = cookies.theme ?? 'dark';
  const lang =
    cookies.lang || pick(['en', 'de'], request.headers['accept-language'], { loose: true }) || 'en';
  return {
    theme,
    lang,
    user: locals?.user?.id
  };
};
