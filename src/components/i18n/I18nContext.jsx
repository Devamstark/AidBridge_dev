import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const I18nContext = createContext();

export function I18nProvider({ children, initialLanguage = "en" }) {
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    console.log("[i18n] Language initialized:", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, fallback = key) => {
    const keys = key.split(".");
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }

    // Fallback to English if translation missing
    if (!value && language !== "en") {
      console.warn(`[i18n] Missing translation for key "${key}" in language "${language}", falling back to English`);
      let fallbackValue = translations.en;
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k];
        if (!fallbackValue) break;
      }
      return fallbackValue || fallback;
    }

    return value || fallback;
  };

  const changeLanguage = (newLanguage) => {
    console.log("[i18n] Changing language from", language, "to", newLanguage);
    setLanguage(newLanguage);
    document.documentElement.lang = newLanguage;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}