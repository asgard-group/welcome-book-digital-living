import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import logo from "@/assets/joro-living-logo.png";
import { useLanguage } from "@/i18n/LanguageContext";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";

export default function Onboarding() {
  const navigate = useNavigate();
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { t } = useLanguage();
  const { data: property } = useProperty();

  const handleStart = () => {
    try {
      localStorage.setItem(`joro_onboarded_${buildingSlug}`, "1");
    } catch {}
    navigate(`/${buildingSlug}/home`);
  };

  return (
    <div className="h-app-shell w-full bg-brand-surface dark:bg-brand-ink">
      <div className="mx-auto w-full max-w-[760px] h-app-shell relative overflow-hidden shadow-sm">
        <img
          src={property?.backgroundUrl ?? DEFAULT_BACKGROUND_URL}
          alt={t.onboarding.heroAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-ink/30 dark:bg-brand-ink/30" />

        <div className="relative z-10 flex h-full w-full flex-col">
          {/* Logos */}
          <div className="flex flex-col items-center px-5 pt-[35%]">
            {property?.logoUrl && (
              <>
                <img src={property.logoUrl} alt="Logo" className="h-auto max-h-[74px] max-w-[260px] w-auto object-contain brightness-0 invert" />
                <span className="text-white/90 font-light text-[3rem] leading-none">×</span>
              </>
            )}
            <img
              src={logo}
              alt="Joro Living"
              className={property?.logoUrl ? "w-[16.17rem] h-auto object-contain" : "w-[88%] max-w-[420px] h-auto object-contain"}
            />
          </div>

          {/* CTA button */}
          <div className="mt-auto pl-[2.25rem] pr-[2.25rem] pb-10 flex justify-center">
            <button
              type="button"
              onClick={handleStart}
              className="relative flex w-full max-w-[390px] items-center justify-center rounded-full bg-brand-surface/80 backdrop-blur-[12px] px-8 py-[0.8rem] transition-colors hover:bg-brand-surface/90"
            >
              <span className="text-center text-brand-ink text-sm font-semibold uppercase">
                {t.onboarding.cta}
              </span>
              <ChevronRight className="absolute right-[1rem] h-5 w-5 text-brand-ink" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
