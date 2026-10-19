import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-living-room.png";
import type { PropertyData } from "./types";

/** Fallback background, used until an apartment's own photo has loaded (or if it has none). */
export const DEFAULT_BACKGROUND_URL = heroImg;

/** Dev-only sample used when running plain `vite dev` (no backend). */
const DEV_BUILDING: PropertyData = {
  id: "dev",
  name: "Dev Building",
  address: "1 rue de Test, 75000 Paris",
  wifi: { network: "Dev_WiFi_5G", password: "dev-password-123" },
  backgroundUrl: DEFAULT_BACKGROUND_URL,
};

/**
 * Fetch one apartment's booklet data for the given slug (the `:buildingSlug`
 * route param).
 *
 * Access is time-boxed: the guest arrives through a magic link (`/access`),
 * which sets a session cookie for this apartment only. Without a valid cookie
 * the API answers 401 (no session / stay over) or 403 (another apartment's
 * session) and both surface as an "access_required" error for BuildingGate.
 * A 404 means the slug matches no apartment ("building_not_found").
 *
 * Plain `vite dev` has no functions, so a dev sample is returned to keep UI
 * work possible. Under `netlify dev` the real function runs and 401s
 * propagate so the expired flow can be exercised.
 */
async function fetchBuilding(buildingSlug?: string): Promise<PropertyData> {
  const url = buildingSlug ? `/api/building?slug=${encodeURIComponent(buildingSlug)}` : "/api/building";
  let res: Response;
  try {
    res = await fetch(url, { credentials: "include" });
  } catch {
    if (import.meta.env.DEV) return DEV_BUILDING;
    throw new Error("network_error");
  }
  if (res.ok) {
    try {
      return (await res.json()) as PropertyData;
    } catch {
      // Vite's SPA fallback answers unknown routes with HTML (200) in plain `vite dev`.
      if (import.meta.env.DEV) return DEV_BUILDING;
      throw new Error("invalid_response");
    }
  }
  if (res.status === 401 || res.status === 403) throw new Error("access_required");
  if (res.status === 404) throw new Error("building_not_found");
  throw new Error(`building_unavailable_${res.status}`);
}

export function useProperty() {
  const { buildingSlug } = useParams<{ buildingSlug?: string }>();
  const query = useQuery({
    queryKey: ["building", buildingSlug],
    queryFn: () => fetchBuilding(buildingSlug),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error) ?? null,
  };
}
