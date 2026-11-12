// Shared helpers for reading and writing building data from Netlify Blobs.
// The store is "building_data", key = apartment slug.
// Falls back to the static buildings.json for slugs not yet in Blobs.
import { getStore } from "@netlify/blobs";

export type Bilingual = { fr: string; en: string };

export type PlaceItem = {
  name: string;
  address?: string;
  distance?: string;
  description?: Bilingual;
  type?: string;
};

export type ServiceItem = {
  name: Bilingual;
  icon?: string;
  email?: string;
};

export type AccessStep = {
  name: Bilingual;
  detail?: Bilingual;
  code?: string;
  /** Affiche le code avant le texte (« A4326 puis OK… »). */
  codeFirst?: boolean;
};

export type StayBlock = {
  kind: "arrivee" | "depart" | "information";
  name: Bilingual;
  detail?: Bilingual;
};

export type FaqItem = {
  name: Bilingual;
  detail?: Bilingual;
};

export type FacilityItem = {
  name: Bilingual;
  detail?: Bilingual;
  videoUrl?: string;
};

export type FacilitySection = {
  id: string;
  title: Bilingual;
  kind: "video" | "rules";
  icon?: string;
  items: FacilityItem[];
};

export type BuildingData = {
  id: string;
  name: string;
  address: string;
  wifi: { network: string; password: string };
  guestWifi?: { network: string; password: string };
  colors?: { primary: string; secondary: string };
  backgroundUrl?: string;
  logoUrl?: string;
  access: AccessStep[];
  extraInfo: FaqItem[];
  stay: StayBlock[];
  services: {
    included: ServiceItem[];
    quote: ServiceItem[];
  };
  addresses: {
    restaurants: PlaceItem[];
    shopping: PlaceItem[];
    culture: PlaceItem[];
    enfants: PlaceItem[];
    wellness: PlaceItem[];
    pratique: PlaceItem[];
  };
  facilities?: { sections: FacilitySection[] };
};

function store() {
  return getStore("building_data");
}

export async function getBuilding(slug: string): Promise<BuildingData | null> {
  const data = await store().get(slug, { type: "json" });
  return (data as BuildingData) ?? null;
}

export async function putBuilding(data: BuildingData): Promise<void> {
  await store().setJSON(data.id, data);
}

export async function deleteBuilding(slug: string): Promise<void> {
  await store().delete(slug);
}

export async function listBuildingSlugs(): Promise<string[]> {
  const { blobs } = await store().list();
  return blobs.map((b) => b.key);
}
