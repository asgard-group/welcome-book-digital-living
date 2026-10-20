import { Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { ExternalLink } from "@/components/ExternalLink";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Translation } from "@/i18n/translations";

type TeamMember = {
  name: string;
  role: string;
  phoneHref: string;
  note?: { fr: string; en: string };
};

const TEAM: TeamMember[] = [
  { name: "Chris", role: "Housekeeper Manager", phoneHref: "+33659196366" },
  {
    name: "Mathilde",
    role: "Reservation Manager",
    phoneHref: "+33630001014",
    note: { fr: "Congé maternité", en: "Maternity leave" },
  },
  { name: "Bérénice", role: "Brand Manager", phoneHref: "+33637754570" },
];

const GENERAL_EMAIL = "reservation@joro-space.fr";

const actionClass =
  "flex items-center justify-center gap-2 rounded-[8px] py-3 text-sm font-medium text-brand-ink dark:text-white bg-white/70 dark:bg-white/10";

function ContactCard({ member, t, lang }: { member: TeamMember; t: Translation; lang: "fr" | "en" }) {
  return (
    <div className="rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white">
      <p className="font-semibold text-brand-ink dark:text-white text-base">{member.name}</p>
      <p className="text-sm text-brand-ink/70 dark:text-white/70">{member.role}</p>
      {member.note && (
        <p className="text-sm italic text-brand-ink/70 dark:text-white/70 mt-1">{member.note[lang]}</p>
      )}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <ExternalLink href={`tel:${member.phoneHref}`} className={actionClass}>
          <Phone className="h-5 w-5" strokeWidth={1.75} />
          {t.contact.callLabel}
        </ExternalLink>
        <ExternalLink href={`https://wa.me/${member.phoneHref.replace("+", "")}`} newTab className={actionClass}>
          <WhatsAppIcon className="h-5 w-5" />
          {t.contact.whatsappLabel}
        </ExternalLink>
      </div>
    </div>
  );
}

export function ContactWidget() {
  const { t, lang } = useLanguage();

  return (
    <div className="space-y-3">
      {TEAM.map((member) => (
        <ContactCard key={member.name} member={member} t={t} lang={lang} />
      ))}

      <div className="rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white">
        <ExternalLink href={`mailto:${GENERAL_EMAIL}`} className={actionClass}>
          <Mail className="h-5 w-5" strokeWidth={1.75} />
          {GENERAL_EMAIL}
        </ExternalLink>
      </div>
    </div>
  );
}
