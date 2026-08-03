import { LogIn, DoorOpen, AlertCircle, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-living-room.png";
import joroLogo from "@/assets/joro-living-logo.png";
import { SettingsPopover } from "@/components/SettingsPopover";

function Widget({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 text-[#1c2626] dark:text-white">
      {children}
    </div>
  );
}

export default function Checkout() {
  return (
    <div className="min-h-screen w-full bg-muted/30">
      <div className="mx-auto w-full max-w-[760px] min-h-screen relative overflow-hidden shadow-sm">
        {/* Background image (fixed full-viewport wrapper to avoid jumps on mobile scroll) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="relative mx-auto h-full w-full max-w-[760px]">
            <img
              src={heroImg}
              alt="Haussmann Mogador"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen pb-6">
          {/* Back arrow */}
          <div className="px-4 pt-4 flex items-center justify-between shrink-0">
            <Link to="/" aria-label="Back" className="h-11 w-11 flex items-center justify-center">
              <ChevronLeft className="h-6 w-6 text-white" />
            </Link>
            <SettingsPopover variant="light" />
          </div>

          {/* Title */}
          <div className="text-center px-4 mt-1 mb-5 shrink-0">
            <h1 className="text-[32px] leading-tight font-serif font-semibold text-white uppercase">
              Check-in/out
            </h1>
            <p className="text-base text-white/80 mt-1">Avant d'arriver et de partir</p>
          </div>

          {/* Widgets */}
          <div className="px-[30px] space-y-4">
            <Widget>
              <div className="flex items-center gap-3 mb-3">
                <LogIn className="h-5 w-5 text-[#1c2626] dark:text-white" strokeWidth={2} />
                <h2 className="font-semibold text-[#1c2626] dark:text-white">Arrivée à partir de 15h</h2>
              </div>
              <p className="text-sm text-[#1c2626]/70 dark:text-white/80 leading-relaxed">
                Accueil assuré par un responsable du lundi au vendredi, de 9h à 19h. Arrivée autonome après 19h en semaine et le week-end.
              </p>
            </Widget>

            <Widget>
              <div className="flex items-center gap-3 mb-3">
                <DoorOpen className="h-5 w-5 text-[#1c2626] dark:text-white" strokeWidth={2} />
                <h2 className="font-semibold text-[#1c2626] dark:text-white">Départ avant 11h</h2>
              </div>
              <p className="text-sm text-[#1c2626]/70 dark:text-white/80 leading-relaxed mb-2">
                Avant de partir, n'oubliez pas de :
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-[#1c2626]/70 dark:text-white/80">
                <li>Trier et jeter tous vos déchets</li>
                <li>Fermer toutes les portes et fenêtres</li>
                <li>Laisser le badge de la porte dans l'appartement ou dans la boîte à clés</li>
              </ul>
            </Widget>

            <Widget>
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-[#1c2626] dark:text-white" strokeWidth={2} />
                <h2 className="font-semibold text-[#1c2626] dark:text-white">Information</h2>
              </div>
              <p className="text-sm text-[#1c2626]/70 dark:text-white/80 leading-relaxed">
                L'interphone se trouve dans le hall d'entrée. Appuyez sur la touche d'ouverture pour ouvrir la porte.
              </p>
            </Widget>
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
