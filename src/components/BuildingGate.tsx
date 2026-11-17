import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useParams, useSearchParams } from "react-router-dom";
import { useProperty, clearAdminPreview } from "@/property/useProperty";
import { hexToHslString } from "@/lib/color";
import joroLogo from "@/assets/joro-living-logo.png";
import { ExternalLink } from "@/components/ExternalLink";

/** True uniquement si la page a été ouverte via le bouton « Prévisualiser » (?preview=1). */
export const PreviewContext = createContext(false);
export const useIsPreview = () => useContext(PreviewContext);

function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-brand-ink px-8 text-center text-white">
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

export function LoadError() {
  return (
    <Screen>
      <div className="max-w-[300px] space-y-2">
        <h1 className="text-[20px] font-semibold">Indisponible</h1>
        <p className="text-sm text-white/80">
          Une erreur est survenue. Réessayez, ou contactez l'équipe Jöro si le problème persiste.
        </p>
      </div>
      <div className="space-y-1 text-sm">
        <ExternalLink href="tel:+33637754570" className="block text-white/90 hover:text-white">
          +33 6 37 75 45 70
        </ExternalLink>
        <ExternalLink href="mailto:reservation@joro-space.fr" className="block text-white/90 hover:text-white">
          reservation@joro-space.fr
        </ExternalLink>
      </div>
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
        <ExternalLink href="tel:+33637754570" className="block text-white/90 hover:text-white">
          +33 6 37 75 45 70
        </ExternalLink>
        <ExternalLink href="mailto:reservation@joro-space.fr" className="block text-white/90 hover:text-white">
          reservation@joro-space.fr
        </ExternalLink>
      </div>
    </Screen>
  );
}

export function BuildingNotFound() {
  return (
    <Screen>
      <div className="max-w-[300px] space-y-2">
        <h1 className="text-[20px] font-semibold">Adresse introuvable</h1>
        <p className="text-sm text-white/80">
          Ce lien ne correspond à aucun logement. Contactez l'équipe Jöro pour obtenir la bonne
          adresse.
        </p>
      </div>
      <div className="space-y-1 text-sm">
        <ExternalLink href="tel:+33637754570" className="block text-white/90 hover:text-white">
          +33 6 37 75 45 70
        </ExternalLink>
        <ExternalLink href="mailto:reservation@joro-space.fr" className="block text-white/90 hover:text-white">
          reservation@joro-space.fr
        </ExternalLink>
      </div>
    </Screen>
  );
}

/**
 * Gate for one apartment's booklet (rendered at `/:buildingSlug`): a guest needs
 * a currently-valid magic-link session for this apartment to see any content.
 * Loads the apartment's data and applies its brand colors as CSS custom
 * properties. Shows a splash while loading, AccessExpired when the link is
 * missing/expired (or belongs to another apartment), BuildingNotFound on an
 * unknown slug, LoadError otherwise.
 */
function PreviewBanner({ slug }: { slug: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <span>Mode prévisualisation — modifications non enregistrées</span>
      <button
        onClick={() => { clearAdminPreview(slug); window.location.reload(); }}
        className="shrink-0 rounded-md bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 transition"
      >
        Quitter
      </button>
    </div>
  );
}

export function BuildingGate() {
  const { buildingSlug } = useParams<{ buildingSlug?: string }>();
  const [searchParams] = useSearchParams();
  // Preview mode is activated only when the URL contains ?preview=1 (set by the admin
  // "Prévisualiser" button). useState so navigation within the building keeps it active.
  const [isPreview] = useState(() => searchParams.get("preview") === "1");
  const { data, isLoading, isError, error } = useProperty(isPreview);

  useEffect(() => {
    if (!data?.colors) return;
    const root = document.documentElement.style;
    root.setProperty("--brand-ink", hexToHslString(data.colors.primary));
    root.setProperty("--brand-surface", hexToHslString(data.colors.secondary));
  }, [data?.colors]);

  if (isLoading) return <Splash />;
  if (isError || !data) {
    return error?.message === "building_not_found" ? <BuildingNotFound /> : <LoadError />;
  }
  return (
    <PreviewContext.Provider value={isPreview}>
      <Outlet />
      {isPreview && buildingSlug && <PreviewBanner slug={buildingSlug} />}
    </PreviewContext.Provider>
  );
}
