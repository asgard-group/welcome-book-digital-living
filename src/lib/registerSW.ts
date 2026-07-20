function shouldRegisterSW(): boolean {
  if (!import.meta.env.PROD) return false;
  if (typeof window === "undefined") return false;
  if (window.self !== window.top) return false;

  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return false;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return false;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return false;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return false;

  if (new URLSearchParams(window.location.search).get("sw") === "off") return false;

  return true;
}

async function unregisterStaleSW(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((r) => r.scope.endsWith("/"))
      .map((r) => r.unregister())
  );
}

export async function registerServiceWorker(): Promise<void> {
  if (shouldRegisterSW()) {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({ immediate: true });
  } else {
    await unregisterStaleSW();
  }
}
