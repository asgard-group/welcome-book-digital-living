import { Wifi, MapPin, ChevronLeft, Copy } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import joroLogo from "@/assets/joro-living-logo.png";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Translation } from "@/i18n/translations";

function Widget({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white">
      {children}
    </div>
  );
}

/** Splits "6 Rue Lamartine 75009 Paris, France" into ["6 Rue Lamartine", "75009 Paris, France"]. */
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

function FieldSkeleton() {
  return <div className="h-[42px] rounded-xl bg-brand-ink/10 dark:bg-white/10 animate-pulse" />;
}

export default function Checkin() {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { data: property } = useProperty();
  const { t } = useLanguage();

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
              {t.checkin.title}
            </h1>
            <p className="text-base text-white/80">{t.checkin.subtitle}</p>
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

            {/* Contrôle d'accès — masqué sur demande, code conservé pour réactivation future
            <Widget>
              <div className="flex flex-col items-center text-center pt-2 pb-4">
                <KeyRound className="h-10 w-10 text-foreground" strokeWidth={2} />
                <h2 className="text-xl font-semibold text-brand-ink dark:text-white leading-tight mt-3">
                  Contrôle d'accès
                </h2>
                <p className="text-[13px] text-brand-ink/70 dark:text-white/80 mt-1 max-w-[280px]">
                  Process contrôle d'accès Bluetooth
                </p>
              </div>
              <div className="border-t border-brand-ink/15 dark:border-white/15" />
              <div className="divide-y divide-brand-ink/15 dark:divide-white/15">
                <div className="py-4">
                  <Step step={1} title="Télécharger STid Mobile ID">
                    Sur l'App Store ou Google Play
                  </Step>
                </div>
                <div className="py-4">
                  <Step step={2} title="Communiquer le numéro">
                    à votre interlocuteur Asgard : property@asgard-reim.fr<br />
                    (Ex : 3883888764)
                  </Step>
                </div>
                <div className="py-4">
                  <Step step={3} title="Mise en place">
                    Iphone : RAS<br />
                    Android : désactivée la fonction NFC
                  </Step>
                </div>
                <div className="pt-4">
                  <Step step={4} title="Activer le Bluetooth">
                    Ouvrir l'application puis approchez votre téléphone devant le lecteur
                  </Step>
                </div>
              </div>
            </Widget>
            */}
          </div>

          {/* Footer logo */}
          <div className="flex items-center justify-center gap-5 pt-8">
            <img
              src={joroLogo}
              alt="Jöro Living"
              className="h-[25px] w-auto object-contain brightness-0 invert"
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
