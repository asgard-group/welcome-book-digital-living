import { Link, Navigate, useParams } from "react-router-dom";
import joroLogo from "@/assets/joro-living-logo.png";
import { SettingsPopover } from "@/components/SettingsPopover";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import { buildMenu } from "@/property/menu";

export default function Welcome() {
  const { data: property } = useProperty();
  const { t, lang } = useLanguage();
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const isDesktop = useIsDesktop();

  const menu = buildMenu(property, buildingSlug, lang, t);
  const welcomeSubtitle = pageText(property, "welcome", "subtitle", lang, "43 boulevard Haussmann, Paris 9");

  // Sur desktop l'accueil est porté par le panneau gauche de DesktopFrame : on ouvre la première rubrique.
  if (isDesktop) return <Navigate to={menu[0].to} replace />;

  return (
    <div className="h-app-shell w-full bg-brand-surface dark:bg-brand-ink">
      <div className="mx-auto w-full max-w-[760px] h-app-shell relative overflow-hidden shadow-sm">
        {/* Background image */}
        <img
          src={property?.backgroundUrl ?? DEFAULT_BACKGROUND_URL}
          alt={property ? `${t.welcome.heroAltPrefix}${property.name}` : t.welcome.heroAltFallback}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle dark overlay for readability (stronger in dark mode) */}
        <div className="absolute inset-0 bg-brand-ink/30 dark:bg-brand-ink/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full pb-6">
          {/* Top: settings icon (same position as back arrows on other pages) */}
          <div className="px-4 pt-4 flex items-center justify-end shrink-0">
            <SettingsPopover variant="light" />
          </div>

          {/* Titre / sous-titre — réduits (jamais masqués) quand l'écran est court, pour ne pas chevaucher le menu */}
          <div className="text-center px-4 pt-[30px] shrink-0 [@media(max-height:700px)]:pt-3 [@media(max-height:600px)]:pt-2">
            <h1 className="text-[32px] leading-tight font-serif font-semibold text-white uppercase [@media(max-height:700px)]:text-[24px] [@media(max-height:600px)]:text-[20px]">
              {pageText(property, "welcome", "title", lang, t.welcome.title)}
            </h1>
            {welcomeSubtitle && (
              <p className="text-base text-white/80 whitespace-pre-line [@media(max-height:700px)]:text-sm [@media(max-height:600px)]:text-xs">{welcomeSubtitle}</p>
            )}
          </div>

          {/* Menu buttons — fills space between title and footer logo */}
          <nav className="flex-1 min-h-0 flex flex-col justify-center gap-[15px] pb-6 px-[40px] [@media(max-height:700px)]:pb-0 [@media(max-height:700px)]:gap-2.5 [@media(max-height:600px)]:gap-2">
            {menu.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group relative flex items-center rounded-full p-[3px] backdrop-blur-md transition-colors
                    bg-brand-surface/80 hover:bg-brand-surface/90
                    dark:bg-brand-ink/80 dark:hover:bg-brand-ink/90"
                >
                  <span className="flex h-[3rem] w-[3rem] shrink-0 items-center justify-center rounded-full
                    bg-white/65
                    dark:bg-white/10 dark:border-transparent">
                    <item.icon
                      className="h-[25px] w-[25px] text-brand-ink dark:text-white"
                      strokeWidth={1.5}
                    />
                  </span>
                  {/* Marge droite = largeur de l'icône : le libellé reste centré dans le bouton sans jamais passer
                      sur l'icône, et passe sur deux lignes s'il est trop long. */}
                  <span className="min-w-0 flex-1 flex flex-col items-center text-center pl-2 pr-[calc(3rem+0.5rem)]">
                    <span className="text-[15px] font-semibold uppercase text-brand-ink dark:text-white leading-tight">
                      {item.label}
                    </span>
                    {item.desc && (
                      <span className="text-[12px] font-medium text-brand-ink/70 dark:text-white/80 mt-0.5">
                        {item.desc}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
          </nav>


          {/* Footer logo */}
          <div className="flex items-center justify-center gap-5 pt-6 shrink-0 [@media(max-height:700px)]:pt-3 [@media(max-height:600px)]:pt-2">
            <img
              src={joroLogo}
              alt="Jöro Living"
              className="h-[30px] w-auto object-contain brightness-0 invert"
            />
            {property?.logoUrl && (
              <img
                src={property.logoUrl}
                alt="Logo"
                className="h-auto max-h-[36px] max-w-[125px] w-auto object-contain brightness-0 invert"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
