'use client';

import { createContext, useContext, ReactNode } from 'react';
import { en } from '@/messages/en';
import { zh } from '@/messages/zh';

export type Lang = 'en' | 'zh';
export type Translations = typeof en;

const translations: Record<Lang, Translations> = { en, zh };

interface LangContextValue {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'zh',
  t: zh,
  toggleLang: () => {},
});

export function LangProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  const value: LangContextValue = {
    lang,
    t: translations[lang],
    toggleLang: () => {
      const next = lang === 'en' ? 'zh' : 'en';
      // Use URL param so it works across hostnames (localhost vs LAN IP)
      const url = new URL(window.location.href);
      url.searchParams.set('lang', next);
      window.location.href = url.toString();
    },
  };

  return (
    <LangContext.Provider value={value}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
