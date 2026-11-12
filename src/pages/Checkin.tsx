import { Wifi, MapPin, KeyRound, ChevronLeft, Copy, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import joroLogo from "@/assets/joro-living-logo.png";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import type { Translation } from "@/i18n/translations";

function Widget({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white">
      {children}
    </div>
  );
}

/** Splits "43 boulevard Haussmann 75009 Paris, France" into ["43 boulevard Haussmann", "75009 Paris, France"]. */
function splitAddress(address: string): [string, string?] {
  const match = address.match(/^(.*?)[,]?\s+(\d{5}\s+.*)$/);
  return match ? [match[1].trim(), match[2].trim()] : [address];
}


function CopyField({ value, t }: { value: string; t: Translation }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t.checkin.copiedToast);
    } catch {
      toast.error(t.checkin.copyErrorToast);
    }
  };
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2.5 backdrop-blur-md bg-white/65 dark:bg-white/10">
      <span className="text-sm text-brand-ink dark:text-white">{value}</span>
      <button
        onClick={handleCopy}
        aria-label={t.checkin.copyAria}
        className="text-brand-ink/60 hover:text-brand-ink dark:text-white/70 dark:hover:text-white transition-colors"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}

function Step({ step, title, children }: { step: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-ink/10 dark:bg-white/15 text-brand-ink dark:text-white flex items-center justify-center text-xs font-bold">
        {step}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-brand-ink dark:text-white text-[15px]">{title}</p>
        {children}
      </div>
    </div>
  );
}

