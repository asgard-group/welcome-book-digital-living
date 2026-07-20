import { CigaretteOff, PartyPopper, PawPrint, VolumeX, UserX, Phone, Mail } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Rules() {
  const { t } = useLanguage();
  const rules = [
    { icon: CigaretteOff, title: t.rules.noSmoking, desc: t.rules.noSmokingDesc },
    { icon: PartyPopper, title: t.rules.noParties, desc: t.rules.noPartiesDesc },
    { icon: PawPrint, title: t.rules.noPets, desc: t.rules.noPetsDesc },
    { icon: VolumeX, title: t.rules.noNoise, desc: t.rules.noNoiseDesc },
    { icon: UserX, title: t.rules.noGuests, desc: t.rules.noGuestsDesc },
  ];

  return (
    <AppLayout title={t.welcome.menu.rules}>
      <div className="page-container space-y-6">
        <div>
          <p className="page-subtitle">{t.rules.subtitle}</p>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.title} className="rule-card">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <rule.icon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{rule.title}</p>
                <p className="text-muted-foreground text-sm mt-0.5">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="info-card bg-destructive/5 border-destructive/20">
          <h2 className="font-semibold text-foreground mb-2">{t.rules.emergency}</h2>
          <p className="text-sm text-muted-foreground mb-3">{t.rules.emergencyDesc}</p>
          <div className="space-y-2 text-sm">
            <a href="mailto:reservation@joro-space.fr" className="flex items-center gap-2 text-accent hover:underline">
              <Mail className="h-4 w-4" /> reservation@joro-space.fr
            </a>
            <a href="tel:+33637754570" className="flex items-center gap-2 text-accent hover:underline">
              <Phone className="h-4 w-4" /> +33 6 37 75 45 70
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
