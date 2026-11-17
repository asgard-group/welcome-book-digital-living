import { useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

/** True à partir du breakpoint `lg` de Tailwind (mise en page en deux panneaux). */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}
