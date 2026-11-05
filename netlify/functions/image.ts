// GET /api/image?slug=xxx&field=yyy (public)
// Serves an image stored in Netlify Blobs by upload-image
import { getStore } from "@netlify/blobs";

export default async (req: Request) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const field = url.searchParams.get("field");
  if (!slug || !field) return new Response("missing params", { status: 400 });

  const store = getStore("building_images");
  const result = await store.getWithMetadata(`${slug}/${field}`, { type: "arrayBuffer" });
  if (!result) return new Response("not found", { status: 404 });

  const contentType = (result.metadata?.contentType as string) ?? "image/jpeg";
  return new Response(result.data as ArrayBuffer, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
