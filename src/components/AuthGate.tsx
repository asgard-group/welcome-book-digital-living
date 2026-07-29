import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useProperty } from "@/property/useProperty";
import joroLogo from "@/assets/joro-living-logo.png";

function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#1c2626] px-8 text-center text-white">
      <img
        src={joroLogo}
        alt="Jöro Living"
        className="w-[150px] h-auto object-contain brightness-0 invert"
      />
      {children}
    </div>
  );
}

export function Splash() {
  return (
    <Screen>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    </Screen>
  );
}

export function AccessExpired() {
  return (
    <Screen>
      <div className="max-w-[300px] space-y-2">
        <h1 className="text-[20px] font-semibold">Lien indisponible</h1>
        <p className="text-sm text-white/80">
          Ce lien d'accès est invalide ou a expiré. Contactez l'équipe Jöro pour recevoir un
          nouveau lien.
        </p>
      </div>
      <div className="space-y-1 text-sm">
        <a href="tel:+33637754570" className="block text-white/90 hover:text-white">
          +33 6 37 75 45 70
        </a>
        <a href="mailto:reservation@joro-space.fr" className="block text-white/90 hover:text-white">
          reservation@joro-space.fr
        </a>
      </div>
    </Screen>
  );
}

/**
 * Gate for the whole booklet: a guest needs a currently-valid grant (via the
 * magic link → session cookie) to see any content. While the building request
 * is in flight we show a splash; on 401/error we show the expired screen.
 */
export function AuthGate() {
  const { data, isLoading, isError } = useProperty();
  if (isLoading) return <Splash />;
  if (isError || !data) return <AccessExpired />;
  return <Outlet />;
}
