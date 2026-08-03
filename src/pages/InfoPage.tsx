import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Phone,
  Shield,
  Ambulance,
  Flame,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import heroImg from "@/assets/hero-living-room.png";
import joroLogo from "@/assets/joro-living-logo.png";
import { SettingsPopover } from "@/components/SettingsPopover";
import { ContactWidget } from "@/components/ContactWidget";

export default function InfoPage() {
  const { t } = useLanguage();

  const emergencyList = [
    { label: t.info.police, number: "17", icon: Shield },
    { label: t.info.samu, number: "15", icon: Ambulance },
    { label: t.info.fire, number: "18", icon: Flame },
  ];

  return (
    <div className="min-h-screen w-full bg-muted/30">
      <div className="mx-auto w-full max-w-[760px] min-h-screen relative overflow-hidden shadow-sm">
        {/* Background image (fixed full-viewport wrapper to avoid jumps on mobile scroll) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="relative mx-auto h-full w-full max-w-[760px]">
            <img
              src={heroImg}
              alt="Haussmann Mogador"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen pb-6">
          {/* Back arrow */}
          <div className="px-4 pt-4 flex items-center justify-between shrink-0">
            <Link to="/" aria-label="Back" className="h-11 w-11 flex items-center justify-center">
              <ChevronLeft className="h-6 w-6 text-white" />
            </Link>
            <SettingsPopover variant="light" />
          </div>

          {/* Title */}
          <div className="text-center px-4 mt-1 mb-5 shrink-0">
            <h1 className="text-[32px] leading-tight font-serif font-semibold text-white uppercase">
              {t.info.securityTitle}
            </h1>
            <p className="text-base text-white/80 mt-1">
              {t.info.subtitle}
            </p>
          </div>

          {/* Widgets */}
          <div className="px-[30px] space-y-4">
            {/* Carte 112 */}
            <a
              href="tel:112"
              className="block rounded-xl p-5 backdrop-blur-md bg-destructive/90 text-destructive-foreground"
            >
              <p className="text-sm font-semibold mb-3">{t.info.emergencyNumber}</p>
              <div className="flex items-center justify-center gap-4">
                <Phone className="h-[56px] w-[56px] shrink-0" strokeWidth={1.5} />
                <div className="text-left">
                  <p className="text-[56px] font-medium leading-none tracking-tight">
                    112
                  </p>
                  <p className="text-sm mt-1 opacity-90 font-medium">
                    {t.info.europeanUniversal}
                  </p>
                </div>
              </div>
            </a>

            {/* Lignes d'urgence */}
            <div className="space-y-2">
              {emergencyList.map((item) => (
                <a
                  key={item.number}
                  href={`tel:${item.number}`}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 border border-[#1c2626]/20 dark:border-transparent transition-colors hover:bg-white/95 dark:hover:bg-[#1c2626]/85"
                >
                  <item.icon
                    className="h-5 w-5 text-[#1c2626] dark:text-white shrink-0"
                    strokeWidth={2}
                  />
                  <span className="flex-1 text-[15px] font-medium text-[#1c2626] dark:text-white">
                    {item.label}
                  </span>
                  <span className="text-[17px] font-semibold text-[#1c2626] dark:text-white">
                    {item.number}
                  </span>
                </a>
              ))}
            </div>

            {/* Contact Jöro */}
            <ContactWidget />
          </div>

          {/* Footer logo */}
          <div className="flex justify-center pt-8 pb-2">
            <img
              src={joroLogo}
              alt="Jöro Living"
              className="w-[160px] h-auto object-contain brightness-0 invert"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
