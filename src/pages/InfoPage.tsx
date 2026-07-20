import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Phone,
  Shield,
  Ambulance,
  Flame,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import heroImg from "@/assets/hero-living-room.png.asset.json";
import joroLogo from "@/assets/joro-living-logo.png.asset.json";

function Widget({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 text-[#1c2626] dark:text-white">
      {children}
    </div>
  );
}

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
              src={heroImg.url}
              alt="Haussmann Mogador"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen pb-6">
          {/* Back arrow */}
          <div className="px-4 pt-4 flex items-center shrink-0">
            <Link to="/" aria-label="Back" className="h-8 w-8 flex items-center justify-center -ml-1">
              <ChevronLeft className="h-6 w-6 text-white" />
            </Link>
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
            <Widget>
              <div className="flex items-start gap-3">
                <Phone
                  className="h-5 w-5 text-[#1c2626] dark:text-white shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1c2626] dark:text-white">
                    {t.contact.title}
                  </p>
                  <a
                    href="tel:+33637754570"
                    className="block text-sm text-[#1c2626]/70 dark:text-white/80 mt-0.5 hover:text-[#1c2626] dark:hover:text-white transition-colors"
                  >
                    +33 6 37 75 45 70
                  </a>
                  <a
                    href="mailto:reservation@joro-space.fr"
                    className="block text-sm text-[#1c2626]/70 dark:text-white/80 mt-0.5 hover:text-[#1c2626] dark:hover:text-white transition-colors"
                  >
                    reservation@joro-space.fr
                  </a>
                </div>
                <a
                  href="https://wa.me/33637754570"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 mt-0.5"
                >
                  <svg
                    className="h-[29px] w-[29px] text-[#1c2626] dark:text-white shrink-0"
                    viewBox="0 0 42 42"
                    fill="currentColor"
                  >
                    <path d="M33.3374 8.59259C31.7328 6.97228 29.8217 5.68754 27.7155 4.81323C25.6094 3.93892 23.3503 3.49254 21.0699 3.50009C11.5149 3.50009 3.7274 11.2876 3.7274 20.8426C3.7274 23.9051 4.5324 26.8801 6.0374 29.5051L3.5874 38.5001L12.7749 36.0851C15.3124 37.4676 18.1649 38.2026 21.0699 38.2026C30.6249 38.2026 38.4124 30.4151 38.4124 20.8601C38.4124 16.2226 36.6099 11.8651 33.3374 8.59259ZM21.0699 35.2626C18.4799 35.2626 15.9424 34.5626 13.7199 33.2501L13.1949 32.9351L7.7349 34.3701L9.1874 29.0501L8.8374 28.5076C7.39811 26.2099 6.63402 23.5538 6.6324 20.8426C6.6324 12.8976 13.1074 6.42259 21.0524 6.42259C24.9024 6.42259 28.5249 7.92759 31.2374 10.6576C32.5807 11.9944 33.6453 13.5845 34.3692 15.3359C35.0932 17.0873 35.4623 18.965 35.4549 20.8601C35.4899 28.8051 29.0149 35.2626 21.0699 35.2626ZM28.9799 24.4826C28.5424 24.2726 26.4074 23.2226 26.0224 23.0651C25.6199 22.9251 25.3399 22.8551 25.0424 23.2751C24.7449 23.7126 23.9224 24.6926 23.6774 24.9726C23.4324 25.2701 23.1699 25.3051 22.7324 25.0776C22.2949 24.8676 20.8949 24.3951 19.2499 22.9251C17.9549 21.7701 17.0974 20.3526 16.8349 19.9151C16.5899 19.4776 16.7999 19.2501 17.0274 19.0226C17.2199 18.8301 17.4649 18.5151 17.6749 18.2701C17.8849 18.0251 17.9724 17.8326 18.1124 17.5526C18.2524 17.2551 18.1824 17.0101 18.0774 16.8001C17.9724 16.5901 17.0974 14.4551 16.7474 13.5801C16.3974 12.7401 16.0299 12.8451 15.7674 12.8276H14.9274C14.6299 12.8276 14.1749 12.9326 13.7724 13.3701C13.3874 13.8076 12.2674 14.8576 12.2674 16.9926C12.2674 19.1276 13.8249 21.1926 14.0349 21.4726C14.2449 21.7701 17.0974 26.1451 21.4374 28.0176C22.4699 28.4726 23.2749 28.7351 23.9049 28.9276C24.9374 29.2601 25.8824 29.2076 26.6349 29.1026C27.4749 28.9801 29.2074 28.0526 29.5574 27.0376C29.9249 26.0226 29.9249 25.1651 29.8024 24.9726C29.6799 24.7801 29.4174 24.6926 28.9799 24.4826Z" />
                  </svg>
                </a>
              </div>
            </Widget>
          </div>

          {/* Footer logo */}
          <div className="flex justify-center pt-8 pb-2">
            <img
              src={joroLogo.url}
              alt="Jöro Living"
              className="w-[160px] h-auto object-contain brightness-0 invert"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
