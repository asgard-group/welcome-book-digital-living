import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProperty, useIsPreview, PreviewContext, clearAdminPreview } from "@/property/useProperty";
import { hexToHslString } from "@/lib/color";
import joroLogo from "@/assets/joro-living-logo.png";
import { ExternalLink } from "@/components/ExternalLink";

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

function PreviewBanner({
  slug,
  mobile,
  onDesktop,
  onMobile,
  onOnboarding,
}: {
  slug: string;
  mobile: boolean;
  onDesktop: () => void;
  onMobile: () => void;
  onOnboarding: () => void;
}) {
  const option = (active: boolean) =>
    cn("flex items-center gap-1.5 rounded px-2.5 py-1 transition", active ? "bg-white text-amber-600" : "hover:bg-white/20");
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <span>Mode prévisualisation — modifications non enregistrées</span>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onOnboarding}
          className="rounded-md bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 transition"
        >
          Voir la 1re connexion
        </button>
        {/* Le choix n'a de sens que sur un écran large ; reste visible tant que la vue mobile est active. */}
        <div className={cn("items-center rounded-md bg-white/20 p-0.5 text-xs font-semibold", mobile ? "flex" : "hidden lg:flex")}>
          <button type="button" onClick={onDesktop} aria-pressed={!mobile} className={option(!mobile)}>
            <Monitor className="h-3.5 w-3.5" /> Desktop
          </button>
          <button type="button" onClick={onMobile} aria-pressed={mobile} className={option(mobile)}>
            <Smartphone className="h-3.5 w-3.5" /> Mobile
          </button>
        </div>
        <button
          onClick={() => { clearAdminPreview(slug); window.location.href = window.location.pathname; }}
          className="rounded-md bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 transition"
        >
          Quitter
        </button>
      </div>
    </div>
  );
}

/** Rendu à l'intérieur de PreviewContext.Provider — useProperty() lit le contexte automatiquement. */
function BuildingGateContent({ framed }: { framed: boolean }) {
  const { buildingSlug } = useParams<{ buildingSlug?: string }>();
  const isPreview = useIsPreview();
  const { data, isLoading, isError, error } = useProperty();
  const location = useLocation();
  const navigate = useNavigate();
  // Vue mobile forcée : le livret est rechargé dans un iframe de la largeur d'un téléphone,
  // car la mise en page dépend de la largeur réelle de la fenêtre (media queries).
  const [frameSrc, setFrameSrc] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const showMobile = () => setFrameSrc(`${location.pathname}?preview=1&frame=1`);
  const showDesktop = () => {
    let path: string | undefined;
    try {
      path = frameRef.current?.contentWindow?.location.pathname;
    } catch {
      path = undefined;
    }
    setFrameSrc(null);
    if (path && path !== location.pathname) navigate(path);
  };

  // Rouvre l'écran de première connexion, dans la vue en cours (cadre mobile ou pleine fenêtre).
  const showOnboarding = () => {
    if (frameSrc) setFrameSrc(`/${buildingSlug}?preview=1&frame=1&t=${Date.now()}`);
    else navigate(`/${buildingSlug}`);
  };

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
    <>
      {frameSrc ? (
        <div className="h-app-shell flex items-center justify-center bg-neutral-900 px-4 pt-6 pb-16">
          <iframe
            ref={frameRef}
            src={frameSrc}
            title="Aperçu mobile"
            className="h-full max-h-[844px] w-[390px] max-w-full rounded-[28px] border-0 bg-black shadow-2xl"
          />
        </div>
      ) : (
        <Outlet />
      )}
      {isPreview && !framed && buildingSlug && (
        <PreviewBanner slug={buildingSlug} mobile={!!frameSrc} onDesktop={showDesktop} onMobile={showMobile} onOnboarding={showOnboarding} />
      )}
    </>
  );
}

/**
 * Gate for one apartment's booklet. Sets up PreviewContext (active when ?preview=1
 * is in the URL) so that all child pages automatically use preview data from
 * localStorage instead of the API.
 */
export function BuildingGate() {
  const [searchParams] = useSearchParams();
  // Read once at mount; useState so the flag survives internal navigation.
  const [isPreview] = useState(() => searchParams.get("preview") === "1");
  // frame=1 : cette instance tourne dans l'iframe d'aperçu mobile, le bandeau est porté par la fenêtre parente.
  const [framed] = useState(() => searchParams.get("frame") === "1");
  return (
    <PreviewContext.Provider value={isPreview}>
      <BuildingGateContent framed={framed} />
    </PreviewContext.Provider>
  );
}
