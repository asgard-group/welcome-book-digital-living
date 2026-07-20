import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  ShoppingBag,
  Landmark,
  Theater,
  Sparkles,
  ConciergeBell,
} from "lucide-react";
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

// Temps de trajet estimés à pied depuis le logement :
// Halévy Apartment — 43 boulevard Haussmann, 75009 Paris
const placesData: Record<string, { name: string; time: number; descEn?: string; descFr?: string }[]> = {
  restaurants: [
    { name: "Galeries Lafayette Gourmet", time: 1, descEn: "Rooftop & gourmet food hall", descFr: "Rooftop & halle gourmande" },
    { name: "El&N", time: 8, descEn: "Instagrammable café & brunch", descFr: "Café & brunch instagrammable" },
    { name: "Créatures", time: 2, descEn: "Vegetarian with a view", descFr: "Végétarien avec vue" },
    { name: "Tortuga", time: 10, descEn: "Mexican-Japanese fusion", descFr: "Fusion mexicaine-japonaise" },
    { name: "Perruche", time: 2, descEn: "Rooftop Mediterranean", descFr: "Méditerranéen sur les toits" },
    { name: "Froufrou", time: 10, descEn: "Chic French bistro", descFr: "Bistrot français chic" },
    { name: "Ao Izakaya", time: 12, descEn: "Japanese tapas", descFr: "Tapas japonaises" },
    { name: "Braun Notes", time: 8, descEn: "Specialty coffee & food", descFr: "Café de spécialité & cuisine" },
    { name: "Brasserie Lazare", time: 5, descEn: "Classic French brasserie", descFr: "Brasserie française classique" },
    { name: "Coco", time: 5, descEn: "Asian fusion", descFr: "Fusion asiatique" },
    { name: "Farmers", time: 8, descEn: "Healthy & organic", descFr: "Sain & bio" },
    { name: "Pépé Ronchon", time: 10, descEn: "Traditional French comfort food", descFr: "Cuisine française traditionnelle" },
    { name: "Poni", time: 12, descEn: "Italian pizzeria", descFr: "Pizzeria italienne" },
    { name: "Mieux", time: 10, descEn: "Modern French cuisine", descFr: "Cuisine française moderne" },
    { name: "Blue Bao", time: 8, descEn: "Trendy Asian", descFr: "Asiatique tendance" },
    { name: "Café de la Paix", time: 4, descEn: "Historic grand café", descFr: "Grand café historique" },
    { name: "Rue Sainte Anne", time: 12, descEn: "Japanese food street", descFr: "Rue japonaise" },
    { name: "Balagan", time: 12, descEn: "Israeli cuisine", descFr: "Cuisine israélienne" },
    { name: "Hanoï Cà Phé Opéra", time: 5, descEn: "Vietnamese", descFr: "Vietnamien" },
    { name: "Pink Mamma", time: 18, descEn: "Iconic Italian", descFr: "Italien iconique" },
    { name: "Papi Restaurant", time: 15, descEn: "Italian comfort food", descFr: "Cuisine italienne réconfortante" },
    { name: "Zébulon", time: 15, descEn: "Neo-bistro", descFr: "Néo-bistrot" },
    { name: "Le Rouge à Lèvres", time: 10, descEn: "Wine bar & small plates", descFr: "Bar à vin & petites assiettes" },
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
  ],
  culture: [
    { name: "Théâtre du Mogador", time: 6, descEn: "Musicals & shows", descFr: "Comédies musicales & spectacles" },
    { name: "Théâtre Édouard VII", time: 5, descEn: "Classic theater", descFr: "Théâtre classique" },
    { name: "L'Olympia", time: 7, descEn: "Legendary concert hall", descFr: "Salle de concert légendaire" },
    { name: "Pinacothèque", time: 8, descEn: "Art exhibitions", descFr: "Expositions d'art" },
    { name: "Musée Grévin", time: 12, descEn: "Wax museum", descFr: "Musée de cire" },
  ],
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
  ],
};


export default function Explore() {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState<string>("restaurants");

  const categories = [
    { id: "restaurants", icon: UtensilsCrossed, label: t.explore.restaurants },
    { id: "shopping", icon: ShoppingBag, label: t.explore.shopping },
    { id: "visits", icon: Landmark, label: t.explore.visits },
    { id: "culture", icon: Theater, label: t.explore.culture },
    { id: "wellness", icon: Sparkles, label: t.explore.wellness },
    { id: "services", icon: ConciergeBell, label: t.explore.services },
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

            <div className="space-y-3">
              {placesData[active]?.map((place) => {
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
            </div>
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
