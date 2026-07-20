import { createContext } from "react";
import type { Lang, Translation } from "./translations";

export type LanguageCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translation;
};

export const LanguageContext = createContext<LanguageCtx | undefined>(undefined);
