import { Link, useParams } from "react-router-dom";
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
  ChevronLeft,
  ExternalLink,
  AlertTriangle,
  X,
  Phone,
  CigaretteOff,
  PartyPopper,
  PawPrint,
  Volume2,
  UserPlus,
  Camera,
  UtensilsCrossed,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { ExternalLink as ExternalLinkConfirm } from "@/components/ExternalLink";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";
import joroLogo from "@/assets/joro-living-logo.png";

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

// House rules shown as a fixed list (same for every Living apartment); keys match `facilities.forbidden[].id`.
const FORBIDDEN_ICONS: Record<string, LucideIcon> = {
  smoking: CigaretteOff,
  parties: PartyPopper,
  pets: PawPrint,
  noise: Volume2,
  guests: UserPlus,
  photo: Camera,
  eating: UtensilsCrossed,
  download: Download,
};

export default function Facilities() {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { t, lang } = useLanguage();
  const { data: property } = useProperty();

  const sections = (property?.facilities?.sections ?? []).map((section) => ({
    ...section,
    icon: SECTION_ICONS[section.icon ?? ""] ?? (section.kind === "video" ? Tv : Building2),
  }));

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
              {t.facilities.title}
            </h1>
            <p className="text-base text-white/80">
              {t.facilities.subtitle}
            </p>
          </div>

          {/* Widgets */}
          <div className="px-[30px] space-y-4">
            {/* Sections accordion */}
            <Accordion type="multiple" className="space-y-3">
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
                    {section.kind === "video" ? (
                      <div className="pt-1 space-y-3">
                        {section.items.map((item) => (
                          <div key={item.name.fr} className="flex items-center gap-3">
                            <img
                              src={item.imageUrl ?? property?.backgroundUrl ?? DEFAULT_BACKGROUND_URL}
                              alt=""
                              className="w-[5rem] h-[4rem] rounded-[0.5rem] object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-brand-ink dark:text-white truncate">
                                {item.name[lang]}
                              </p>
                              <p className="text-sm text-brand-ink/70 dark:text-white/70 truncate">
                                {item.detail?.[lang] ?? t.facilities.noticeLabel}
                              </p>
                            </div>
                            {item.videoUrl && (
                              <ExternalLinkConfirm
                                href={item.videoUrl}
                                newTab
                                aria-label={t.facilities.videoLinkLabel}
                                className="text-brand-ink dark:text-white shrink-0"
                              >
                                <ExternalLink className="h-5 w-5" strokeWidth={1.75} />
                              </ExternalLinkConfirm>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-1">
                        {section.imageUrl && (
                          <img
                            src={section.imageUrl}
                            alt=""
                            className="w-full aspect-[16/7] rounded-lg object-cover mb-4"
                          />
                        )}
                        <div className="space-y-3">
                          {section.items.map((item) => (
                            <div key={item.name.fr} className="grid grid-cols-2 items-start gap-4">
                              <p className="text-sm font-medium text-brand-ink dark:text-white">
                                {item.name[lang]}
                              </p>
                              <div className="text-left">
                                {(item.detail?.[lang] ?? "").split("\n").map((line, i) => (
                                  <p
                                    key={i}
                                    className="text-sm text-brand-ink/70 dark:text-white/80 leading-snug"
                                  >
                                    {line}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Règlement intérieur (same for every Living apartment) */}
            <div className="rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white">
              <div className="flex flex-col items-center text-center gap-3">
                <AlertTriangle className="h-10 w-10 text-destructive" strokeWidth={2} />
                <h2 className="text-xl font-semibold text-brand-ink dark:text-white leading-tight">
                  {t.facilities.rulesTitle}
                </h2>
                <p className="text-sm text-brand-ink/70 dark:text-white/80">{t.facilities.rulesIntro}</p>
              </div>
              <div className="mt-5 space-y-3">
                {t.facilities.sanctions.map((sanction) => (
                  <div
                    key={sanction}
                    className="flex items-start gap-3 pt-3 border-t border-brand-ink/15 dark:border-white/15"
                  >
                    <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-sm font-medium text-brand-ink dark:text-white">{sanction}</p>
                  </div>
                ))}
                <div className="flex items-start gap-3 pt-3 border-t border-brand-ink/15 dark:border-white/15">
                  <Phone className="h-5 w-5 text-brand-ink dark:text-white shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-sm font-medium text-brand-ink dark:text-white">{t.facilities.incidentNotice}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {t.facilities.forbidden.map((item) => {
                const Icon = FORBIDDEN_ICONS[item.id] ?? X;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80"
                  >
                    <Icon className="h-5 w-5 text-destructive shrink-0" strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-brand-ink dark:text-white leading-tight">{item.title}</p>
                      <p className="text-sm text-brand-ink/70 dark:text-white/80 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
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
