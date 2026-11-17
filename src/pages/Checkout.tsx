import { LogIn, DoorOpen, AlertCircle, ArrowRight, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProperty } from "@/property/useProperty";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";

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

/**
 * Renders a Notion text field: lines starting with "- " become a bullet list,
 * every other line a paragraph.
 */
function DetailLines({ text }: { text: string }) {
  const blocks: { bullets: boolean; lines: string[] }[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const bullets = line.startsWith("- ");
    const content = bullets ? line.slice(2).trim() : line;
    const last = blocks[blocks.length - 1];
    if (last && last.bullets === bullets) last.lines.push(content);
    else blocks.push({ bullets, lines: [content] });
  }

  return (
    <div className="space-y-2 text-sm text-brand-ink/70 dark:text-white/80 leading-relaxed">
      {blocks.map((block, i) =>
        block.bullets ? (
          <ul key={i} className="list-disc pl-5 space-y-1">
            {block.lines.map((line, j) => (
              <li key={j}>{line}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{block.lines.join(" ")}</p>
        ),
      )}
    </div>
  );
}

export default function Checkout() {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { data: property } = useProperty();
  const { t, lang } = useLanguage();

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
              {lang === "fr" ? "Arrivée" : "Check-in"}
            </p>
            <p className="text-[32px] font-semibold leading-none text-brand-ink dark:text-white">15:00</p>
          </div>
          <div className="flex items-center justify-center px-3">
            <ArrowRight className="h-5 w-5 text-brand-ink/40 dark:text-white/40" strokeWidth={1.75} />
          </div>
          <div className="text-center flex-1">
            <p className="text-xs font-medium text-brand-ink/50 dark:text-white/50 uppercase tracking-wide mb-1">
              {lang === "fr" ? "Départ" : "Check-out"}
            </p>
            <p className="text-[32px] font-semibold leading-none text-brand-ink dark:text-white">11:00</p>
          </div>
        </div>
      </div>

      {/* Widgets, from this apartment's Notion "Check-in / Check-out" table */}
      <div className="px-[30px] space-y-4 lg:px-10 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start">
        {(property?.stay ?? []).map((block, i) => {
          const Icon = KIND_ICONS[block.kind];
          return (
            <Widget key={`${i}-${block.name.fr}`}>
              <div className="flex items-center gap-3 mb-3">
                <Icon className="h-5 w-5 text-brand-ink dark:text-white" strokeWidth={2} />
                <h2 className="font-semibold text-brand-ink dark:text-white">{block.name[lang]}</h2>
              </div>
              {block.detail && (
                <DetailLines text={
                  block.kind !== "information"
                    ? block.detail[lang].split("\n").slice(1).join("\n").trimStart()
                    : block.detail[lang]
                } />
              )}
            </Widget>
          );
        })}

        {/* Lien vers Services : arrivée anticipée / départ tardif */}
        <Link
          to={`/${buildingSlug}/services`}
          className="flex items-center justify-between gap-3 rounded-xl px-4 py-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 hover:bg-brand-surface/90 dark:hover:bg-brand-ink/85 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-brand-ink dark:text-white shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold text-brand-ink dark:text-white">
                {lang === "fr" ? "Arrivée anticipée / départ tardif" : "Early check-in / late check-out"}
              </p>
              <p className="text-xs text-brand-ink/60 dark:text-white/60 mt-0.5">
                {lang === "fr" ? "Option disponible sur devis" : "Available on request"}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-brand-ink/50 dark:text-white/50 shrink-0" strokeWidth={1.75} />
        </Link>
      </div>

    </PageShell>
  );
}
