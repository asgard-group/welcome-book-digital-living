import {
  KeyRound, ShieldCheck, Wifi, CookingPot, Coffee, Sparkles, Wrench, Droplet,
  Printer, Apple, Palette, Leaf, Armchair, BellRing,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Icônes disponibles pour les services. La clé (`value`) est ce qui est stocké
 * dans les données du logement (et dans la colonne « icone » de Notion).
 * Source unique : utilisée par la page Services et par le sélecteur de l'admin.
 */
export const SERVICE_ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "clé", label: "Clé", Icon: KeyRound },
  { value: "bouclier", label: "Bouclier", Icon: ShieldCheck },
  { value: "wifi", label: "Wifi", Icon: Wifi },
  { value: "cuisine", label: "Cuisine", Icon: CookingPot },
  { value: "café", label: "Café", Icon: Coffee },
  { value: "ménage", label: "Ménage", Icon: Sparkles },
  { value: "outil", label: "Outil", Icon: Wrench },
  { value: "eau", label: "Eau", Icon: Droplet },
  { value: "imprimante", label: "Imprimante", Icon: Printer },
  { value: "nourriture", label: "Nourriture", Icon: Apple },
  { value: "déco", label: "Déco", Icon: Palette },
  { value: "plante", label: "Plante", Icon: Leaf },
  { value: "mobilier", label: "Mobilier", Icon: Armchair },
  { value: "alarme", label: "Alarme", Icon: BellRing },
];

export const SERVICE_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  SERVICE_ICON_OPTIONS.map((o) => [o.value, o.Icon]),
);
