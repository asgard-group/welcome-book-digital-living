import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Mail } from "lucide-react";
import frFlag from "@/assets/icon/flag-icon-set/4_3/fr.svg";
import gbFlag from "@/assets/icon/flag-icon-set/4_3/gb.svg";

import logo from "@/assets/joro-living-logo.png";
import { useLanguage } from "@/i18n/LanguageContext";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";

type Step = "language" | "welcome";

export default function Onboarding() {
  const navigate = useNavigate();
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { t, lang, setLang } = useLanguage();
  const { data: property } = useProperty();

  const [step, setStep] = useState<Step>("language");
  const [email, setEmail] = useState("");

  const finish = async (withEmail: boolean) => {
    const trimmed = email.trim();
    if (withEmail && trimmed && trimmed.includes("@")) {
      try {
        await fetch("/api/guest-email", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
      } catch {}
    }
    try {
      localStorage.setItem(`joro_onboarded_${buildingSlug}`, "1");
    } catch {}
    navigate(`/${buildingSlug}/home`);
  };

  const bg = property?.backgroundUrl ?? DEFAULT_BACKGROUND_URL;

  return (
    <div className="h-app-shell w-full bg-brand-ink">
      <div className="mx-auto w-full max-w-[760px] h-app-shell relative overflow-hidden shadow-sm">
        <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/20 via-brand-ink/10 to-brand-ink/80" />

        <div className="relative z-10 flex h-full w-full flex-col">

          {/* Logo + dots — zone haute */}
          <div className="flex flex-col items-center pt-10 shrink-0">
            {property?.logoUrl && (
              <>
                <img src={property.logoUrl} alt="Logo" className="h-auto max-h-[50px] max-w-[180px] w-auto object-contain brightness-0 invert mb-1" />
                <span className="text-white/80 font-light text-[2rem] leading-none mb-1">×</span>
              </>
            )}
            <img
              src={logo}
              alt="Jöro Living"
              className={property?.logoUrl ? "w-[11rem] h-auto object-contain" : "w-[70%] max-w-[340px] h-auto object-contain"}
            />
            {/* Indicateurs d'étape */}
            <div className="flex gap-[9px] mt-4 items-center">
              {(["language", "welcome"] as Step[]).map((s) => (
                <div
                  key={s}
                  className={`rounded-full transition-all ${
                    step === s ? "w-7 h-[7px] bg-white" : "w-[7px] h-[7px] bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Contenu bas de page */}
          <div className="px-6 pb-12 shrink-0 space-y-5">

            {/* ── Étape 1 : langue ── */}
            {step === "language" && (
              <>
                <div className="text-center space-y-2">
                  <p className="text-white text-[26px] font-semibold leading-tight">
                    Choisissez votre langue
                  </p>
                  <p className="text-white text-base font-normal">Choose your language</p>
                </div>
                <div className="space-y-[24px]">
                  {(["fr", "en"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => { setLang(l); setStep("welcome"); }}
                      className={`w-full relative flex items-center justify-center gap-[7px] rounded-full px-5 py-[10px] transition-colors
                        ${l === "fr"
                          ? "bg-white"
                          : "bg-white/15 backdrop-blur-[2.5px] outline outline-[0.5px] outline-white"}`}
                    >
                      <img
                        src={l === "fr" ? frFlag : gbFlag}
                        alt={l === "fr" ? "FR" : "EN"}
                        className="h-5 w-auto shrink-0"
                      />
                      <span className={`text-[19px] font-semibold leading-[31.58px] ${l === "fr" ? "text-black" : "text-white"}`}>
                        {l === "fr" ? "Français" : "English"}
                      </span>
                      <span className="absolute right-[20px] top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <ChevronRight className={`h-5 w-5 ${l === "fr" ? "text-black/60" : "text-white/80"}`} strokeWidth={2} />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── Étape 2 : bienvenue + email ── */}
            {step === "welcome" && (
              <>
                <div className="text-center space-y-2">
                  <p className="text-white text-[26px] font-semibold leading-tight">
                    {lang === "fr" ? "Bienvenue chez Jöro" : "Welcome to Jöro"}
                  </p>
                  <p className="text-white text-[16px] font-normal leading-snug">
                    {lang === "fr"
                      ? "Laissez votre email pour faciliter nos échanges durant votre séjour."
                      : "Leave your email to make communication easier during your stay."}
                  </p>
                </div>
                <div className="space-y-[24px]">
                  <div className="flex items-center gap-[14px] rounded-xl px-5 py-3 bg-white/10 backdrop-blur-[2.5px] outline outline-[0.5px] outline-white">
                    <Mail className="h-6 w-6 text-white shrink-0" strokeWidth={1.75} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={lang === "fr" ? "votre@email.com" : "your@email.com"}
                      autoComplete="email"
                      className="flex-1 bg-transparent text-white placeholder:text-white/50 text-[16px] font-medium outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => finish(true)}
                    className="w-full relative flex items-center justify-center gap-[7px] rounded-full px-5 py-[10px] bg-white hover:bg-white/90 transition-colors"
                  >
                    <span className="text-[19px] font-semibold leading-[31.58px] text-brand-ink">
                      {lang === "fr" ? "Commencer" : "Get started"}
                    </span>
                    <span className="absolute right-[20px] top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <ChevronRight className="h-5 w-5 text-black/60" strokeWidth={2} />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => finish(false)}
                    className="w-full text-center text-[16px] font-medium text-white/60 underline underline-offset-2 hover:text-white/80 transition-colors"
                  >
                    {lang === "fr" ? "Continuer sans email" : "Continue without email"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
