// Emails laissés par les voyageurs sur l'écran de première connexion.
//
// Un enregistrement par couple (logement, email) dans le store Blobs "guest_emails" : la clé
// est dérivée des deux, donc ressaisir le même email met à jour la ligne au lieu d'en créer une.
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export type GuestEmail = {
  email: string;
  buildingId: string;
  /** Langue choisie par le voyageur sur l'écran de première connexion. */
  lang?: "fr" | "en";
  /** Le voyageur a coché « recevoir les offres » (accord explicite, jamais coché d'avance). */
  marketing: boolean;
  /** epoch ms — moment où cet accord a été donné */
  marketingAt?: number;
  /** epoch ms — première saisie */
  createdAt: number;
};

function store() {
  return getStore("guest_emails");
}

export async function saveGuestEmail(entry: Omit<GuestEmail, "createdAt" | "marketingAt">): Promise<void> {
  const email = entry.email.toLowerCase();
  const key = `${entry.buildingId}/${crypto.createHash("sha256").update(email).digest("hex").slice(0, 32)}`;
  const existing = (await store().get(key, { type: "json" })) as GuestEmail | null;
  // Une nouvelle saisie remplace le choix précédent ; la date d'accord n'est conservée que s'il était déjà donné.
  const marketingAt = entry.marketing ? (existing?.marketing && existing.marketingAt) || Date.now() : undefined;
  await store().setJSON(key, { ...entry, email, marketingAt, createdAt: existing?.createdAt ?? Date.now() });
}

export async function listGuestEmails(): Promise<Array<{ key: string } & GuestEmail>> {
  const { blobs } = await store().list();
  const rows = await Promise.all(
    blobs.map(async (b) => {
      const entry = (await store().get(b.key, { type: "json" })) as GuestEmail | null;
      return entry ? { key: b.key, ...entry } : null;
    }),
  );
  return rows.filter(Boolean) as Array<{ key: string } & GuestEmail>;
}

export async function deleteGuestEmail(key: string): Promise<void> {
  await store().delete(key);
}
