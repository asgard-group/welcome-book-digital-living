import { Wifi, MapPin, Key, Phone, ChevronLeft, Copy } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import heroImg from "@/assets/hero-living-room.png.asset.json";
import joroLogo from "@/assets/joro-living-logo.png.asset.json";

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
  return (
    <div className="min-h-screen w-full bg-muted/30">
      <div className="mx-auto w-full max-w-[760px] min-h-screen relative overflow-hidden shadow-sm">
        {/* Background image (fixed full-viewport wrapper to avoid jumps on mobile scroll) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="relative mx-auto h-full w-full max-w-[760px]">
            <img
              src={heroImg.url}
              alt="Haussmann Mogador"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen pb-6">
          {/* Back arrow */}
          <div className="px-4 pt-4 flex items-center shrink-0">
            <Link to="/home" aria-label="Retour" className="h-8 w-8 flex items-center justify-center -ml-1">
              <ChevronLeft className="h-6 w-6 text-white" />
            </Link>
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
                  <CopyField value="MiCasa_WiFi_5G" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#1c2626]/70 dark:text-white/70 mb-1.5">Mot de passe</p>
                  <CopyField value="Bienvenue à la maison en 2024 !" />
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
                  Code de la porte : <strong className="font-mono">A 3187</strong>
                </Step>
                <div className="border-t border-[#1c2626]/15 dark:border-white/15" />
                <Step step={2} title="Monter au 3e étage">
                  Porte à droite en sortant de l'ascenseur
                </Step>
                <div className="border-t border-[#1c2626]/15 dark:border-white/15" />
                <Step step={3} title="Récupérer le badge">
                  Boîte à clés grise derrière la porte d'entrée → 3e boîte → code <strong className="font-mono">4303</strong>
                </Step>
              </div>
            </Widget>

            {/* Tapkey */}
            <Widget>
              <div className="flex flex-col items-center text-center pt-2 pb-4">
                <Key className="h-10 w-10 text-foreground" strokeWidth={2} />
                <h2 className="font-semibold text-foreground mt-3">
                  Configurer Tapkey
                </h2>
                <p className="text-[13px] text-[#1c2626]/70 dark:text-white/80 mt-1 max-w-[280px]">
                  Déverrouillez les portes via l'application Tapkey
                </p>
              </div>
              <div className="border-t border-[#1c2626]/15 dark:border-white/15" />
              <div className="divide-y divide-[#1c2626]/15 dark:divide-white/15">
                <div className="py-4">
                  <Step step={1} title="Télécharger Tapkey">Sur l'App Store ou Google Play</Step>
                </div>
                <div className="py-4">
                  <Step step={2} title="Créez un compte">Utilisé le même email que la réservation</Step>
                </div>
                <div className="py-4">
                  <Step step={3} title="Valider votre inscription">Vous recevrez un email de validation</Step>
                </div>
                <div className="pt-4">
                  <Step step={4} title="Activez le Bluetooth">
                    Approchez votre téléphone de la serrure pour déverrouiller
                  </Step>
                </div>
              </div>
            </Widget>

            {/* Contact Jöro */}
            <Widget>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-foreground" strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">Contacter Jöro</p>
                  <a
                    href="tel:+33637754570"
                    className="block text-sm text-[#1c2626]/70 dark:text-white/80 mt-0.5 hover:text-[#1c2626] dark:hover:text-white transition-colors"
                  >
                    +33 6 37 75 45 70
                  </a>
                  <a
                    href="mailto:reservation@joro-space.fr"
                    className="block text-sm text-[#1c2626]/70 dark:text-white/80 mt-0.5 hover:text-[#1c2626] dark:hover:text-white transition-colors"
                  >
                    reservation@joro-space.fr
                  </a>
                </div>
                <a
                  href="https://wa.me/33637754570"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 mt-0.5"
                >
                  <WhatsAppIcon className="h-[29px] w-[29px] text-[#1c2626] dark:text-white" />
                </a>
              </div>
            </Widget>
          </div>

          {/* Footer logo */}
          <div className="flex justify-center pt-8 pb-2">
            <img
              src={joroLogo.url}
              alt="Jöro Living"
              className="w-[160px] h-auto object-contain brightness-0 invert"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