function StepDetail({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="text-brand-ink/70 dark:text-white/80 text-sm mt-0.5 whitespace-pre-line">{text}</p>;
}

function FieldSkeleton() {
  return <div className="h-[42px] rounded-xl bg-brand-ink/10 dark:bg-white/10 animate-pulse" />;
}

type FaqItem = { name: { fr: string; en: string }; detail?: { fr: string; en: string } };

function FaqWidget({ items, lang }: { items: FaqItem[]; lang: "fr" | "en" }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="rounded-xl backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 overflow-hidden divide-y divide-brand-ink/10 dark:divide-white/10">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
          >
            <span className="text-[15px] font-semibold text-brand-ink dark:text-white">{item.name[lang]}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-brand-ink/40 dark:text-white/40 transition-transform ${open === i ? "rotate-180" : ""}`}
              strokeWidth={1.75}
            />
          </button>
          {open === i && item.detail?.[lang] && (
            <p className="px-4 pb-4 text-sm text-brand-ink/70 dark:text-white/70 whitespace-pre-line">
              {item.detail[lang]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Checkin() {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { data: property } = useProperty();
  const { t, lang } = useLanguage();

  return (
    <div className="h-app-shell w-full bg-brand-surface dark:bg-brand-ink overflow-hidden">
      <div className="mx-auto w-full max-w-[760px] h-app-shell relative overflow-hidden shadow-sm">
        {/* Background image (non-scrolling shell keeps it static; only the content below scrolls) */}
        <img
          src={property?.backgroundUrl ?? DEFAULT_BACKGROUND_URL}
          alt={property?.name ?? ""}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-ink/30 dark:bg-brand-ink/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-6">
          {/* Back arrow */}
          <div className="sticky top-0 z-20 px-4 pt-4 flex items-center shrink-0">
            <Link to={`/${buildingSlug}/home`} aria-label={t.common.back} className="h-[41px] w-[41px] flex items-center justify-center backdrop-blur-md bg-white/30 dark:bg-brand-ink/50 rounded-[6px]">
              <ChevronLeft className="h-6 w-6 text-white" />
            </Link>
          </div>

          {/* Title */}
          <div className="text-center px-4 pt-[30px] mb-5 shrink-0">
            <h1 className="text-[32px] leading-tight font-serif font-semibold text-white uppercase">
              {pageText(property, "checkin", "title", lang, t.checkin.title)}
            </h1>
            <p className="text-base text-white/80">{pageText(property, "checkin", "subtitle", lang, t.checkin.subtitle)}</p>
          </div>

          {/* Widgets */}
          <div className="px-[30px] space-y-4">
            {/* Wifi */}
            <Widget>
              <div className="flex items-center gap-3 mb-4">
                <Wifi className="h-5 w-5 text-foreground" strokeWidth={2} />
                <h2 className="font-semibold text-foreground">{t.checkin.wifiTitle}</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-brand-ink/70 dark:text-white/70 mb-1.5">{t.checkin.network}</p>
                  {property ? <CopyField value={property.wifi.network} t={t} /> : <FieldSkeleton />}
                </div>
                <div>
                  <p className="text-xs font-medium text-brand-ink/70 dark:text-white/70 mb-1.5">{t.checkin.password}</p>
                  {property ? <CopyField value={property.wifi.password} t={t} /> : <FieldSkeleton />}
                </div>
              </div>
            </Widget>

            {/* Wifi Guest — hidden once loaded if this building has no guest wifi set */}
            {(property === null || property.guestWifi) && (
              <Widget>
                <div className="flex items-center gap-3 mb-4">
                  <Wifi className="h-5 w-5 text-foreground" strokeWidth={2} />
                  <h2 className="font-semibold text-foreground">{t.checkin.wifiGuestTitle}</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-brand-ink/70 dark:text-white/70 mb-1.5">{t.checkin.network}</p>
                    {property?.guestWifi ? <CopyField value={property.guestWifi.network} t={t} /> : <FieldSkeleton />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-ink/70 dark:text-white/70 mb-1.5">{t.checkin.password}</p>
                    {property?.guestWifi ? <CopyField value={property.guestWifi.password} t={t} /> : <FieldSkeleton />}
                  </div>
                </div>
              </Widget>
            )}

            {/* Address */}
            <Widget>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-foreground" strokeWidth={2} />
                <div>
                  {(() => {
                    const [street, rest] = splitAddress(property?.address ?? "");
                    return (
                      <>
                        <p className="font-semibold text-foreground">{street}</p>
                        {rest && <p className="text-xs text-brand-ink/70 dark:text-white/70">{rest}</p>}
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="rounded-[0.5rem] overflow-hidden">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(property?.address ?? "")}&output=embed`}
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Apartment location"
                />
              </div>
            </Widget>

            {/* Access steps (door codes, floor, keys...), from this apartment's Notion "Accès" table */}
            {property?.access && property.access.length > 0 && (
              <Widget>
                <div className="flex items-center gap-3 mb-4">
                  <KeyRound className="h-5 w-5 text-foreground" strokeWidth={2} />
                  <h2 className="font-semibold text-foreground">{t.checkin.accessTitle}</h2>
                </div>
                <div className="space-y-4">
                  {property.access.map((step, i) => (
                    <div key={`${i}-${step.name.fr}`} className="space-y-4">
                      {i > 0 && <div className="-mx-4 border-t border-brand-ink/15 dark:border-white/15" />}
                      <Step step={i + 1} title={step.name[lang]}>
                        {step.detail?.[lang] && (
                          <p className="text-brand-ink/70 dark:text-white/80 text-sm mt-0.5">
                            {step.code && step.codeFirst ? (
                              <><span className="font-semibold text-brand-ink dark:text-white">{step.code}</span> {step.detail[lang]}</>
                            ) : (
                              <>
                                {step.detail[lang]}
                                {step.code && (
                                  <> : <span className="font-semibold text-brand-ink dark:text-white">{step.code}</span></>
                                )}
                              </>
                            )}
                          </p>
                        )}
                        {!step.detail?.[lang] && step.code && (
                          <p className="mt-0.5 font-semibold text-brand-ink dark:text-white text-sm">
                            {step.code}
                          </p>
                        )}
                      </Step>
                    </div>
                  ))}
                </div>
              </Widget>
            )}

            {/* Extra tips (FAQ accordion) */}
            {property?.extraInfo && property.extraInfo.length > 0 && (
              <FaqWidget items={property.extraInfo} lang={lang} />
            )}
          </div>

          {/* Footer logo */}
          <div className="flex items-center justify-center gap-5 pt-8">
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
