import type { Lang } from "@/i18n/translations";
import type { Bilingual, MenuKey, PageKey, PropertyData } from "./types";

/** Texte personnalisé dans la langue courante (repli sur le français), ou undefined s'il est vide. */
function custom(b: Bilingual | undefined, lang: Lang): string | undefined {
  const v = (b?.[lang] || b?.fr || "").trim();
  return v || undefined;
}

/**
 * Titre personnalisé d'une rubrique : le même texte sert au bouton de la page d'accueil,
 * à l'onglet desktop et au titre de la page. `texts.menu` est l'ancien champ séparé des
 * boutons, encore lu pour les logements enregistrés avant la fusion.
 */
function customTitle(property: PropertyData | undefined, page: PageKey, lang: Lang): string | undefined {
  return (
    custom(property?.texts?.pages?.[page]?.title, lang) ??
    (page === "welcome" ? undefined : custom(property?.texts?.menu?.[page], lang))
  );
}

/**
 * Titre ou sous-titre d'une page : personnalisé dans l'admin, sinon `fallback`.
 * Le sous-titre vaut "" quand l'admin a coché « Pas de sous-titre ».
 */
export function pageText(
  property: PropertyData | undefined,
  page: PageKey,
  field: "title" | "subtitle",
  lang: Lang,
  fallback: string,
): string {
  if (field === "title") return customTitle(property, page, lang) ?? fallback;
  const texts = property?.texts?.pages?.[page];
  if (texts?.hideSubtitle) return "";
  return custom(texts?.subtitle, lang) ?? fallback;
}

/** Libellé d'un bouton de la page d'accueil : le titre personnalisé de la page, sinon `fallback`. */
export function menuText(property: PropertyData | undefined, key: MenuKey, lang: Lang, fallback: string): string {
  return customTitle(property, key, lang) ?? fallback;
}
