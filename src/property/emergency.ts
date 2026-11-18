import type { Bilingual } from "./types";

/** Contact affiché sur la page Urgences. Le premier de la liste est mis en avant. */
export type EmergencyContact = { name: string; role?: string; phone: string };

/** Contenu par défaut de la page Urgences, utilisé tant que l'admin n'a rien personnalisé. */
export const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: "Chris", role: "Housekeeper Manager", phone: "+33659196366" },
  { name: "Mathilde", role: "Reservation Manager", phone: "+33630001014" },
  { name: "Bérénice", role: "Brand Manager", phone: "+33637754570" },
];

export const DEFAULT_EMERGENCY_EMAIL = "reservation@joro-space.fr";

const DEFAULT_INFO_FR =
  "Privilégiez les échanges via la plateforme de réservation (Booking, Airbnb…) pour assurer le suivi par toute l'équipe Jöro. Utilisez ces contacts uniquement en cas d'urgence.";

/** Le texte par défaut n'a jamais été traduit : il reste en français dans les deux langues. */
export const DEFAULT_EMERGENCY_INFO: Bilingual = { fr: DEFAULT_INFO_FR, en: DEFAULT_INFO_FR };
