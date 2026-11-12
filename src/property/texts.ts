import type { Lang } from "@/i18n/translations";
import type { Bilingual, MenuKey, PageKey, PropertyData } from "./types";

/** Texte personnalisé dans la langue courante (repli sur le français), ou undefined s'il est vide. */
function custom(b: Bilingual | undefined, lang: Lang): string | undefined {
  const v = (b?.[lang] || b?.fr || "").trim();
  return v || undefined;
}

/** Titre ou sous-titre d'une page : personnalisé dans l'admin, sinon `fallback`. */
export function pageText(
  property: PropertyData | undefined,
  page: PageKey,
  field: "title" | "subtitle",
  lang: Lang,
  fallback: string,
): string {
  return custom(property?.texts?.pages?.[page]?.[field], lang) ?? fallback;
}

/** Libellé d'un bouton de la page d'accueil : personnalisé dans l'admin, sinon `fallback`. */
export function menuText(property: PropertyData | undefined, key: MenuKey, lang: Lang, fallback: string): string {
  return custom(property?.texts?.menu?.[key], lang) ?? fallback;
}
