import { Tv, CookingPot, Building2, DoorOpen, Sun, BedDouble, Bath } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SERVICE_ICON_OPTIONS } from "./serviceIcons";

type IconOption = { value: string; label: string; Icon: LucideIcon };

/** Icônes propres aux sections du Guide du logement (clés historiques de Notion). */
const GUIDE_ICON_OPTIONS: IconOption[] = [
  { value: "équipements", label: "Équipements", Icon: Tv },
  { value: "cuisine", label: "Cuisine", Icon: CookingPot },
  { value: "bâtiment", label: "Bâtiment", Icon: Building2 },
  { value: "porte", label: "Porte", Icon: DoorOpen },
  { value: "soleil", label: "Soleil", Icon: Sun },
  { value: "salon", label: "Salon", Icon: Tv },
  { value: "chambre", label: "Chambre", Icon: BedDouble },
  { value: "bain", label: "Salle de bain", Icon: Bath },
];

/**
 * Icônes proposées pour une section du Guide : celles du guide, puis celles des services.
 * Source unique : utilisée par la page Guide du logement et par le sélecteur de l'admin.
 */
export const FACILITY_ICON_OPTIONS: IconOption[] = [
  ...GUIDE_ICON_OPTIONS,
  ...SERVICE_ICON_OPTIONS.filter((o) => !GUIDE_ICON_OPTIONS.some((g) => g.value === o.value)),
];

export const FACILITY_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  FACILITY_ICON_OPTIONS.map((o) => [o.value, o.Icon]),
);
