import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../translations.js';
import { api } from '../services/api.js';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Website language state: 'en' (default), 'hinglish', or 'hi'
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('meh_lang');
      if (saved && ['en', 'hinglish', 'hi'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    // Default website language: English for first-time visitors
    return 'en';
  });

  // Dynamic overrides from Admin CMS / Database
  const [customTranslations, setCustomTranslations] = useState({});

  const reloadTranslations = useCallback(async () => {
    try {
      if (api.getTranslations) {
        const res = await api.getTranslations();
        if (res && res.success && res.translations) {
          setCustomTranslations(res.translations);
        }
      }
    } catch {
      // Non-blocking fallback to bundled translations
    }
  }, []);

  useEffect(() => {
    reloadTranslations();
  }, [reloadTranslations]);

  // Synchronize document attributes and CSS language classes for instant font switching
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const langCode = language === 'hi' ? 'hi' : (language === 'hinglish' ? 'hi-Latn' : 'en');
    html.lang = langCode;
    html.setAttribute('data-lang', language);
    if (body) {
      body.setAttribute('data-lang', language);
      body.classList.remove('lang-en', 'lang-hi', 'lang-hinglish');
      body.classList.add(`lang-${language}`);
    }
    html.classList.remove('lang-en', 'lang-hi', 'lang-hinglish');
    html.classList.add(`lang-${language}`);
  }, [language]);

  const setLanguage = (newLang) => {
    if (['en', 'hinglish', 'hi'].includes(newLang)) {
      setLanguageState(newLang);
      try {
        localStorage.setItem('meh_lang', newLang);
        localStorage.setItem('meh_product_lang', newLang);
      } catch {
        // ignore
      }
    }
  };

  // Safe dictionary translator with 3-language hierarchy & server override support
  const t = (key, fallback = '') => {
    // 1. Custom server override for active language
    const custom = customTranslations?.[language]?.[key];
    if (custom && typeof custom === 'string' && custom.trim()) {
      return custom;
    }

    // 2. Active language dictionary
    const currentDict = translations[language];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }

    // 3. Fallback to English dictionary
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }

    // 4. Return explicit fallback or key
    return fallback || key;
  };

  // Safe multilingual product field resolver
  const getProductText = (obj, fieldName) => {
    if (!obj) return '';

    // 1. Check exact active language field (e.g. title_en, title_hinglish, title_hi)
    const directLangVal = obj[`${fieldName}_${language}`];
    if (directLangVal && typeof directLangVal === 'string' && directLangVal.trim()) {
      return directLangVal;
    }

    // 2. Fallbacks based on active language
    if (language === 'hi') {
      const hinglish = obj[`${fieldName}_hinglish`];
      if (hinglish && typeof hinglish === 'string' && hinglish.trim()) return hinglish;
      const en = obj[`${fieldName}_en`];
      if (en && typeof en === 'string' && en.trim()) return en;
    } else if (language === 'hinglish') {
      const en = obj[`${fieldName}_en`];
      if (en && typeof en === 'string' && en.trim()) return en;
      const hi = obj[`${fieldName}_hi`];
      if (hi && typeof hi === 'string' && hi.trim()) return hi;
    } else {
      // English (default)
      const en = obj[`${fieldName}_en`];
      if (en && typeof en === 'string' && en.trim()) return en;
      const hinglish = obj[`${fieldName}_hinglish`];
      if (hinglish && typeof hinglish === 'string' && hinglish.trim()) return hinglish;
      const hi = obj[`${fieldName}_hi`];
      if (hi && typeof hi === 'string' && hi.trim()) return hi;
    }

    // 3. Base un-suffixed field fallback (e.g. obj.title or obj.name)
    const baseVal = obj[fieldName];
    if (baseVal && typeof baseVal === 'string' && baseVal.trim()) {
      return baseVal;
    }

    return '';
  };

  // Safe multilingual array field resolver (e.g. features)
  const getProductArray = (obj, fieldName) => {
    if (!obj) return [];

    const directArray = obj[`${fieldName}_${language}`];
    if (Array.isArray(directArray) && directArray.length > 0) return directArray;

    if (language === 'hi') {
      const hinglish = obj[`${fieldName}_hinglish`];
      if (Array.isArray(hinglish) && hinglish.length > 0) return hinglish;
      const en = obj[`${fieldName}_en`];
      if (Array.isArray(en) && en.length > 0) return en;
    } else if (language === 'hinglish') {
      const en = obj[`${fieldName}_en`];
      if (Array.isArray(en) && en.length > 0) return en;
      const hi = obj[`${fieldName}_hi`];
      if (Array.isArray(hi) && hi.length > 0) return hi;
    } else {
      const en = obj[`${fieldName}_en`];
      if (Array.isArray(en) && en.length > 0) return en;
      const hinglish = obj[`${fieldName}_hinglish`];
      if (Array.isArray(hinglish) && hinglish.length > 0) return hinglish;
      const hi = obj[`${fieldName}_hi`];
      if (Array.isArray(hi) && hi.length > 0) return hi;
    }

    const baseArr = obj[fieldName];
    if (Array.isArray(baseArr) && baseArr.length > 0) return baseArr;

    return [];
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        // Backwards compatibility aliases
        productLang: language,
        setProductLang: setLanguage,
        t,
        getText: getProductText,
        getProductText,
        getArray: getProductArray,
        getProductArray,
        customTranslations,
        reloadTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
