import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { Tv, Building2, ExternalLink, FileText, PlayCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DetailLines } from "@/components/DetailLines";
import type { PropertyData } from "@/property/types";
import { FACILITY_ICONS } from "@/lib/facilityIcons";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import { ExternalLink as ExternalLinkConfirm } from "@/components/ExternalLink";
import { useProperty } from "@/property/useProperty";
import { PageShell } from "@/components/PageShell";

type FacilityItem = NonNullable<PropertyData["facilities"]>["sections"][number]["items"][number];

export default function Facilities() {
  const { t, lang } = useLanguage();
  const { data: property } = useProperty();
  // Élément dont la notice est ouverte dans la fenêtre (null = fermée).
  const [openNotice, setOpenNotice] = useState<FacilityItem | null>(null);
  const noticeOf = (item: FacilityItem) => (item.notice?.[lang] || item.notice?.fr || "").trim();

  const sections = (property?.facilities?.sections ?? []).map((section) => ({
    ...section,
    icon: FACILITY_ICONS[section.icon ?? ""] ?? (section.kind === "video" ? Tv : Building2),
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
                  {section.items.map((item, i) => {
                    const key = `${section.id}-${i}`;
                    return (
                      <div key={key}>
                        <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                          {section.kind === "rules" && (
                            <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                          )}
                          {/* Base = largeur réelle du texte : le bouton reste sur la ligne tant que le texte tient à côté. */}
                          <div className="min-w-0 flex-[1_1_auto]">
                            <p className={`text-sm text-brand-ink dark:text-white ${section.kind === "rules" ? "font-medium" : "font-semibold"}`}>
                              {item.name[lang]}
                            </p>
                            {item.detail?.[lang] && (
                              <p className="text-sm text-brand-ink/60 dark:text-white/60 mt-0.5 whitespace-pre-line">
                                {item.detail[lang]}
                              </p>
                            )}
                          </div>
                          {/* Notice (texte et/ou vidéo envoyée depuis l'admin) : ouverte dans une fenêtre.
                              Sur la même ligne que le texte, renvoyée dessous quand la place manque. */}
                          {(item.videoFile || noticeOf(item)) && (
                            <button
                              type="button"
                              onClick={() => setOpenNotice(item)}
                              className="flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-brand-ink dark:text-white bg-brand-ink/10 dark:bg-white/10"
                            >
                              {item.videoFile ? <PlayCircle className="h-4 w-4" strokeWidth={1.75} /> : <FileText className="h-4 w-4" strokeWidth={1.75} />}
                              {t.facilities.noticeShow}
                            </button>
                          )}
                          {!item.videoFile && item.videoUrl && (
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
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>

      <Dialog open={!!openNotice} onOpenChange={(open) => !open && setOpenNotice(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border-0 bg-brand-surface text-brand-ink dark:bg-brand-ink dark:text-white">
          {openNotice && (
            <>
              <DialogTitle className="pr-6 text-lg font-semibold">{openNotice.name[lang] || openNotice.name.fr}</DialogTitle>
              {noticeOf(openNotice) ? (
                <DialogDescription asChild>
                  <div><DetailLines text={noticeOf(openNotice)} /></div>
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">{t.facilities.noticeShow}</DialogDescription>
              )}
              {openNotice.videoFile && (
                <video src={openNotice.videoFile} controls playsInline className="w-full max-h-[55vh] rounded-lg bg-black" />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

    </PageShell>
  );
}
