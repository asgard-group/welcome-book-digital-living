// GET /api/media?slug=xxx&id=yyy (public, comme /api/image)
//
// Sert une vidéo envoyée par /api/upload-media. La réponse est toujours partielle (206) et ne
// contient au plus qu'un morceau stocké : cela respecte la limite de taille des réponses Netlify
// et fournit les plages d'octets dont Safari a besoin pour lire une vidéo. Le lecteur enchaîne
// de lui-même les requêtes suivantes.
import { getStore } from "@netlify/blobs";

type Meta = { contentType: string; size: number; chunkSize: number; total: number };

export default async (req: Request) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const id = url.searchParams.get("id") ?? "";
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[a-z0-9-]+$/.test(id)) return new Response("missing params", { status: 400 });

  const store = getStore("building_media");
  const meta = (await store.get(`${slug}/${id}/meta`, { type: "json" })) as Meta | null;
  if (!meta) return new Response("not found", { status: 404 });

  // Range: "bytes=START-END", "bytes=START-" ou "bytes=-SUFFIXE" ; absent = depuis le début.
  const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  let start = 0;
  let wantedEnd = meta.size - 1;
  if (match) {
    if (match[1] === "" && match[2] !== "") start = Math.max(0, meta.size - Number(match[2]));
    else {
      start = Number(match[1] || 0);
      if (match[2] !== "") wantedEnd = Math.min(Number(match[2]), meta.size - 1);
    }
  }
  if (start >= meta.size || start > wantedEnd) {
    return new Response(null, { status: 416, headers: { "content-range": `bytes */${meta.size}` } });
  }

  const index = Math.floor(start / meta.chunkSize);
  const chunkStart = index * meta.chunkSize;
  const chunk = (await store.get(`${slug}/${id}/${index}`, { type: "arrayBuffer" })) as ArrayBuffer | null;
  if (!chunk) return new Response("not found", { status: 404 });

  const end = Math.min(wantedEnd, chunkStart + chunk.byteLength - 1);
  const body = chunk.slice(start - chunkStart, end - chunkStart + 1);
  return new Response(body, {
    status: 206,
    headers: {
      "content-type": meta.contentType,
      "content-range": `bytes ${start}-${end}/${meta.size}`,
      "content-length": String(body.byteLength),
      "accept-ranges": "bytes",
      // Chaque envoi a un identifiant unique : le contenu d'une URL ne change jamais.
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
