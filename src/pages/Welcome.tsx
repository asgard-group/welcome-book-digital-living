import { Link, useParams } from "react-router-dom";
import {
  KeyRound,
  Home as HomeIcon,
  Info as InfoIcon,
  Compass,
  PenSquare,
  ConciergeBell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import joroLogo from "@/assets/joro-living-logo.png";
import { SettingsPopover } from "@/components/SettingsPopover";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText, menuText } from "@/property/texts";

type MenuItem = {
  label: string;
  desc?: string;
  icon: LucideIcon;
  to: string;
};

export default function Welcome() {
  const { data: property } = useProperty();
  const { t, lang } = useLanguage();
  const { buildingSlug } = useParams<{ buildingSlug: string }>();

  const menu: MenuItem[] = [
    { label: menuText(property, "checkin", lang, t.welcome.menu.checkin), icon: KeyRound, to: `/${buildingSlug}/checkin` },
    { label: menuText(property, "facilities", lang, t.welcome.menu.facilities), icon: HomeIcon, to: `/${buildingSlug}/facilities` },
    { label: menuText(property, "checkout", lang, t.welcome.menu.checkout), icon: PenSquare, to: `/${buildingSlug}/checkout` },
    { label: menuText(property, "services", lang, t.welcome.menu.services), icon: ConciergeBell, to: `/${buildingSlug}/services` },
    { label: menuText(property, "explore", lang, t.welcome.menu.explore), icon: Compass, to: `/${buildingSlug}/explore` },
    { label: menuText(property, "info", lang, t.welcome.menu.info), icon: InfoIcon, to: `/${buildingSlug}/info` },
  ];

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

          {/* Title / subtitle — hidden on very short viewports so it never overlaps the menu below */}
          <div className="text-center px-4 pt-[30px] shrink-0 [@media(max-height:700px)]:hidden">
            <h1 className="text-[32px] leading-tight font-serif font-semibold text-white uppercase">
              {pageText(property, "welcome", "title", lang, t.welcome.title)}
            </h1>
            <p className="text-base text-white/80">
              {pageText(property, "welcome", "subtitle", lang, "43 boulevard Haussmann, Paris 9")}
            </p>
          </div>

          {/* Menu buttons — fills space between title and footer logo */}
          <nav className="flex-1 min-h-0 flex flex-col justify-center gap-[15px] pb-6 px-[40px] [@media(max-height:700px)]:pb-0">
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
                  <span className="flex-1 flex flex-col items-center text-center px-2 -ml-10">
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
          <div className="flex items-center justify-center gap-5 pt-6 shrink-0">
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
