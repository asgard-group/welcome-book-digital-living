import { LogIn, DoorOpen, AlertCircle, ArrowRight, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProperty } from "@/property/useProperty";
import { PageShell } from "@/components/PageShell";
import { DetailLines } from "@/components/DetailLines";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import { stayServices, DEFAULT_ARRIVAL_TIME, DEFAULT_DEPARTURE_TIME } from "@/property/stay";

const KIND_ICONS: Record<"arrivee" | "depart" | "information", LucideIcon> = {
  arrivee: LogIn,
  depart: DoorOpen,
  information: AlertCircle,
};

function Widget({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white">
      {children}
    </div>
  );
}

export default function Checkout() {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { data: property } = useProperty();
  const { t, lang } = useLanguage();

  // Bandeau des horaires : libellés et heures saisis dans l'admin, sinon valeurs par défaut.
  const schedule = property?.schedule;
  const text = (b: { fr: string; en: string } | undefined, fallback: string) => (b?.[lang] || b?.fr || "").trim() || fallback;
  const arrival = { label: text(schedule?.arrivalLabel, t.checkout.arrivalLabel), time: schedule?.arrivalTime?.trim() || DEFAULT_ARRIVAL_TIME };
  const departure = { label: text(schedule?.departureLabel, t.checkout.departureLabel), time: schedule?.departureTime?.trim() || DEFAULT_DEPARTURE_TIME };

  // Raccourci vers les services « En plus » liés à l'arrivée / au départ : il reprend leur nom actuel.
  const linkedTitle = stayServices(property?.services?.quote).map((s) => s.name[lang] || s.name.fr).join(" / ");

  return (
    <PageShell
      title={pageText(property, "checkout", "title", lang, t.checkout.title)}
      subtitle={pageText(property, "checkout", "subtitle", lang, t.checkout.subtitle)}
    >

      {/* Horaires banner */}
      <div className="px-[30px] mb-4 shrink-0 lg:px-10">
        <div className="rounded-xl backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 px-5 py-4 flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-xs font-medium text-brand-ink/50 dark:text-white/50 uppercase tracking-wide mb-1">
              {arrival.label}
            </p>
            <p className="text-[32px] font-semibold leading-none text-brand-ink dark:text-white">{arrival.time}</p>
          </div>
          <div className="flex items-center justify-center px-3">
            <ArrowRight className="h-5 w-5 text-brand-ink/40 dark:text-white/40" strokeWidth={1.75} />
          </div>
          <div className="text-center flex-1">
            <p className="text-xs font-medium text-brand-ink/50 dark:text-white/50 uppercase tracking-wide mb-1">
              {departure.label}
            </p>
            <p className="text-[32px] font-semibold leading-none text-brand-ink dark:text-white">{departure.time}</p>
          </div>
        </div>
      </div>

      {/* Widgets, from this apartment's Notion "Check-in / Check-out" table */}
      <div className="px-[30px] space-y-4 lg:px-10">
        {(property?.stay ?? []).map((block, i) => {
          const Icon = KIND_ICONS[block.kind];
          return (
            <Widget key={`${i}-${block.name.fr}`}>
              <div className="flex items-center gap-3 mb-3">
                <Icon className="h-5 w-5 text-brand-ink dark:text-white" strokeWidth={2} />
                <h2 className="font-semibold text-brand-ink dark:text-white">{block.name[lang]}</h2>
              </div>
              {block.detail && (
                <DetailLines text={block.detail[lang] || block.detail.fr} />
              )}
            </Widget>
          );
        })}

        {/* Lien vers Services : arrivée anticipée / départ tardif (masqué si ces services n'existent plus) */}
        {linkedTitle && (
        <Link
          to={`/${buildingSlug}/services`}
          className="flex items-center justify-between gap-3 rounded-xl px-4 py-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 hover:bg-brand-surface/90 dark:hover:bg-brand-ink/85 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-brand-ink dark:text-white shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold text-brand-ink dark:text-white">{linkedTitle}</p>
              <p className="text-xs text-brand-ink/60 dark:text-white/60 mt-0.5">{t.checkout.onRequest}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-brand-ink/50 dark:text-white/50 shrink-0" strokeWidth={1.75} />
        </Link>
        )}
      </div>

    </PageShell>
  );
}
