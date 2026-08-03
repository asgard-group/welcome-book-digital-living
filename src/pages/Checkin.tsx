import { Wifi, MapPin, ChevronLeft, Copy, Info } from "lucide-react";
import { ContactWidget } from "@/components/ContactWidget";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import heroImg from "@/assets/hero-living-room.png";
import joroLogo from "@/assets/joro-living-logo.png";
import { useProperty } from "@/property/useProperty";
import { SettingsPopover } from "@/components/SettingsPopover";

function Widget({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 text-[#1c2626] dark:text-white">
      {children}
    </div>
  );
}


function CopyField({ value }: { value: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copié");
    } catch {
      toast.error("Impossible de copier");
    }
  };
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-white/80 dark:bg-[#323E3E]/60 border border-[#1c2626]/20 dark:border-transparent">
      <span className="text-sm text-[#1c2626] dark:text-white">{value}</span>
      <button
        onClick={handleCopy}
        aria-label="Copier"
        className="text-[#1c2626]/60 hover:text-[#1c2626] dark:text-white/70 dark:hover:text-white transition-colors"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}

function FieldSkeleton() {
  return <div className="h-[42px] rounded-xl bg-[#1c2626]/10 dark:bg-white/10 animate-pulse" />;
}

function Step({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1c2626]/10 dark:bg-white/15 text-[#1c2626] dark:text-white flex items-center justify-center text-xs font-semibold">
        {step}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-[#1c2626] dark:text-white text-sm">{title}</p>
        <p className="text-[#1c2626]/70 dark:text-white/80 text-sm mt-0.5">{children}</p>
      </div>
    </div>
  );
}

export default function Checkin() {
  const { data: property } = useProperty();

  return (
    <div className="min-h-screen w-full bg-muted/30">
      <div className="mx-auto w-full max-w-[760px] min-h-screen relative overflow-hidden shadow-sm">
        {/* Background image (fixed full-viewport wrapper to avoid jumps on mobile scroll) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="relative mx-auto h-full w-full max-w-[760px]">
            <img
              src={heroImg}
              alt={property?.name ?? ""}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen pb-6">
          {/* Back arrow */}
          <div className="px-4 pt-4 flex items-center justify-between shrink-0">
            <Link to="/home" aria-label="Retour" className="h-11 w-11 flex items-center justify-center">
              <ChevronLeft className="h-6 w-6 text-white" />
            </Link>
            <SettingsPopover variant="light" />
          </div>

          {/* Title */}
          <div className="text-center px-4 mt-1 mb-5 shrink-0">
            <h1 className="text-[32px] leading-tight font-serif font-semibold text-white uppercase">
              Infos pratique
            </h1>
            <p className="text-base text-white/80 mt-1">Wifi, Accès logement</p>
          </div>

          {/* Widgets */}
          <div className="px-[30px] space-y-4">
            {/* Wifi */}
            <Widget>
              <div className="flex items-center gap-3 mb-4">
                <Wifi className="h-5 w-5 text-foreground" strokeWidth={2} />
                <h2 className="font-semibold text-foreground">Wifi</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-[#1c2626]/70 dark:text-white/70 mb-1.5">Network</p>
                  {property ? <CopyField value={property.wifi.network} /> : <FieldSkeleton />}
                </div>
                <div>
                  <p className="text-xs font-medium text-[#1c2626]/70 dark:text-white/70 mb-1.5">Mot de passe</p>
                  {property ? <CopyField value={property.wifi.password} /> : <FieldSkeleton />}
                </div>
              </div>
            </Widget>

            {/* Address */}
            <Widget>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-foreground" strokeWidth={2} />
                <div>
                  <p className="font-semibold text-foreground">43 boulevard Haussmann</p>
                  <p className="text-xs text-[#1c2626]/70 dark:text-white/70">75009 Paris, France</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-[#1c2626]/20 dark:border-white/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2!2d2.3326!3d48.8726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e3e4e5b5c5d%3A0x0!2s43+Boulevard+Haussmann%2C+75009+Paris!5e0!3m2!1sfr!2sfr!4v1"
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Apartment location"
                />
              </div>
            </Widget>

            {/* Access steps */}
            <Widget>
              <div className="space-y-4">
                <Step step={1} title="Entrée de l'immeuble">
                  Code de la porte : <strong className="font-mono">{property?.entryCodes.buildingDoor ?? "—"}</strong>
                </Step>
                <div className="border-t border-[#1c2626]/15 dark:border-white/15" />
                <Step step={2} title="Accès au hall">
                  code <strong className="font-mono">{property?.entryCodes.hallCode ?? "—"}</strong>, puis « OK » sur l'interphone
                </Step>
                <div className="border-t border-[#1c2626]/15 dark:border-white/15" />
                <Step step={3} title="3e étage, porte grise">
                  Clés sur la table : badge immeuble (entrée principale) et clé du local poubelles (RDC, face à l'ascenseur).
                </Step>
              </div>
            </Widget>

            {/* Informations complémentaires */}
            <Widget>
              <div className="flex flex-col items-center text-center pt-2 pb-4">
                <Info className="h-10 w-10 text-foreground" strokeWidth={2} />
                <h2 className="text-xl font-semibold text-[#1c2626] dark:text-white leading-tight mt-3">
                  Infos complémentaires
                </h2>
                <p className="text-[13px] text-[#1c2626]/70 dark:text-white/80 mt-1 max-w-[280px]">
                  Retrouver quelques indications utiles pour profiter pleinement de votre séjour
                </p>
              </div>
              <div className="border-t border-[#1c2626]/15 dark:border-white/15" />
              <div className="divide-y divide-[#1c2626]/15 dark:divide-white/15">
                <div className="py-4">
                  <Step step={1} title="Gestion des lumières">
                    L'interrupteur principal se trouve juste à côté de la porte d'entrée.
                  </Step>
                </div>
                <div className="py-4">
                  <Step step={2} title="Commande climatisation">
                    La commande de climatisation se trouve dans le placard à côté de la porte d'entrée
                  </Step>
                </div>
                <div className="pt-4">
                  <Step step={3} title="Ouverture porte principale">
                    Pour ouvrir la porte depuis l'intérieur, veuillez pousser la barre blanche à deux reprises en utilisant vos mains : une sur le bord gauche et l'autre sur le bord droit.
                  </Step>
                </div>
              </div>
            </Widget>

            {/* Contact Jöro */}
            <ContactWidget />
          </div>

          {/* Footer logo */}
          <div className="flex justify-center pt-8 pb-2">
            <img
              src={joroLogo}
              alt="Jöro Living"
              className="w-[160px] h-auto object-contain brightness-0 invert"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
