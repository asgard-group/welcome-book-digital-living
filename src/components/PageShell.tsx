import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import joroLogo from "@/assets/joro-living-logo.png";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Coque commune des pages de contenu. Mobile : photo plein écran, flèche retour,
 * titre centré, logo en pied. Desktop (lg) : la photo, la navigation et le logo
 * sont portés par DesktopFrame, il ne reste ici que le titre et le contenu.
 */
export function PageShell({
  title,
  subtitle,
  children,
  overlay,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Rendu au-dessus de la zone défilante (ex. panneau de filtres). */
  overlay?: ReactNode;
}) {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { data: property } = useProperty();
  const { t } = useLanguage();

  return (
    <div className="h-app-shell w-full bg-brand-surface dark:bg-brand-ink overflow-hidden lg:h-full lg:bg-transparent dark:lg:bg-transparent">
      <div className="mx-auto w-full max-w-[760px] h-app-shell relative overflow-hidden shadow-sm lg:max-w-none lg:h-full lg:shadow-none">
        <img
          src={property?.backgroundUrl ?? DEFAULT_BACKGROUND_URL}
          alt={property?.name ?? ""}
          className="absolute inset-0 w-full h-full object-cover lg:hidden"
        />
        <div className="absolute inset-0 bg-brand-ink/30 lg:hidden" />

        <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-6 lg:pb-10">
          <div className="sticky top-0 z-20 px-4 pt-4 flex items-center shrink-0 lg:hidden">
            <Link
              to={`/${buildingSlug}/home`}
              aria-label={t.common.back}
              className="h-[41px] w-[41px] flex items-center justify-center backdrop-blur-md bg-white/30 dark:bg-brand-ink/50 rounded-[6px]"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </Link>
          </div>

          <div className="text-center px-4 pt-[30px] mb-5 shrink-0 lg:text-left lg:px-10 lg:pt-2">
            <h1 className="text-[32px] leading-tight font-serif font-semibold text-white uppercase lg:text-[28px] lg:text-brand-ink dark:lg:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base text-white/80 lg:text-brand-ink/70 dark:lg:text-white/70">{subtitle}</p>
            )}
          </div>

          {children}

          <div className="flex items-center justify-center gap-5 pt-8 lg:hidden">
            <img src={joroLogo} alt="Jöro Living" className="h-[30px] w-auto object-contain brightness-0 invert" />
            {property?.logoUrl && (
              <img
                src={property.logoUrl}
                alt="Logo"
                className="h-auto max-h-[36px] max-w-[125px] w-auto object-contain brightness-0 invert"
              />
            )}
          </div>
        </div>

        {overlay}
      </div>
    </div>
  );
}
