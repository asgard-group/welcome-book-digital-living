import { useState } from "react";
import { cn } from "@/lib/utils";
import { SERVICE_ICONS } from "@/lib/serviceIcons";
import {
  Check,
  Plus,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useProperty } from "@/property/useProperty";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import { ExternalLink } from "@/components/ExternalLink";

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
    <PageShell
      title={pageText(property, "services", "title", lang, t.services.title)}
      subtitle={pageText(property, "services", "subtitle", lang, t.services.subtitle)}
    >

      {/* Widgets */}
      <div className="px-[30px] space-y-4 lg:px-10">
        <div className="flex rounded-full p-[0.1rem] lg:max-w-md backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80">
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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

    </PageShell>
  );
}
