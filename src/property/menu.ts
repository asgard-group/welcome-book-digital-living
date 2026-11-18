import { KeyRound, Home as HomeIcon, Info as InfoIcon, Compass, PenSquare, ConciergeBell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Lang, Translation } from "@/i18n/translations";
import type { MenuKey, PropertyData } from "./types";
import { menuText } from "./texts";

export type MenuItem = { label: string; desc?: string; icon: LucideIcon; to: string };

/** Ordre par défaut des rubriques. */
export const MENU_KEYS: MenuKey[] = ["checkin", "checkout", "facilities", "services", "explore", "info"];

/** Ordre des rubriques choisi dans l'admin, complété par les rubriques manquantes dans l'ordre par défaut. */
export function orderedMenuKeys(order?: string[]): MenuKey[] {
  const chosen = (order ?? []).filter((k, i, arr): k is MenuKey => MENU_KEYS.includes(k as MenuKey) && arr.indexOf(k) === i);
  return [...chosen, ...MENU_KEYS.filter((k) => !chosen.includes(k))];
}

const ICONS: Record<MenuKey, LucideIcon> = {
  checkin: KeyRound,
  checkout: PenSquare,
  facilities: HomeIcon,
  services: ConciergeBell,
  explore: Compass,
  info: InfoIcon,
};

/** Rubriques du livret, dans l'ordre d'affichage (menu d'accueil mobile, onglets desktop). */
export function buildMenu(
  property: PropertyData | null | undefined,
  buildingSlug: string | undefined,
  lang: Lang,
  t: Translation,
): MenuItem[] {
  const p = property ?? undefined;
  return orderedMenuKeys(p?.texts?.menuOrder).map((key) => ({
    label: menuText(p, key, lang, t.welcome.menu[key]),
    icon: ICONS[key],
    to: `/${buildingSlug}/${key}`,
  }));
}
