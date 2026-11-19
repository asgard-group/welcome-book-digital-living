import { useState } from "react";
import { cn } from "@/lib/utils";
import { SERVICE_ICONS } from "@/lib/serviceIcons";
import { ArrowRight, Check, Mail, Plus, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { servicesContact } from "@/property/emergency";
import type { PropertyData } from "@/property/types";
import meetingImg from "@/assets/meeting.jpg";
import kaffeImg from "@/assets/kaffe.jpg";
import type { LucideIcon } from "lucide-react";
import { useProperty } from "@/property/useProperty";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import { ExternalLink } from "@/components/ExternalLink";

/** Même ordre que `services.joroSpaceItems` dans les fichiers de traduction. */
const JORO_SPACE_IMAGES = [meetingImg, kaffeImg];

function ServiceCard({
  icon: Icon,
  title,
  description,
  indicator,
  href,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  indicator: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <Icon className="h-6 w-6 text-brand-ink dark:text-white" strokeWidth={1.75} />
        {indicator && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-ink/10 dark:bg-white/10 shrink-0">
            {indicator}
          </span>
        )}
      </div>
      <p className="mt-4 text-[15px] font-semibold text-brand-ink dark:text-white leading-snug">
        {title}
      </p>
      {description && (
        <p className="mt-1.5 text-[13px] leading-snug text-brand-ink/70 dark:text-white/70 whitespace-pre-line">{description}</p>
      )}
    </>
  );
  const className = "rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} text-left`}>
        {content}
      </button>
    );
  }
  if (href) {
    return (
      <ExternalLink href={href} className={className}>
        {content}
      </ExternalLink>
    );
  }
  return <div className={className}>{content}</div>;
}

type QuoteService = NonNullable<PropertyData["services"]>["quote"][number];

const contactButton =
  "flex items-center justify-center gap-2 rounded-[8px] px-4 py-3 text-sm font-medium text-brand-ink dark:text-white bg-brand-ink/10 dark:bg-white/10";

export default function Services() {
  const { t, lang } = useLanguage();
  const { data: property } = useProperty();
  const [active, setActive] = useState<string>("inclus");
  // Service « En plus » dont la fenêtre de contact est ouverte (null = fermée).
  const [request, setRequest] = useState<QuoteService | null>(null);
  const contact = servicesContact(property);
  const whatsappHref = (service: QuoteService) => {
    const message = t.services.requestMessage
      .replace("{service}", service.name[lang] || service.name.fr)
      .replace("{home}", property?.name ?? "");
    return `https://wa.me/${contact.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
  };

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
                onClick={() => setRequest(item)}
                indicator={<Plus className="h-4 w-4 text-brand-ink dark:text-white" strokeWidth={2.5} />}
              />
            ))}
          </div>
        )}

        {/* Jöro Space — uniquement sous l'onglet « En plus » */}
        {active === "devis" && (
          <div className="rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white">
            <h2 className="text-xl font-semibold text-brand-ink dark:text-white leading-tight text-left">
              {t.services.joroSpaceTitle}
            </h2>
            <p className="text-[13px] text-brand-ink/70 dark:text-white/80 mb-4">{t.services.joroSpaceSubtitle}</p>
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              {t.services.joroSpaceItems.map((item, i) => (
                <ExternalLink
                  key={item.name}
                  href={item.link}
                  newTab
                  className="relative block aspect-[16/6] rounded-[0.5rem] overflow-hidden"
                >
                  <img src={JORO_SPACE_IMAGES[i]} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-[0.8rem]">
                    <div className="min-w-0">
                      <p className="font-semibold text-white leading-tight">{item.name}</p>
                      <p className="text-sm text-white/80 mt-0.5">{item.role}</p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm shrink-0">
                      <ArrowRight className="h-4 w-4 text-white" strokeWidth={2} />
                    </span>
                  </div>
                </ExternalLink>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fenêtre de contact d'un service « En plus » : WhatsApp du contact principal, et email s'il est renseigné. */}
      <Dialog open={!!request} onOpenChange={(open) => !open && setRequest(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl border-0 bg-brand-surface text-brand-ink dark:bg-brand-ink dark:text-white">
          {request && (
            <>
              <DialogTitle className="pr-6 text-lg font-semibold">{request.name[lang] || request.name.fr}</DialogTitle>
              <DialogDescription className="text-sm text-brand-ink/70 dark:text-white/70 whitespace-pre-line">
                {[request.description?.[lang] || request.description?.fr, t.services.requestIntro].filter(Boolean).join("\n\n")}
              </DialogDescription>
              <div className="space-y-2">
                <ExternalLink href={whatsappHref(request)} newTab className={contactButton}>
                  <WhatsAppIcon className="h-5 w-5" />
                  {t.contact.whatsappLabel} · {contact.name}
                </ExternalLink>
                {request.email?.trim() && (
                  <ExternalLink href={`mailto:${request.email.trim()}`} className={contactButton}>
                    <Mail className="h-5 w-5" strokeWidth={1.75} />
                    <span className="truncate">{request.email.trim()}</span>
                  </ExternalLink>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </PageShell>
  );
}
