import { Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { ExternalLink } from "@/components/ExternalLink";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Translation } from "@/i18n/translations";

type TeamMember = {
  name: string;
  role: "roleMultisite" | "roleOfficeManager";
  desc?: "descAudrey";
  email?: string;
  phoneHref?: string;
};

const PRIMARY_CONTACT: TeamMember = {
  name: "Audrey",
  role: "roleOfficeManager",
  desc: "descAudrey",
  email: "audrey.robin@joro-space.fr",
  phoneHref: "+33659668978",
};

const OTHER_CONTACTS: TeamMember[] = [
  { name: "Pauline", role: "roleMultisite", email: "pauline.roureau@joro-space.fr", phoneHref: "+33659195073" },
  { name: "Manuel", role: "roleMultisite", email: "manuel.colores@joro-space.fr", phoneHref: "+33764012129" },
];

function ContactCard({ member, t }: { member: TeamMember; t: Translation }) {
  return (
    <div className="rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white">
      <p className="font-semibold text-brand-ink dark:text-white text-base">{member.name}</p>
      <p className="text-sm text-brand-ink/70 dark:text-white/70">{t.contact[member.role]}</p>
      {member.desc && (
        <p className="text-sm text-brand-ink/70 dark:text-white/70 mt-2">{t.contact[member.desc]}</p>
      )}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {member.email ? (
          <ExternalLink
            href={`mailto:${member.email}`}
            className="flex items-center justify-center gap-2 rounded-[8px] py-3 text-sm font-medium text-brand-ink dark:text-white bg-white/70 dark:bg-white/10"
          >
            <Mail className="h-5 w-5" strokeWidth={1.75} />
            {t.contact.emailLabel}
          </ExternalLink>
        ) : (
          <span className="flex items-center justify-center gap-2 rounded-[8px] py-3 text-sm font-medium text-brand-ink/40 dark:text-white/40 bg-white/70 dark:bg-white/10">
            <Mail className="h-5 w-5" strokeWidth={1.75} />
            {t.contact.emailLabel}
          </span>
        )}
        {member.phoneHref ? (
          <ExternalLink
            href={`https://wa.me/${member.phoneHref.replace("+", "")}`}
            newTab
            className="flex items-center justify-center gap-2 rounded-[8px] py-3 text-sm font-medium text-brand-ink dark:text-white bg-white/70 dark:bg-white/10"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t.contact.whatsappLabel}
          </ExternalLink>
        ) : (
          <span className="flex items-center justify-center gap-2 rounded-[8px] py-3 text-sm font-medium text-brand-ink/40 dark:text-white/40 bg-white/70 dark:bg-white/10">
            <WhatsAppIcon className="h-5 w-5" />
            {t.contact.whatsappLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function ContactWidget() {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <ContactCard member={PRIMARY_CONTACT} t={t} />

      <Accordion type="single" collapsible>
        <AccordionItem value="other-contacts">
          <AccordionTrigger className="hover:no-underline py-4 text-white">
            <span className="font-semibold text-white">{t.contact.otherContacts}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 pt-1">
              {OTHER_CONTACTS.map((member) => (
                <ContactCard key={member.name} member={member} t={t} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
