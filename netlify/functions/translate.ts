// POST /api/translate  (admin only)
// Body: { text: string }
// Returns: { translation: string }
import { isAdminRequest } from "./_lib/admin";
import { json } from "./_lib/grants";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_URL = DEEPL_API_KEY?.endsWith(":fx")
  ? "https://api-free.deepl.com/v2/translate"
  : "https://api.deepl.com/v2/translate";

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (!(await isAdminRequest(req))) return json(401, { error: "unauthorized" });
  if (!DEEPL_API_KEY) return json(503, { error: "deepl_not_configured" });

  const body = await req.json().catch(() => ({}));
  const text: string = body.text ?? "";
  if (!text.trim()) return json(400, { error: "missing_text" });

  const res = await fetch(DEEPL_URL, {
    method: "POST",
    headers: {
      authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ text: [text], source_lang: "FR", target_lang: "EN" }),
  });

  if (!res.ok) return json(502, { error: "deepl_error", status: res.status });

  const data = await res.json();
  const translation: string = data?.translations?.[0]?.text ?? text;
  return json(200, { translation });
};
