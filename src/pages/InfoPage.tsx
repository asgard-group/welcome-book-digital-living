import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Phone, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";
import joroLogo from "@/assets/joro-living-logo.png";
import { ContactWidget } from "@/components/ContactWidget";
import { ExternalLink } from "@/components/ExternalLink";

export default function InfoPage() {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { t, lang } = useLanguage();
  const { data: property } = useProperty();

  const emergencyList = [
    { label: t.info.police, desc: t.info.policeDesc, number: "17" },
    { label: t.info.samu, desc: t.info.samuDesc, number: "15" },
    { label: t.info.fire, desc: t.info.fireDesc, number: "18" },
  ];

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
              {pageText(property, "info", "title", lang, t.info.securityTitle)}
            </h1>
            <p className="text-base text-white/80">
              {pageText(property, "info", "subtitle", lang, t.info.subtitle)}
            </p>
          </div>

          {/* Widgets */}
          <div className="px-[30px] space-y-4">
            {/* Carte 112 */}
            <ExternalLink
              href="tel:112"
              className="flex items-center gap-4 rounded-xl p-4 backdrop-blur-md bg-destructive text-destructive-foreground"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 shrink-0">
                <Phone className="h-6 w-6" strokeWidth={2} />
              </span>
              <div>
                <p className="text-[32px] font-bold leading-none">112</p>
                <p className="text-sm mt-1.5 opacity-85 font-medium">
                  {t.info.europeanUniversal}
                </p>
              </div>
            </ExternalLink>

            {/* Lignes d'urgence */}
            <div className="rounded-xl backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 divide-y divide-brand-ink/10 dark:divide-white/10">
              {emergencyList.map((item) => (
                <ExternalLink
                  key={item.number}
                  href={`tel:${item.number}`}
                  className="flex items-center justify-between gap-3 px-4 py-4"
                >
                  <div>
                    <p className="text-[15px] font-semibold uppercase text-brand-ink dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-sm text-brand-ink/60 dark:text-white/60">{item.desc}</p>
                  </div>
                  <span className="relative flex items-center shrink-0">
                    <span className="flex items-center h-9 pl-4 pr-11 rounded-full bg-destructive/15 text-destructive font-bold text-lg">
                      {item.number}
                    </span>
                    <span className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-sm">
                      <Phone className="h-4 w-4 text-brand-ink dark:text-white" strokeWidth={2} />
                    </span>
                  </span>
                </ExternalLink>
              ))}
            </div>

            {/* Intro contacts */}
            <div className="rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-brand-ink dark:text-white shrink-0" strokeWidth={2} />
                <h2 className="font-semibold text-brand-ink dark:text-white">Information</h2>
              </div>
              <p className="text-sm text-brand-ink/70 dark:text-white/70">
                Privilégiez les échanges via la plateforme de réservation (Booking, Airbnb…) pour assurer le suivi par toute l'équipe Jöro. Utilisez ces contacts uniquement en cas d'urgence.
              </p>
            </div>

            {/* Contact Jöro */}
            <ContactWidget />
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
