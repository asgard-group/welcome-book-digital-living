#!/usr/bin/env node
// Pulls the "Immeubles" Notion database into netlify/functions/_data/buildings.json,
// downloading each building's hero photo/logo into public/buildings/<slug>/ (Notion's
// own file URLs are temporary, so they can't be used directly by the app).
//
// Runs automatically before every build (see package.json's "prebuild"). If
// NOTION_API_KEY isn't set, or the Notion API call fails for any reason, it
// warns and leaves the existing buildings.json untouched rather than failing
// the build — a flaky/misconfigured Notion sync should never take the whole
// site down.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "0101fd7a866e4621b1d1a49c7bb3ef6e";
const NOTION_VERSION = "2022-06-28";
// DeepL free-tier keys end in ":fx" and must hit the separate free API host.
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL = DEEPL_API_KEY?.endsWith(":fx")
  ? "https://api-free.deepl.com/v2/translate"
  : "https://api.deepl.com/v2/translate";
// Never auto-delete this one's image folder: it backs the app's hardcoded
// DEFAULT_BACKGROUND_URL/DEFAULT_LOGO_URL fallback (src/property/useProperty.ts),
// shown briefly while any building's real data is still loading.
const DEFAULT_BUILDING_SLUG = "lamartine";
// Used for "sur devis" services with no email set in Notion yet (no such
// column exists there today — add one named "email" to override per-service).
const DEFAULT_QUOTE_EMAIL = "audrey.robin@joro-space.fr";
// Notion's French category labels (Adresses utiles) -> the app's fixed category ids
// (Explore.tsx's CATEGORY_ICONS / i18n `explore.categories`), lowercased for matching.
const ADDRESS_CATEGORY_MAP = {
  culture: "culture",
  "bien-être": "wellness",
  pratique: "pratique",
  transport: "transport",
  parking: "parking",
  restaurants: "restaurants",
};
// Notion's French category labels (Guide de l'espace équipement) -> bilingual display titles.
const EQUIPMENT_SECTION_TITLES = {
  "équipements": { fr: "Équipements", en: "Equipment" },
  cuisine: { fr: "Cuisine", en: "Kitchen" },
};
// Notion's "étage" multi-select tags -> their English equivalent. Tags not listed
// here (a new floor added later) are left as-is in both languages.
const FLOOR_TAG_TITLES_EN = {
  "R-1": "R-1",
  RDC: "Ground floor",
  "R+1": "R+1",
  "R+2": "R+2",
  "R+3": "R+3",
  Rooftop: "Rooftop",
};
// Display order for floor sections (bottom to top). A tag not listed here (a new
// floor added later) sorts after all of these, in whatever order Notion returns it.
const FLOOR_ORDER = ["R-1", "RDC", "R+1", "R+2", "R+3", "Rooftop"];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILDINGS_JSON_PATH = path.join(ROOT, "netlify/functions/_data/buildings.json");
const PUBLIC_BUILDINGS_DIR = path.join(ROOT, "public/buildings");
// Caches French -> English translations across runs so re-syncing unchanged
// content doesn't burn through the DeepL free-tier quota every build.
const TRANSLATION_CACHE_PATH = path.join(ROOT, "scripts/.translation-cache.json");
let translationCache = {};

