import { Mail, Phone } from "lucide-react";
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

import { useProperty } from "@/property/useProperty";
import {
  DEFAULT_EMERGENCY_CONTACTS,
  DEFAULT_EMERGENCY_EMAIL,
  type EmergencyContact,
} from "@/property/emergency";

const actionClass =
  "flex items-center justify-center gap-2 rounded-[8px] py-3 text-sm font-medium text-brand-ink dark:text-white bg-white/70 dark:bg-white/10";

function ContactCard({ member, t }: { member: EmergencyContact; t: Translation }) {
  const phone = member.phone.replace(/[^\d+]/g, "");
  return (
    <div className="rounded-xl p-4 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white">
      <p className="font-semibold text-brand-ink dark:text-white text-base">{member.name}</p>
      {member.role && <p className="text-sm text-brand-ink/70 dark:text-white/70">{member.role}</p>}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <ExternalLink href={`tel:${phone}`} className={actionClass}>
          <Phone className="h-5 w-5" strokeWidth={1.75} />
          {t.contact.callLabel}
        </ExternalLink>
        <ExternalLink href={`https://wa.me/${phone.replace("+", "")}`} newTab className={actionClass}>
          <WhatsAppIcon className="h-5 w-5" />
          {t.contact.whatsappLabel}
        </ExternalLink>
      </div>
    </div>
  );
}

/** Contacts de la page Urgences : le premier est mis en avant, les autres (et l'email) sont repliés. */
export function ContactWidget() {
  const { t } = useLanguage();
  const { data: property } = useProperty();
  const custom = (property?.emergency?.contacts ?? []).filter((c) => c.name?.trim() && c.phone?.trim());
  const [primary, ...others] = custom.length ? custom : DEFAULT_EMERGENCY_CONTACTS;
  // Email : absent = adresse par défaut, vidé dans l'admin = pas d'email.
  const email = (property?.emergency?.email ?? DEFAULT_EMERGENCY_EMAIL).trim();

  return (
    <div className="space-y-3">
      <ContactCard member={primary} t={t} />

      {(others.length > 0 || email) && (
        <Accordion type="single" collapsible>
          <AccordionItem value="other-contacts">
            <AccordionTrigger className="justify-start gap-2 hover:no-underline py-4 text-white lg:text-brand-ink dark:lg:text-white">
              <span className="font-semibold">{t.contact.otherContacts}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pt-1">
                {others.map((member, i) => (
                  <ContactCard key={i} member={member} t={t} />
                ))}

                {email && (
                  <ExternalLink
                    href={`mailto:${email}`}
                    className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-brand-ink dark:text-white backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80"
                  >
                    <Mail className="h-5 w-5" strokeWidth={1.75} />
                    {email}
                  </ExternalLink>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
