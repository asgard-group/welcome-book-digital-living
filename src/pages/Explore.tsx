import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UtensilsCrossed,
  ShoppingBag,
  Landmark,
  Baby,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import heroImg from "@/assets/hero-living-room.png";
import joroLogo from "@/assets/joro-living-logo.png";
import { SettingsPopover } from "@/components/SettingsPopover";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

function Widget({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 text-[#1c2626] dark:text-white">
      {children}
    </div>
  );
}

const CUISINE_TYPES = [
  "International",
  "Café & brunch",
  "Sain & végé",
  "Méditerranéen",
  "Français",
  "Japonais",
  "Asiatique",
  "Italien",
];

function RestaurantCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl px-5 py-4 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 border border-[#1c2626]/20 dark:border-transparent">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <Skeleton className="h-4 w-10 ml-3 shrink-0" />
    </div>
  );
}

// Temps de trajet estimés à pied depuis le logement :
// Halévy Apartment — 43 boulevard Haussmann, 75009 Paris
const placesData: Record<string, { name: string; time: number; descEn?: string; descFr?: string; cuisine?: string[] }[]> = {
  restaurants: [
    { name: "Jöro Kaffé", time: 10, descEn: "Café/coworking (-10% code SWEET10)", descFr: "Café/coworking (-10% code SWEET10)", cuisine: ["Café & brunch"] },
    { name: "Galeries Lafayette Gourmet", time: 1, descEn: "Rooftop & gourmet food hall", descFr: "Rooftop & halle gourmande", cuisine: ["International"] },
    { name: "El&N", time: 8, descEn: "Instagrammable café & brunch", descFr: "Café & brunch instagrammable", cuisine: ["Café & brunch"] },
    { name: "Perruche", time: 2, descEn: "Rooftop Mediterranean", descFr: "Méditerranéen sur les toits", cuisine: ["Méditerranéen"] },
    { name: "Ao Izakaya", time: 12, descEn: "Japanese tapas", descFr: "Tapas japonaises", cuisine: ["Japonais"] },
    { name: "Braun Notes", time: 8, descEn: "Specialty coffee & food", descFr: "Café de spécialité & cuisine", cuisine: ["Café & brunch"] },
    { name: "Brasserie Lazare", time: 5, descEn: "Classic French brasserie", descFr: "Brasserie française classique", cuisine: ["Français"] },
    { name: "Coco", time: 5, descEn: "Asian fusion", descFr: "Fusion asiatique", cuisine: ["Asiatique"] },
    { name: "Pépé Ronchon", time: 10, descEn: "Traditional French comfort food", descFr: "Cuisine française traditionnelle", cuisine: ["Français"] },
    { name: "Poni", time: 12, descEn: "Italian pizzeria", descFr: "Pizzeria italienne", cuisine: ["Italien"] },
    { name: "Mieux", time: 10, descEn: "Modern French cuisine", descFr: "Cuisine française moderne", cuisine: ["Français"] },
    { name: "Blue Bao", time: 8, descEn: "Trendy Asian", descFr: "Asiatique tendance", cuisine: ["Asiatique"] },
    { name: "Café de la Paix", time: 4, descEn: "Historic grand café", descFr: "Grand café historique", cuisine: ["Café & brunch"] },
    { name: "Rue Sainte Anne", time: 12, descEn: "Japanese food street", descFr: "Rue japonaise", cuisine: ["Japonais"] },
    { name: "Balagan", time: 12, descEn: "Israeli cuisine", descFr: "Cuisine israélienne", cuisine: ["Méditerranéen"] },
    { name: "Hanoï Cà Phé Opéra", time: 5, descEn: "Vietnamese", descFr: "Vietnamien", cuisine: ["Asiatique"] },
    { name: "Pink Mamma", time: 18, descEn: "Iconic Italian", descFr: "Italien iconique", cuisine: ["Italien"] },
    { name: "Papi Restaurant", time: 15, descEn: "Italian comfort food", descFr: "Cuisine italienne réconfortante", cuisine: ["Italien"] },
    { name: "Zébulon", time: 15, descEn: "Neo-bistro", descFr: "Néo-bistrot", cuisine: ["Français"] },
    { name: "Le Rouge à Lèvres", time: 10, descEn: "Wine bar & small plates", descFr: "Bar à vin & petites assiettes", cuisine: ["Français"] },
    { name: "Maison Noura", time: 3, descEn: "Lebanese/Mediterranean, inside Printemps", descFr: "Libanais/méditerranéen, au Printemps", cuisine: ["Méditerranéen"] },
    { name: "ONYX", time: 5, descEn: "French fine dining", descFr: "Gastronomique français", cuisine: ["Français"] },
    { name: "Starving Club", time: 3, descEn: "Gourmet burgers, Galeries Lafayette Gourmet", descFr: "Burgers gourmets, Galeries Lafayette Gourmet", cuisine: ["International"] },
    { name: "Papillons & Co", time: 5, descEn: "French bistro", descFr: "Bistrot français", cuisine: ["Français"] },
    { name: "Paul & Julienne", time: 8, descEn: "French brasserie", descFr: "Brasserie française", cuisine: ["Français"] },
    { name: "Mamou", time: 6, descEn: "Gastro bistro", descFr: "Bistro gastronomique", cuisine: ["Français"] },
  ],
  shopping: [
    { name: "Printemps Haussmann", time: 2, descEn: "Iconic department store", descFr: "Grand magasin iconique" },
    { name: "Galeries Lafayette", time: 1, descEn: "Luxury & fashion", descFr: "Luxe & mode" },
    { name: "Citadium", time: 5, descEn: "Streetwear & sneakers", descFr: "Streetwear & sneakers" },
    { name: "Lindt Opéra", time: 6, descEn: "Chocolate paradise", descFr: "Paradis du chocolat" },
    { name: "Cédric Grolet Opéra", time: 6, descEn: "World-famous pastry", descFr: "Pâtisserie de renommée mondiale" },
    { name: "Place Vendôme", time: 10, descEn: "Luxury jewelry", descFr: "Joaillerie de luxe" },
    { name: "Rue de la Paix", time: 8, descEn: "High-end fashion", descFr: "Mode haut de gamme" },
    { name: "Rue des Martyrs", time: 15, descEn: "Charming local shops & food", descFr: "Boutiques locales & gourmandises" },
    { name: "RAP Italian Grocery", time: 12, descEn: "Italian products & deli", descFr: "Épicerie & traiteur italien" },
  ],
  visits: [
    { name: "Opéra Palais Garnier", time: 4, descEn: "Stunning opera house", descFr: "Opéra somptueux" },
    { name: "Musée du Parfum Fragonard", time: 3, descEn: "Free perfume museum", descFr: "Musée du parfum gratuit" },
    { name: "Église Sainte Trinité", time: 8, descEn: "Beautiful church", descFr: "Belle église" },
    { name: "Square Édouard VII", time: 5, descEn: "Charming hidden square", descFr: "Charmante place cachée" },
    { name: "Place de la Madeleine", time: 10, descEn: "Gourmet food shops", descFr: "Boutiques gastronomiques" },
    { name: "Passage Jouffroy", time: 10, descEn: "Historic covered passage", descFr: "Passage couvert historique" },
    { name: "Passage des Panoramas", time: 12, descEn: "Oldest covered passage in Paris", descFr: "Plus ancien passage couvert de Paris" },
    { name: "Jardin des Tuileries", time: 15, descEn: "Classic Parisian garden", descFr: "Jardin parisien classique" },
    { name: "Hop On Hop Off Bus", time: 5, descEn: "Sightseeing bus tour", descFr: "Bus touristique" },
    { name: "Théâtre du Mogador", time: 6, descEn: "Musicals & shows", descFr: "Comédies musicales & spectacles" },
    { name: "Théâtre Édouard VII", time: 5, descEn: "Classic theater", descFr: "Théâtre classique" },
    { name: "L'Olympia", time: 7, descEn: "Legendary concert hall", descFr: "Salle de concert légendaire" },
    { name: "Pinacothèque", time: 8, descEn: "Art exhibitions", descFr: "Expositions d'art" },
    { name: "Musée Grévin", time: 12, descEn: "Wax museum", descFr: "Musée de cire" },
  ],
  // "Enfants" — addresses à venir.
  culture: [],
  wellness: [
    { name: "Spa Nuxe Printemps", time: 2, descEn: "Luxurious spa in Printemps", descFr: "Spa luxueux au Printemps" },
    { name: "Seasonly", time: 10, descEn: "Natural skincare facial bar", descFr: "Bar à soins du visage naturels" },
    { name: "Spa Cinq Mondes Opéra", time: 6, descEn: "World-inspired spa rituals", descFr: "Rituels spa inspirés du monde" },
  ],
  services: [
    { name: "Pharmacie Européenne", time: 8, descEn: "24/7 pharmacy", descFr: "Pharmacie ouverte 24/7" },
    { name: "Monoprix Haussmann", time: 3, descEn: "Supermarket & essentials", descFr: "Supermarché & essentiels" },
    { name: "La Poste Opéra", time: 5, descEn: "Post office", descFr: "Bureau de poste" },
    { name: "BNP Paribas", time: 4, descEn: "ATM & bank", descFr: "Distributeur & banque" },
    { name: "E.L.A. Laundromat", time: 9, descEn: "Laundromat", descFr: "Laverie automatique" },
    { name: "Billy Wash Lavomatic", time: 8, descEn: "Laundromat", descFr: "Laverie automatique" },
    { name: "Lav'club", time: 9, descEn: "Laundromat", descFr: "Laverie automatique" },
  ],
};