async function main() {
  if (!NOTION_API_KEY) {
    console.warn("[sync-notion] NOTION_API_KEY not set — skipping, keeping existing buildings.json");
    return;
  }
  if (!DEEPL_API_KEY) {
    console.warn("[sync-notion] DEEPL_API_KEY not set — English text will fall back to French");
  }

  translationCache = await loadTranslationCache();

  const pages = await queryDatabase(NOTION_DATABASE_ID);
  const buildings = {};

  for (const page of pages) {
    const props = page.properties;
    const slug = getText(props.slug);
    if (!slug) {
      console.warn(`[sync-notion] Skipping a row with no "slug" (Notion page ${page.id})`);
      continue;
    }

    const building = {
      id: slug,
      name: getText(props.nom_public) || slug,
      wifi: {
        network: getText(props.wifi_reseau),
        password: getText(props.wifi_mdp),
      },
      entryCodes: { buildingDoor: "", hallCode: "" },
    };

    const address = getText(props.adresse);
    if (address) building.address = address;

    const guestNetwork = getText(props.wifi_reseau_guest);
    const guestPassword = getText(props.wifi_mdp_guest);
    if (guestNetwork && guestPassword) {
      building.guestWifi = { network: guestNetwork, password: guestPassword };
    }

    const primary = getText(props.couleur_principale);
    const secondary = getText(props.couleur_secondaire);
    if (primary && secondary) {
      building.colors = { primary, secondary };
    }

    const backgroundUrl = await syncFile(getFirstFileUrl(props.background), slug, "hero");
    if (backgroundUrl) building.backgroundUrl = backgroundUrl;

    const logoUrl = await syncFile(getFirstFileUrl(props.logo), slug, "logo");
    if (logoUrl) building.logoUrl = logoUrl;

    // Each building's row is itself a Notion page; its content-area tables
    // (Services, Adresses utiles, Guide de l'espace) live nested inside it as
    // child databases, so we look them up by title on that same page.
    const childDatabases = await getChildDatabases(page.id);

    const servicesDb = findDatabase(childDatabases, "Services");
    if (servicesDb) building.services = await buildServices(servicesDb.id);

    const addressesDb = findDatabase(childDatabases, "Adresses utiles");
    if (addressesDb) building.addresses = await buildAddresses(addressesDb.id);

    const equipmentDb = findDatabase(childDatabases, "Guide de l'espace (équipement)");
    const floorsDb = findDatabase(childDatabases, "Guide de l'espace (étage)");
    if (equipmentDb || floorsDb) {
      building.facilities = await buildFacilities(equipmentDb?.id, floorsDb?.id, slug);
    }

    buildings[slug] = building;
  }

  if (Object.keys(buildings).length === 0) {
    console.warn("[sync-notion] Notion returned 0 usable rows — keeping existing buildings.json");
    return;
  }

  await fs.mkdir(path.dirname(BUILDINGS_JSON_PATH), { recursive: true });
  await fs.writeFile(BUILDINGS_JSON_PATH, JSON.stringify(buildings, null, 2) + "\n");
  console.log(`[sync-notion] Wrote ${Object.keys(buildings).length} building(s) to buildings.json`);

  await cleanupOrphanedBuildingDirs(new Set(Object.keys(buildings)));
  await saveTranslationCache();
}

async function loadTranslationCache() {
  try {
    return JSON.parse(await fs.readFile(TRANSLATION_CACHE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

async function saveTranslationCache() {
  await fs.writeFile(TRANSLATION_CACHE_PATH, JSON.stringify(translationCache, null, 2) + "\n");
}

/**
 * Translates French text to English via DeepL, caching results across runs.
 * Falls back to returning the French text unchanged if DEEPL_API_KEY isn't
 * set or the API call fails — a translation hiccup should never block a sync.
 */
async function translateToEnglish(text) {
  if (!text) return text;
  if (!DEEPL_API_KEY) return text;
  if (translationCache[text]) return translationCache[text];

  // The free-tier DeepL API rate-limits bursts of requests (429), so retry a
  // few times with backoff before giving up and falling back to French.
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(DEEPL_API_URL, {
        method: "POST",
        headers: {
          authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ text: [text], source_lang: "FR", target_lang: "EN-GB" }),
      });

      if (res.status === 429 && attempt < MAX_ATTEMPTS) {
        await sleep(attempt * 1000);
        continue;
      }
      if (!res.ok) {
        console.warn(`[sync-notion] DeepL ${res.status} translating "${text}" — using French as-is`);
        return text;
      }
      const data = await res.json();
      const translated = data.translations?.[0]?.text || text;
      translationCache[text] = translated;
      await sleep(250); // stay under the free tier's requests-per-second limit
      return translated;
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) {
        console.warn(`[sync-notion] DeepL request failed translating "${text}":`, err.message);
        return text;
      }
      await sleep(attempt * 1000);
    }
  }
  return text;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Builds a `{ fr, en }` pair for a piece of Notion text, translating it via DeepL. */
async function bilingual(text) {
  return { fr: text, en: await translateToEnglish(text) };
}

/** Removes public/buildings/<slug>/ folders for buildings no longer in Notion. */
async function cleanupOrphanedBuildingDirs(currentSlugs) {
  let entries;
  try {
    entries = await fs.readdir(PUBLIC_BUILDINGS_DIR, { withFileTypes: true });
  } catch {
    return; // No public/buildings/ directory yet — nothing to clean up.
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === DEFAULT_BUILDING_SLUG) continue;
    if (currentSlugs.has(entry.name)) continue;

    await fs.rm(path.join(PUBLIC_BUILDINGS_DIR, entry.name), { recursive: true, force: true });
    console.log(`[sync-notion] Removed orphaned image folder "${entry.name}" (no longer in Notion)`);
  }
}

