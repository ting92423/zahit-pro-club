import { cookies } from 'next/headers';
import { en, zh, type Dictionary } from '@/i18n/dictionaries';

const LANG_COOKIE = 'NEXT_LOCALE';

export async function getLang(): Promise<'en' | 'zh'> {
  const c = await cookies();
  const val = c.get(LANG_COOKIE)?.value;
  return val === 'zh' ? 'zh' : 'en';
}

export async function getDict(): Promise<Dictionary> {
  const lang = await getLang();
  return lang === 'zh' ? zh : en;
}
