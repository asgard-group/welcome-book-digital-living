import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

type TeamMember = {
  name: string;
  role: string;
  phoneDisplay: string;
  phoneHref: string;
  note?: string;
};

const TEAM: TeamMember[] = [
  { name: "Chris", role: "Housekeeper Manager", phoneDisplay: "06 59 19 63 66", phoneHref: "+33659196366" },
  {
    name: "Mathilde",
    role: "Reservation Manager",
    phoneDisplay: "06 30 00 10 14",
    phoneHref: "+33630001014",
    note: "congé maternité",
  },
  { name: "Bérénice", role: "Brand Manager", phoneDisplay: "06 37 75 45 70", phoneHref: "+33637754570" },
];

export function ContactWidget() {
  return (
    <div className="rounded-xl p-5 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 text-[#1c2626] dark:text-white">
      {/* Header */}
      <div className="flex flex-col items-center text-center pt-2 pb-4">
        <Phone className="h-10 w-10 text-foreground" strokeWidth={2} />
        <h2 className="text-xl font-semibold text-[#1c2626] dark:text-white leading-tight mt-3">
          Contact Jöro
        </h2>
        <p className="text-[13px] text-[#1c2626]/70 dark:text-white/80 mt-1 max-w-[280px]">
          Voici quelques numéros utiles pour votre séjour
        </p>
      </div>

      <div className="border-t border-[#1c2626]/15 dark:border-white/15" />

      {/* Team */}
      <div className="divide-y divide-[#1c2626]/15 dark:divide-white/15">
        {TEAM.map((member) => (
          <div key={member.name} className="flex items-center justify-between gap-3 py-4">
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="font-semibold text-[#1c2626] dark:text-white text-sm">{member.name}</p>
              <p className="text-xs uppercase text-[#1c2626]/70 dark:text-white/80">{member.role}</p>
              {member.note && (
                <p className="text-xs italic text-[#1c2626]/70 dark:text-white/80">{member.note}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={`tel:${member.phoneHref}`}
                className="text-sm font-medium text-[#1c2626] dark:text-white underline underline-offset-2 whitespace-nowrap"
              >
                {member.phoneDisplay}
              </a>
              <a
                href={`https://wa.me/${member.phoneHref.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <WhatsAppIcon className="h-[27px] w-[27px] text-[#128C7E]" />
              </a>
            </div>
          </div>
        ))}

        {/* Email */}
        <div className="flex items-center justify-center gap-[5px] pt-4">
          <span className="text-sm font-medium text-[#5C6363] dark:text-white/60">Email</span>
          <a
            href="mailto:reservation@joro-space.fr"
            className="text-sm font-medium text-[#1c2626] dark:text-white underline underline-offset-2"
          >
            reservation@joro-space.fr
          </a>
        </div>
      </div>
    </div>
  );
}