async function queryDatabase(databaseId) {
  const results = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${NOTION_API_KEY}`,
        "notion-version": NOTION_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify(cursor ? { start_cursor: cursor } : {}),
    });
    if (!res.ok) {
      throw new Error(`Notion API ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return results;
}

/** Lists the child databases nested directly inside a Notion page (one level, not recursive). */
async function getChildDatabases(pageId) {
  const databases = [];
  let cursor;
  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${pageId}/children`);
    url.searchParams.set("page_size", "100");
    if (cursor) url.searchParams.set("start_cursor", cursor);

    const res = await fetch(url, {
      headers: {
        authorization: `Bearer ${NOTION_API_KEY}`,
        "notion-version": NOTION_VERSION,
      },
    });
    if (!res.ok) {
      throw new Error(`Notion API ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    for (const block of data.results) {
      if (block.type === "child_database") {
        databases.push({ id: block.id, title: block.child_database.title });
      }
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return databases;
}

function findDatabase(databases, title) {
  return databases.find((db) => db.title.trim().toLowerCase() === title.trim().toLowerCase());
}

/** Builds the Services widget data (Inclus / Sur devis) from the "Services" child database. */
async function buildServices(dbId) {
  const rows = await queryDatabase(dbId);
  const included = [];
  const quote = [];

  for (const row of rows) {
    const props = row.properties;
    const name = getText(props.Nom);
    if (!name) continue;
    const icon = getText(props.icon).toLowerCase();
    const categorie = getText(props.categorie).toLowerCase();

    if (categorie === "inclus") {
      included.push({ name: await bilingual(name), icon });
    } else if (categorie === "sur devis") {
      const email = getText(props.email) || DEFAULT_QUOTE_EMAIL;
      quote.push({ name: await bilingual(name), icon, email });
    } else {
      console.warn(`[sync-notion] Service "${name}" has an unrecognized categorie "${categorie}" — skipped`);
    }
  }

  return { included, quote };
}

/** Builds the Explore page data from the "Adresses utiles" child database, grouped by category. */
async function buildAddresses(dbId) {
  const rows = await queryDatabase(dbId);
  const addresses = {};

  for (const row of rows) {
    const props = row.properties;
    const name = getText(props.Nom);
    if (!name) continue;

    const categoryLabel = getText(props.categorie).toLowerCase();
    const categoryId = ADDRESS_CATEGORY_MAP[categoryLabel];
    if (!categoryId) {
      console.warn(`[sync-notion] Address "${name}" has an unrecognized categorie "${categoryLabel}" — skipped`);
      continue;
    }

    const place = { name, address: getText(props.adresse) };
    const distance = getText(props.distance);
    if (distance) place.distance = distance;
    const price = getText(props.prix);
    if (price) place.price = price;
    const description = getText(props.description);
    if (description) place.description = await bilingual(description);

    (addresses[categoryId] ??= []).push(place);
  }

  return addresses;
}

/**
 * Builds the Facilities ("Guide de l'espace") sections from its two child databases:
 * one row per equipment item (grouped by "catégorie"), one row per floor element
 * (grouped by "étage", which may carry several tags for a single merged floor).
 */
async function buildFacilities(equipmentDbId, floorsDbId, slug) {
  const sections = [];

  if (equipmentDbId) {
    const rows = await queryDatabase(equipmentDbId);
    const groups = new Map(); // key -> { title, items }

    for (const row of rows) {
      const props = row.properties;
      const name = getText(props.Nom);
      if (!name) continue;

      const key = getText(props["catégorie"]).toLowerCase();
      if (!groups.has(key)) {
        groups.set(key, { title: EQUIPMENT_SECTION_TITLES[key] ?? { fr: key, en: key }, items: [] });
      }

      const item = { name: await bilingual(name) };
      const detail = getText(props["détail"]);
      if (detail) item.detail = await bilingual(detail);

      const imageUrl = await syncFile(getFirstFileUrl(props["Fichiers et médias"]), slug, `equip-${slugify(name)}`);
      if (imageUrl) item.imageUrl = imageUrl;

      const videoUrl = await syncLinkProperty(props["lien_notice"], slug, `equip-notice-${slugify(name)}`);
      if (videoUrl) item.videoUrl = videoUrl;

      groups.get(key).items.push(item);
    }

    for (const [key, group] of groups) {
      // Items with a notice link surface first, so guests spot them right away.
      const items = [...group.items].sort((a, b) => Number(!a.videoUrl) - Number(!b.videoUrl));
      sections.push({ id: key, title: group.title, kind: "video", items });
    }
  }

  if (floorsDbId) {
    const rows = await queryDatabase(floorsDbId);
    const groups = new Map(); // key -> { title, icon, imageUrl, items }

    for (const row of rows) {
      const props = row.properties;
      const name = getText(props.titre);
      if (!name) continue;

      const tags = getMultiSelect(props["étage"]);
      if (tags.length === 0) {
        console.warn(`[sync-notion] Floor element "${name}" has no "étage" tag — skipped`);
        continue;
      }
      const titleFr = tags.join(" / ");
      const key = titleFr.toLowerCase();

      if (!groups.has(key)) {
        const titleEn = tags.map((tag) => FLOOR_TAG_TITLES_EN[tag] ?? tag).join(" / ");
        const icon = getText(props.icon).toLowerCase();
        const imageUrl = await syncFile(getFirstFileUrl(props["Fichiers et médias"]), slug, `floor-${slugify(key)}`);
        groups.set(key, { id: key, title: { fr: titleFr, en: titleEn }, tags, icon, imageUrl, items: [] });
      }

      const item = { name: await bilingual(name) };
      const detail = getText(props["détail"]);
      if (detail) item.detail = await bilingual(detail);
      groups.get(key).items.push(item);
    }

    // Bottom-to-top floor order (R-1, RDC, R+1, R+2, R+3/Rooftop), not Notion's row order.
    const floorGroups = [...groups.values()].sort((a, b) => floorSortKey(a.tags) - floorSortKey(b.tags));
    for (const group of floorGroups) {
      const section = { id: group.id, title: group.title, kind: "info", items: group.items };
      if (group.icon) section.icon = group.icon;
      if (group.imageUrl) section.imageUrl = group.imageUrl;
      sections.push(section);
    }
  }

  return { sections };
}

/**
 * A "files" property that's either a link to download (an uploaded Notion file,
 * e.g. a PDF notice) or already a stable external URL (e.g. a YouTube link).
 */
async function syncLinkProperty(prop, slug, baseName) {
  if (!prop || prop.type !== "files" || prop.files.length === 0) return null;
  const file = prop.files[0];
  if (file.type === "external") return file.external?.url ?? null;
  return syncFile(file.file?.url ?? null, slug, baseName);
}

/** Lowest FLOOR_ORDER index among a floor section's tags, for bottom-to-top sorting. */
function floorSortKey(tags) {
  const indices = tags.map((tag) => {
    const i = FLOOR_ORDER.indexOf(tag);
    return i === -1 ? FLOOR_ORDER.length : i;
  });
  return Math.min(...indices);
}

function getMultiSelect(prop) {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select.map((o) => o.name);
}

/**
 * Turns arbitrary text into a filesystem-safe filename fragment. "+" is spelled
 * out first so e.g. "R-1" and "R+1" don't collapse onto the same slug (both
 * "+" and "-" would otherwise become the same "-" separator).
 */
function slugify(text) {
  return text
    .replace(/\+/g, "plus")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Extracts plain text from a Notion property, whatever its type (title/rich_text/select/url). */
function getText(prop) {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return prop.title.map((t) => t.plain_text).join("").trim();
    case "rich_text":
      return prop.rich_text.map((t) => t.plain_text).join("").trim();
    case "select":
      return prop.select?.name ?? "";
    case "url":
      return prop.url ?? "";
    default:
      return "";
  }
}

function getFirstFileUrl(prop) {
  if (!prop || prop.type !== "files" || prop.files.length === 0) return null;
  const file = prop.files[0];
  return file.type === "file" ? file.file.url : (file.external?.url ?? null);
}

function extensionFromUrl(url, fallback) {
  const match = new URL(url).pathname.match(/\.[a-zA-Z0-9]+$/);
  return match ? match[0] : fallback;
}

/** Downloads a Notion file URL (temporary!) into public/buildings/<slug>/, returns its app-relative path. */
async function syncFile(url, slug, baseName) {
  if (!url) return null;
  const ext = extensionFromUrl(url, baseName === "logo" ? ".png" : ".jpg");
  const destPath = path.join(PUBLIC_BUILDINGS_DIR, slug, `${baseName}${ext}`);

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`[sync-notion] Failed to download ${baseName} for "${slug}": ${res.status}`);
    return null;
  }
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, Buffer.from(await res.arrayBuffer()));
  return `/buildings/${slug}/${baseName}${ext}`;
}

main().catch((err) => {
  console.warn("[sync-notion] Sync failed, keeping existing buildings.json:", err.message);
});
