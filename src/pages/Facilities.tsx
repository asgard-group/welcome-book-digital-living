import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tv,
  BedDouble,
  Bath,
  CookingPot,
  ChevronLeft,
  AlertTriangle,
  X,
  Phone,
  CigaretteOff,
  PartyPopper,
  PawPrint,
  Volume2,
  UserPlus,
  Camera,
  UtensilsCrossed,
  Download,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useLanguage } from "@/i18n/LanguageContext";
import heroImg from "@/assets/hero-living-room.png.asset.json";
import joroLogo from "@/assets/joro-living-logo.png.asset.json";

function Widget({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 text-[#1c2626] dark:text-white">
      {children}
    </div>
  );
}

export default function Facilities() {
  const { t } = useLanguage();

  const rooms = [
    {
      id: "living",
      icon: Tv,
      title: t.facilities.living,
      items: [
        { name: t.facilities.tv, detail: t.facilities.tvDesc },
        { name: t.facilities.clickshare, detail: t.facilities.clickshareDesc },
        { name: t.facilities.sonos, detail: t.facilities.sonosDesc },
        { name: t.facilities.printer, detail: t.facilities.printerDesc },
        { name: t.facilities.scanner, detail: t.facilities.scannerDesc },
        { name: t.facilities.ipad, detail: t.facilities.ipadDesc },
        { name: t.facilities.heating, detail: t.facilities.heatingDesc },
      ],
    },
    {
      id: "bedroom",
      icon: BedDouble,
      title: t.facilities.bedroom,
      items: [
        { name: t.facilities.safe, detail: t.facilities.safeDesc },
        { name: t.facilities.steamer, detail: t.facilities.steamerDesc },
      ],
    },
    {
      id: "bathroom",
      icon: Bath,
      title: t.facilities.bathroom,
      items: [
        { name: t.facilities.heater, detail: t.facilities.heaterDesc },
        { name: t.facilities.toiletries, detail: t.facilities.toiletriesDesc },
        { name: t.facilities.hairdryer, detail: t.facilities.hairdryerDesc },
        { name: t.facilities.straightener, detail: t.facilities.straightenerDesc },
      ],
    },
    {
      id: "kitchen",
      icon: CookingPot,
      title: t.facilities.kitchen,
      items: [
        { name: t.facilities.oven, detail: t.facilities.ovenDesc },
        { name: t.facilities.nespresso, detail: t.facilities.nespressoDesc },
        { name: t.facilities.toaster, detail: t.facilities.toasterDesc },
        { name: t.facilities.kettle, detail: t.facilities.kettleDesc },
        { name: t.facilities.kitchenware, detail: t.facilities.kitchenwareDesc },
      ],
    },
  ];

  const sanctions = [
    t.facilities.sanction1,
    t.facilities.sanction2,
    t.facilities.sanction3,
  ];

  const forbidden = [
    { icon: CigaretteOff, title: t.rules.noSmoking, desc: t.facilities.noSmokingDesc },
    { icon: PartyPopper, title: t.rules.noParties, desc: t.facilities.noPartiesDesc },
    { icon: PawPrint, title: t.rules.noPets, desc: t.facilities.noPetsDesc },
    { icon: Volume2, title: t.rules.noNoise, desc: t.facilities.noNoiseDesc },
    { icon: UserPlus, title: t.rules.noGuests, desc: t.facilities.noGuestsDesc },
    { icon: Camera, title: t.facilities.noPhoto, desc: t.facilities.noPhotoDesc },
    { icon: UtensilsCrossed, title: t.facilities.noEating, desc: t.facilities.noEatingDesc },
    { icon: Download, title: t.facilities.noDownload, desc: t.facilities.noDownloadDesc },
  ];

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
            <Link to="/" aria-label="Back" className="h-8 w-8 flex items-center justify-center -ml-1">
              <ChevronLeft className="h-6 w-6 text-white" />
            </Link>
          </div>

          {/* Title */}
          <div className="text-center px-4 mt-1 mb-5 shrink-0">
            <h1 className="text-[32px] leading-tight font-serif font-semibold text-white uppercase">
              {t.facilities.title}
            </h1>
            <p className="text-base text-white/80 mt-1">
              {t.facilities.subtitle}
            </p>
          </div>

          {/* Widgets */}
          <div className="px-[30px] space-y-4">
            {/* Rooms accordion */}
            <Accordion
              type="multiple"
              defaultValue={["bedroom"]}
              className="space-y-3"
            >
              {rooms.map((room) => (
                <AccordionItem
                  key={room.id}
                  value={room.id}
                  className="rounded-xl px-4 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 border border-[#1c2626]/20 dark:border-transparent"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <room.icon
                        className="h-5 w-5 text-[#1c2626] dark:text-white"
                        strokeWidth={2}
                      />
                      <span className="font-semibold text-[#1c2626] dark:text-white">
                        {room.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 pt-1">
                      {room.items.map((item) => (
                        <div key={item.name} className="pl-8">
                          <p className="text-sm font-medium text-[#1c2626] dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-sm text-[#1c2626]/70 dark:text-white/80">
                            {item.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Règlement intérieur */}
            <Widget>
              <div className="flex flex-col items-center text-center gap-3">
                <AlertTriangle
                  className="h-10 w-10 text-destructive"
                  strokeWidth={2}
                />
                <h2 className="text-xl font-semibold text-[#1c2626] dark:text-white leading-tight">
                  {t.facilities.internalRules}
                </h2>
                <p className="text-sm text-[#1c2626]/70 dark:text-white/80">
                  {t.facilities.internalRulesIntro}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {sanctions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pt-3 border-t border-[#1c2626]/15 dark:border-white/15"
                  >
                    <X
                      className="h-5 w-5 text-destructive shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    <p className="text-sm font-medium text-[#1c2626] dark:text-white">{s}</p>
                  </div>
                ))}
                <div className="flex items-start gap-3 pt-3 border-t border-[#1c2626]/15 dark:border-white/15">
                  <Phone
                    className="h-5 w-5 text-[#1c2626] dark:text-white shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <p className="text-sm font-medium text-[#1c2626] dark:text-white">
                    {t.facilities.incidentNotice}
                  </p>
                </div>
              </div>
            </Widget>

            {/* Forbidden list */}
            <div className="space-y-2">
              {forbidden.map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 border border-destructive/20"
                >
                  <f.icon
                    className="h-5 w-5 text-destructive shrink-0"
                    strokeWidth={2}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#1c2626] dark:text-white leading-tight">
                      {f.title}
                    </p>
                    <p className="text-sm text-[#1c2626]/70 dark:text-white/80 mt-0.5">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Jöro */}
            <Widget>
              <div className="flex items-start gap-3">
                <Phone
                  className="h-5 w-5 text-[#1c2626] dark:text-white shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1c2626] dark:text-white">
                    {t.contact.title}
                  </p>
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
