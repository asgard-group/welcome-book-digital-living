import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AccessExpired, Splash } from "@/components/AuthGate";

/**
 * Landing target of the magic link: `/access?token=...`.
 *
 * Exchanges the token for an HttpOnly session cookie via `/api/enter`, strips
 * the token from the URL, then redirects into the booklet. On failure it shows
 * the expired screen.
 */
export default function Access() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setFailed(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/enter", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) throw new Error(String(res.status));
        if (cancelled) return;
        // Remove the token from the address bar and refetch with the new cookie.
        window.history.replaceState({}, "", "/access");
        await queryClient.invalidateQueries({ queryKey: ["building"] });
        navigate("/", { replace: true });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return failed ? <AccessExpired /> : <Splash />;
}
