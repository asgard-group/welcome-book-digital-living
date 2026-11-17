import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SERVICE_ICONS } from "@/lib/serviceIcons";
import {
  ChevronLeft,
  ArrowRight,
  Check,
  Plus,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";
import joroLogo from "@/assets/joro-living-logo.png";
import kaffeImg from "@/assets/kaffe.jpg";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import { ExternalLink } from "@/components/ExternalLink";

const JORO_SPACE_IMAGES = [kaffeImg];

function ServiceCard({
  icon: Icon,
  title,
  description,
  indicator,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  indicator: React.ReactNode;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <Icon className="h-6 w-6 text-brand-ink dark:text-white" strokeWidth={1.75} />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-ink/10 dark:bg-white/10 shrink-0">
          {indicator}
        </span>
      </div>
      <p className="mt-4 text-[15px] font-semibold text-brand-ink dark:text-white leading-snug">
        {title}
      </p>
      {description && (
        <p className="mt-1.5 text-[13px] leading-snug text-brand-ink/70 dark:text-white/70">{description}</p>
      )}
    </>
  );
  const className = "rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80";

  if (href) {
    return (
      <ExternalLink href={href} className={className}>
        {content}
      </ExternalLink>
    );
  }
  return <div className={className}>{content}</div>;
}

export default function Services() {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { t, lang } = useLanguage();
  const { data: property } = useProperty();
  const [active, setActive] = useState<string>("inclus");

  const includedItems = property?.services?.included ?? [];
  const quoteItems = property?.services?.quote ?? [];

  const tabs = [
    { id: "inclus", label: t.services.tabIncluded, count: includedItems.length },
    { id: "devis", label: t.services.tabQuote, count: quoteItems.length },
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
              {pageText(property, "services", "title", lang, t.services.title)}
            </h1>
            <p className="text-base text-white/80">{pageText(property, "services", "subtitle", lang, t.services.subtitle)}</p>
          </div>

          {/* Widgets */}
          <div className="px-[30px] space-y-4">
            <div className="flex rounded-full p-[0.1rem] backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-colors",
                    active === tab.id
                      ? "bg-brand-ink text-white dark:bg-white dark:text-brand-ink"
                      : "text-brand-ink dark:text-white"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-medium",
                      active === tab.id
                        ? "bg-white/20 text-white dark:bg-brand-ink/10 dark:text-brand-ink"
                        : "bg-brand-ink/10 text-brand-ink dark:bg-white/10 dark:text-white"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {active === "inclus" && (
              <div className="grid grid-cols-2 gap-3">
                {includedItems.map((item) => (
                  <ServiceCard
                    key={item.name.fr}
                    icon={SERVICE_ICONS[item.icon] ?? Wrench}
                    title={item.name[lang]}
                    description={item.description?.[lang] || item.description?.fr}
                    indicator={<Check className="h-4 w-4 text-brand-ink dark:text-white" strokeWidth={2.5} />}
                  />
                ))}
              </div>
            )}

            {active === "devis" && (
              <div className="grid grid-cols-2 gap-3">
                {quoteItems.map((item) => (
                  <ServiceCard
                    key={item.name.fr}
                    icon={SERVICE_ICONS[item.icon] ?? Wrench}
                    title={item.name[lang]}
                    description={item.description?.[lang] || item.description?.fr}
                    href={`mailto:${item.email}`}
                    indicator={<Plus className="h-4 w-4 text-brand-ink dark:text-white" strokeWidth={2.5} />}
                  />
                ))}
              </div>
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