export default function Explore() {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState<string>("restaurants");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [filtering, setFiltering] = useState(false);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setFiltering(true);
    const timer = setTimeout(() => setFiltering(false), 500);
    return () => clearTimeout(timer);
  }, [selectedCuisines]);

  const toggleCuisine = (type: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(type) ? prev.filter((c) => c !== type) : [...prev, type]
    );
  };

  const categories = [
    { id: "restaurants", icon: UtensilsCrossed, label: t.explore.restaurants },
    { id: "shopping", icon: ShoppingBag, label: t.explore.shopping },
    { id: "visits", icon: Landmark, label: t.explore.visits },
    { id: "culture", icon: Baby, label: t.explore.culture },
    { id: "wellness", icon: Sparkles, label: t.explore.wellness },
    { id: "services", icon: Wrench, label: t.explore.services },
  ];

  const displayList =
    active === "restaurants" && selectedCuisines.length > 0
      ? placesData.restaurants.filter((place) =>
          place.cuisine?.some((c) => selectedCuisines.includes(c))
        )
      : placesData[active];


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
              {t.explore.title}
            </h1>
            <p className="text-base text-white/80 mt-1">
              {t.explore.subtitle}
            </p>
          </div>

          {/* Widgets */}
          <div className="px-[30px] space-y-6">
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActive(cat.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-[6px] w-full aspect-[106/92] rounded-xl text-sm font-medium transition-colors backdrop-blur-md border border-[#1c2626]/20 dark:border-transparent",
                    active === cat.id
                      ? "bg-[#1c2626] text-white dark:bg-white dark:text-[#1c2626]"
                      : "bg-white/90 dark:bg-[#1c2626]/80 text-[#1c2626] dark:text-white hover:bg-white/95 dark:hover:bg-[#1c2626]/85"
                  )}
                >
                  <cat.icon className="h-7 w-7 shrink-0" strokeWidth={1.5} />
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>

            {active === "restaurants" && (
              <div className="flex items-center justify-end gap-3">
                {selectedCuisines.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCuisines([])}
                    className="text-sm font-medium text-white underline underline-offset-2"
                  >
                    Réinitialiser
                  </button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-full backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 border border-[#1c2626]/20 dark:border-transparent px-4 py-2 text-sm font-medium text-[#1c2626] dark:text-white"
                    >
                      {selectedCuisines.length === 0
                        ? "Tous les types"
                        : `${selectedCuisines.length} sélectionné${selectedCuisines.length > 1 ? "s" : ""}`}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-64 rounded-2xl bg-white/95 dark:bg-[#1c2626]/95 backdrop-blur-md border border-[#1c2626]/10 dark:border-white/10 p-2"
                  >
                    <div className="space-y-1">
                      {CUISINE_TYPES.map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-[#1c2626]/5 dark:hover:bg-white/10"
                        >
                          <Checkbox
                            checked={selectedCuisines.includes(type)}
                            onCheckedChange={() => toggleCuisine(type)}
                            className="h-5 w-5 rounded"
                          />
                          <span className="text-[15px] text-[#1c2626] dark:text-white">{type}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-3">
              {active === "restaurants" && filtering ? (
                Array.from({ length: 4 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
              ) : (
              <>
              {displayList?.length === 0 && (
                <p className="text-center text-sm text-white/80 py-6">
                  {lang === "fr" ? "Adresses à venir." : "Addresses coming soon."}
                </p>
              )}
              {displayList?.map((place) => {
                const desc = lang === "fr" ? place.descFr : place.descEn;
                return (
                  <a
                    key={place.name}
                    href={`https://www.google.com/maps/search/${encodeURIComponent(place.name + " Paris 9")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl px-5 py-4 backdrop-blur-md bg-white/90 dark:bg-[#1c2626]/80 border border-[#1c2626]/20 dark:border-transparent hover:bg-white/95 dark:hover:bg-[#1c2626]/85 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[17px] font-semibold text-[#1c2626] dark:text-white truncate">
                        {place.name}
                      </p>
                      {desc && (
                        <p className="text-[14px] text-[#1c2626]/70 dark:text-white/80 mt-0.5 truncate">
                          {desc}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      <span className="text-[15px] font-medium text-[#1c2626]/70 dark:text-white/80">
                        {place.time} {t.explore.minutes}
                      </span>
                      <ChevronRight
                        className="h-5 w-5 text-[#1c2626]/70 dark:text-white/80"
                        strokeWidth={1.5}
                      />
                    </div>
                  </a>
                );
              })}
              </>
              )}
            </div>
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
