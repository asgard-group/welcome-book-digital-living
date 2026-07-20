import { useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang } from "./translations";
import { LanguageContext } from "./context";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "fr" || saved === "en") return saved;
    return navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
