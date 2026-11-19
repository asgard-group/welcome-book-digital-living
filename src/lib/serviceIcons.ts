import {
  KeyRound, ShieldCheck, Wifi, CookingPot, Coffee, Sparkles, Wrench, Droplet,
  Printer, Apple, Palette, Leaf, Armchair, BellRing, Luggage,
  Gift, ShowerHead, Layers, Shirt, WashingMachine, createLucideIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Icônes disponibles pour les services. La clé (`value`) est ce qui est stocké
 * dans les données du logement (et dans la colonne « icone » de Notion).
 * Source unique : utilisée par la page Services et par le sélecteur de l'admin.
 */
/** Fer à repasser : absent de lucide, dessiné ici dans le même style (trait, grille 24). */
const Iron = createLucideIcon("Iron", [
  ["path", { d: "M3 18h18v-4a5 5 0 0 0-5-5H9a6 6 0 0 0-6 6z", key: "body" }],
  ["path", { d: "M10 9V7a1 1 0 0 1 1-1h7", key: "handle" }],
  ["path", { d: "M8 14h.01", key: "hole-1" }],
  ["path", { d: "M12 14h.01", key: "hole-2" }],
]);

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
  { value: "valise", label: "Valise", Icon: Luggage },
  { value: "cadeau", label: "Cadeau", Icon: Gift },
  { value: "douche", label: "Salle de bain (douche)", Icon: ShowerHead },
  { value: "fer", label: "Fer à repasser", Icon: Iron },
  { value: "linge", label: "Pile de linge", Icon: Layers },
  { value: "chemise", label: "Vêtement (chemise)", Icon: Shirt },
  { value: "lave-linge", label: "Lave-linge", Icon: WashingMachine },
];

export const SERVICE_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  SERVICE_ICON_OPTIONS.map((o) => [o.value, o.Icon]),
);
