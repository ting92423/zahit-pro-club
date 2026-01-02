'use server';

import { cookies } from 'next/headers';

export async function switchLanguage(lang: 'en' | 'zh') {
  const c = await cookies();
  c.set('NEXT_LOCALE', lang, { path: '/', maxAge: 60 * 60 * 24 * 365 });
}
