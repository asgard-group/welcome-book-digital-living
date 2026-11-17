import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tv,
  CookingPot,
  Building2,
  DoorOpen,
  Sun,
  BedDouble,
  Bath,
  ExternalLink,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import { ExternalLink as ExternalLinkConfirm } from "@/components/ExternalLink";
import { useProperty } from "@/property/useProperty";
import { PageShell } from "@/components/PageShell";

// Maps the "icone"/"icon" Select option chosen in Notion's "Guide de l'espace"
// tables to a lucide icon. Falls back to a generic icon per section kind below.
const SECTION_ICONS: Record<string, LucideIcon> = {
  "équipements": Tv,
  cuisine: CookingPot,
  "bâtiment": Building2,
  porte: DoorOpen,
  soleil: Sun,
  salon: Tv,
  chambre: BedDouble,
  bain: Bath,
};


export default function Facilities() {
  const { t, lang } = useLanguage();
  const { data: property } = useProperty();

  const sections = (property?.facilities?.sections ?? []).map((section) => ({
    ...section,
    icon: SECTION_ICONS[section.icon ?? ""] ?? (section.kind === "video" ? Tv : Building2),
  }));

  return (
    <PageShell
      title={pageText(property, "facilities", "title", lang, t.facilities.title)}
      subtitle={pageText(property, "facilities", "subtitle", lang, t.facilities.subtitle)}
    >

      {/* Widgets */}
      <div className="px-[30px] space-y-4 lg:px-10">
        {/* Sections accordion */}
        <Accordion type="multiple" defaultValue={sections.map((s) => s.id)} className="space-y-3">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="rounded-xl px-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <section.icon
                    className="h-5 w-5 text-brand-ink dark:text-white"
                    strokeWidth={2}
                  />
                  <span className="font-semibold text-brand-ink dark:text-white">
                    {section.title[lang]}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="pt-1 space-y-3">
                  {section.items.map((item) => (
                    <div key={item.name.fr} className="flex items-start gap-3">
                      {section.kind === "rules" && (
                        <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm text-brand-ink dark:text-white ${section.kind === "rules" ? "font-medium" : "font-semibold"}`}>
                          {item.name[lang]}
                        </p>
                        {item.detail?.[lang] && (
                          <p className="text-sm text-brand-ink/60 dark:text-white/60 mt-0.5">
                            {item.detail[lang]}
                          </p>
                        )}
                      </div>
                      {item.videoUrl && (
                        <ExternalLinkConfirm
                          href={item.videoUrl}
                          newTab
                          aria-label={t.facilities.videoLinkLabel}
                          className="text-brand-ink/50 dark:text-white/50 shrink-0 mt-0.5"
                        >
                          <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                        </ExternalLinkConfirm>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>

    </PageShell>
  );
}
