"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, TranslationKeys } from "@/lib/translations";

type Language = "en" | "th" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const supportedLanguages: Language[] = ["en", "th", "zh"];

function getBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  const browserLang = navigator.language.split("-")[0];
  return supportedLanguages.includes(browserLang as Language)
    ? (browserLang as Language)
    : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang && supportedLanguages.includes(savedLang as Language)) {
      setLanguageState(savedLang as Language);
      document.documentElement.lang = savedLang;
    } else {
      const defaultLang = getBrowserLanguage();
      setLanguageState(defaultLang);
      document.documentElement.lang = defaultLang;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
