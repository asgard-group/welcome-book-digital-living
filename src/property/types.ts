/**
 * A piece of Notion-sourced text, auto-translated to English at sync time
 * (see `scripts/sync-notion.mjs`'s `translateToEnglish`). `en` falls back to
 * the French text when translation wasn't available at sync time.
 */
export type Bilingual = { fr: string; en: string };

/** One titled entry of a Notion list (access steps, extra info, check-in/out blocks). */
export type TextEntry = { name: Bilingual; detail?: Bilingual };

/** Pages du livret dont le titre / sous-titre est personnalisable. */
export type PageKey = "welcome" | "checkin" | "facilities" | "checkout" | "services" | "explore" | "info";
/** Boutons de la page d'accueil. */
export type MenuKey = Exclude<PageKey, "welcome">;
/** Textes personnalisés (vides = texte par défaut). */
export type BuildingTexts = {
  menu?: Partial<Record<MenuKey, Bilingual>>;
  pages?: Partial<Record<PageKey, { title?: Bilingual; subtitle?: Bilingual }>>;
};


/**
 * Shape of a single apartment's guest-facing data.
 *
 * Served by `GET /api/building?slug=` (see `netlify/functions/building.ts`) only
 * to a guest holding a valid magic link for that apartment, backed by
 * `netlify/functions/_data/buildings.json`. Keep this in sync with that file.
 */
export type PropertyData = {
  /** Stable building identifier; matches its key in `buildings.json`. */
  id: string;
  /** Public-facing building / property name (shown on the welcome screen). */
  name: string;
  /** Optional until every building sets it. */
  address?: string;
  wifi: {
    network: string;
    password: string;
  };
  /** Titres, sous-titres et libellés de boutons personnalisés (admin). */
  texts?: BuildingTexts;
  /** Guest wifi network, separate from the main one above. Optional until every building sets it. */
  guestWifi?: {
    network: string;
    password: string;
  };
  /** epoch ms when the guest's access ends; sent by the API with the grant. */
  validUntil?: number;
  /** "Accès" sub-database: ordered steps to get in (door codes, floor, keys...). */
  access?: (TextEntry & { code?: string; codeFirst?: boolean })[];
  /** "Infos complémentaires" sub-database: lights, A/C, other tips. */
  extraInfo?: TextEntry[];
  /** "Check-in / Check-out" sub-database: arrival, departure and info blocks. */
  stay?: (TextEntry & { kind: "arrivee" | "depart" | "information" })[];
  /** Brand colors as hex strings. Optional until every building sets them. */
  colors?: {
    primary: string;
    secondary: string;
  };
  /** Hero background photo, served from /buildings/<id>/. Optional until every building sets it. */
  backgroundUrl?: string;
  /** Client logo, served from /buildings/<id>/. Optional until every building sets it. */
  logoUrl?: string;
  /** From the building's Notion "Services" sub-database. Optional until synced. */
  services?: {
    included: { name: Bilingual; icon: string; description?: Bilingual }[];
    quote: { name: Bilingual; icon: string; email?: string; description?: Bilingual }[];
  };
  /**
   * From the building's Notion "Adresses utiles" sub-database, grouped by category id.
   * Optional until synced. `name`/`address` aren't translated (real place names/addresses).
   */
  addresses?: Record<
    string,
    { name: string; address?: string; distance?: string; price?: string; description?: Bilingual; type?: string }[]
  >;
  /**
   * From the building's Notion "Guide de l'espace" sub-databases (equipment + floors),
   * merged into one ordered list of sections. Optional until synced.
   */
  facilities?: {
    sections: {
      id: string;
      title: Bilingual;
      kind: "video" | "info";
      icon?: string;
      /** Shared image for "info" (floor) sections. */
      imageUrl?: string;
      items: {
        name: Bilingual;
        detail?: Bilingual;
        videoUrl?: string;
        /** Per-item image for "video" (equipment) sections. */
        imageUrl?: string;
      }[];
    }[];
  };
};
