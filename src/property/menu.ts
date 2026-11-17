import { KeyRound, Home as HomeIcon, Info as InfoIcon, Compass, PenSquare, ConciergeBell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Lang, Translation } from "@/i18n/translations";
import type { PropertyData } from "./types";
import { menuText } from "./texts";

export type MenuItem = { label: string; desc?: string; icon: LucideIcon; to: string };

/** Rubriques du livret, dans l'ordre d'affichage (menu d'accueil mobile, onglets desktop). */
export function buildMenu(
  property: PropertyData | null | undefined,
  buildingSlug: string | undefined,
  lang: Lang,
  t: Translation,
): MenuItem[] {
  const p = property ?? undefined;
  return [
    { label: menuText(p, "checkin", lang, t.welcome.menu.checkin), icon: KeyRound, to: `/${buildingSlug}/checkin` },
    { label: menuText(p, "checkout", lang, t.welcome.menu.checkout), icon: PenSquare, to: `/${buildingSlug}/checkout` },
    { label: menuText(p, "facilities", lang, t.welcome.menu.facilities), icon: HomeIcon, to: `/${buildingSlug}/facilities` },
    { label: menuText(p, "services", lang, t.welcome.menu.services), icon: ConciergeBell, to: `/${buildingSlug}/services` },
    { label: menuText(p, "explore", lang, t.welcome.menu.explore), icon: Compass, to: `/${buildingSlug}/explore` },
    { label: menuText(p, "info", lang, t.welcome.menu.info), icon: InfoIcon, to: `/${buildingSlug}/info` },
  ];
}
