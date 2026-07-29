import { useQuery } from "@tanstack/react-query";
import type { PropertyData } from "./types";

/** Dev-only sample used when running plain `vite dev` (no backend). */
const DEV_BUILDING: PropertyData = {
  id: "dev",
  name: "Dev Building",
  wifi: { network: "Dev_WiFi_5G", password: "dev-password-123" },
  entryCodes: { buildingDoor: "0000", hallCode: "0000" },
};

/**
 * Fetch the authenticated guest's building data.
 *
 * The building is derived server-side from the session cookie set at `/access`,
 * so the client never chooses which building to load. A 401 means the magic
 * link is missing/expired and surfaces as `isError` for AuthGate to handle.
 *
 * Plain `vite dev` has no functions, so a dev sample is returned to keep UI
 * work possible. Under `netlify dev` the real function runs and 401s propagate
 * so the expired flow can be exercised.
 */
async function fetchBuilding(): Promise<PropertyData> {
  let res: Response;
  try {
    res = await fetch("/api/building", { credentials: "include" });
  } catch {
    if (import.meta.env.DEV) return DEV_BUILDING;
    throw new Error("network_error");
  }
  if (res.ok) return (await res.json()) as PropertyData;
  if (res.status === 404 && import.meta.env.DEV) return DEV_BUILDING;
  throw new Error(`building_unavailable_${res.status}`);
}

export function useProperty() {
  const query = useQuery({
    queryKey: ["building"],
    queryFn: fetchBuilding,
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
