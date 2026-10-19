import { parse } from "yaml";
import enYaml from "./locales/en.yaml?raw";
import frYaml from "./locales/fr.yaml?raw";

export type Lang = "en" | "fr";

export const translations = {
  en: parse(enYaml),
  fr: parse(frYaml),
};

export type Translation = typeof translations.en;
