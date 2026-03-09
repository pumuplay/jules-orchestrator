"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, TranslationKey, translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// To fix hydration mismatch without the "flash of english",
// ideally we'd use cookies and server-side logic, but since this
// component is "use client" and we want to keep it simple, we
// hide the UI until mounted or just accept the fallback.
// Given the review, we can just return null or a loader if we
// want to fully avoid the flash, but standard NextJS practice
// for client-only theme/lang is to suppress hydration warnings
// or use a cookie-based approach. Since we are using localStorage,
// hiding until mounted is better than flashing English content
// if the user is in Thai.

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved language from localStorage if available
    const savedLanguage = localStorage.getItem("language") as Language | null;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "th")) {
      setTimeout(() => setLanguageState(savedLanguage), 0);
    }
    setTimeout(() => setMounted(true), 0);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  if (!mounted) {
    return null; // prevents the flash of English
  }

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
