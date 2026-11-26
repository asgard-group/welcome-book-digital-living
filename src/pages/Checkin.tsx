import { Wifi, MapPin, KeyRound, Copy, ChevronDown, HelpCircle, AlertCircle } from "lucide-react";
import { SERVICE_ICONS } from "@/lib/serviceIcons";
import { useState } from "react";
import { toast } from "sonner";
import { useProperty } from "@/property/useProperty";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import type { Translation } from "@/i18n/translations";
import { PhotoFigure } from "@/components/PhotoFigure";
import type { Photo } from "@/property/types";

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
        <p className="font-semibold text-brand-ink dark:text-white text-sm">{title}</p>
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

type FaqItem = { name: { fr: string; en: string }; detail?: { fr: string; en: string }; photo?: Photo };

function FaqWidget({ items, lang, title }: { items: FaqItem[]; lang: "fr" | "en"; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="rounded-xl backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-0">
        <HelpCircle className="h-5 w-5 text-brand-ink dark:text-white shrink-0" strokeWidth={2} />
        <h2 className="text-[16px] font-semibold text-brand-ink dark:text-white">{title}</h2>
      </div>
      <div className="divide-y divide-brand-ink/10 dark:divide-white/10">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
          >
            <span className="text-[14px] font-semibold text-brand-ink dark:text-white">{item.name[lang]}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-brand-ink/40 dark:text-white/40 transition-transform ${open === i ? "rotate-180" : ""}`}
              strokeWidth={1.75}
            />
          </button>
          {open === i && (item.detail?.[lang] || item.photo?.url) && (
            <div className="px-4 pb-4 space-y-3">
              {item.detail?.[lang] && (
                <p className="text-sm text-brand-ink/70 dark:text-white/70 whitespace-pre-line">{item.detail[lang]}</p>
              )}
              {item.photo?.url && <PhotoFigure photo={item.photo} lang={lang} />}
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

export default function Checkin() {
  const { data: property } = useProperty();
  const { t, lang } = useLanguage();

  return (
    <PageShell
      title={pageText(property, "checkin", "title", lang, t.checkin.title)}
      subtitle={pageText(property, "checkin", "subtitle", lang, t.checkin.subtitle)}
    >

      {/* Widgets */}
      <div className="px-[30px] space-y-4 lg:px-10">
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
              <h2 className="text-[16px] font-semibold text-foreground">{t.checkin.accessTitle}</h2>
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

        {/* Encarts libres (icône, titre, texte) ajoutés dans l'onglet « Infos de base » de l'admin */}
        {(property?.notes ?? []).map((note, i) => {
          const Icon = SERVICE_ICONS[note.icon ?? ""] ?? AlertCircle;
          const title = note.title?.[lang] || note.title?.fr;
          const detail = note.detail?.[lang] || note.detail?.fr;
          if (!title && !detail) return null;
          return (
            <Widget key={i}>
              <div className={`flex items-center gap-3 ${detail ? "mb-3" : ""}`}>
                <Icon className="h-5 w-5 shrink-0 text-foreground" strokeWidth={2} />
                {title && <h2 className="font-semibold text-foreground">{title}</h2>}
              </div>
              {detail && <p className="text-sm text-brand-ink/70 dark:text-white/70 whitespace-pre-line">{detail}</p>}
            </Widget>
          );
        })}

        {/* Extra tips (FAQ accordion) */}
        {property?.extraInfo && property.extraInfo.length > 0 && (
          <FaqWidget items={property.extraInfo} lang={lang} title={t.checkin.faqTitle} />
        )}
      </div>

    </PageShell>
  );
}
