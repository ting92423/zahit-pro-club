'use client';

import { createContext, useContext } from 'react';
import type { Dictionary } from './dictionaries';

const I18nContext = createContext<{ dict: Dictionary; lang: 'en' | 'zh' } | null>(null);

export function I18nProvider({
  dict,
  lang = 'en', // Default fallback
  children,
}: {
  dict: Dictionary;
  lang?: 'en' | 'zh';
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={{ dict, lang }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
