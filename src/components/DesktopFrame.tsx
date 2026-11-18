import { NavLink, Outlet, useParams } from "react-router-dom";
import joroLogo from "@/assets/joro-living-logo.png";
import { SettingsPopover } from "@/components/SettingsPopover";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import { buildMenu } from "@/property/menu";
import { cn } from "@/lib/utils";

/**
 * Cadre des pages du livret. Sur mobile il est transparent (chaque page occupe
 * tout l'écran). Sur desktop : photo, titre et logo fixes à gauche ; onglets
 * et contenu de la page à droite.
 */
export function DesktopFrame() {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { data: property } = useProperty();
  const { t, lang } = useLanguage();
  const tabs = buildMenu(property, buildingSlug, lang, t);
  const welcomeSubtitle = pageText(property ?? undefined, "welcome", "subtitle", lang, "43 boulevard Haussmann, Paris 9");

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,33fr)_minmax(0,67fr)] lg:h-app-shell lg:overflow-hidden lg:bg-brand-surface dark:lg:bg-brand-ink">
      <aside className="hidden lg:flex relative flex-col justify-between gap-10 p-10 overflow-hidden">
        <img
          src={property?.backgroundUrl ?? DEFAULT_BACKGROUND_URL}
          alt={property ? `${t.welcome.heroAltPrefix}${property.name}` : t.welcome.heroAltFallback}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/45 via-brand-ink/10 to-brand-ink/75" />

        <div className="relative z-10 flex items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <img src={joroLogo} alt="Jöro Living" className="h-[30px] w-auto object-contain brightness-0 invert" />
            {property?.logoUrl && (
              <img
                src={property.logoUrl}
                alt="Logo"
                className="h-auto max-h-[36px] max-w-[125px] w-auto object-contain brightness-0 invert"
              />
            )}
          </div>
          <SettingsPopover variant="light" />
        </div>

        <div className="relative z-10 rounded-xl px-6 py-5 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80">
          <p className="text-[32px] leading-tight font-serif font-semibold text-brand-ink dark:text-white uppercase">
            {pageText(property ?? undefined, "welcome", "title", lang, t.welcome.title)}
          </p>
          {welcomeSubtitle && (
            <p className="mt-1 text-base text-brand-ink/70 dark:text-white/80 whitespace-pre-line">{welcomeSubtitle}</p>
          )}
        </div>
      </aside>

      <div className="lg:flex lg:flex-col lg:min-h-0 lg:bg-brand-ink/[0.06] dark:lg:bg-white/[0.06]">
        <nav className="hidden lg:flex flex-wrap gap-2 px-10 pt-8 pb-6 shrink-0">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-ink text-white dark:bg-white dark:text-brand-ink"
                    : "bg-brand-surface/80 text-brand-ink hover:bg-brand-surface dark:bg-brand-ink/80 dark:text-white dark:hover:bg-brand-ink",
                )
              }
            >
              <tab.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <div className="lg:flex-1 lg:min-h-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
