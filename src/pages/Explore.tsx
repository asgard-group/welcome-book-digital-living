import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  ShoppingBag,
  Landmark,
  Baby,
  Sparkles,
  Wrench,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { pageText } from "@/property/texts";
import { ExternalLink } from "@/components/ExternalLink";
import { useProperty, DEFAULT_BACKGROUND_URL } from "@/property/useProperty";
import joroLogo from "@/assets/joro-living-logo.png";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  restaurants: UtensilsCrossed,
  shopping: ShoppingBag,
  culture: Landmark,
  enfants: Baby,
  wellness: Sparkles,
  pratique: Wrench,
};

export default function Explore() {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const { t, lang } = useLanguage();
  const { data: property } = useProperty();
  const [active, setActive] = useState<string>("restaurants");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const categories = t.explore.categories.map((cat) => ({
    ...cat,
    icon: CATEGORY_ICONS[cat.id],
  }));

  function distanceToMinutes(distance?: string): number {
    if (!distance) return 9999;
    const minMatch = distance.match(/(\d+)\s*min/);
    if (minMatch) return parseInt(minMatch[1]);
    const mMatch = distance.match(/(\d+)\s*m\b/);
    if (mMatch) return parseInt(mMatch[1]) / 80;
    return 9999;
  }

  const rawList = [...(property?.addresses?.[active] ?? [])].sort((a, b) => {
    const aPinned = a.name === "Jöro Kaffé" ? -1 : 0;
    const bPinned = b.name === "Jöro Kaffé" ? -1 : 0;
    if (aPinned !== bPinned) return aPinned - bPinned;
    return distanceToMinutes(a.distance) - distanceToMinutes(b.distance);
  });

  // Cuisine type chips — only for the restaurants category
  const typeList = active === "restaurants"
    ? [...new Set(rawList.map((p) => p.type).filter(Boolean) as string[])]
    : [];

  const displayList = activeType
    ? rawList.filter((p) => p.type === activeType)
    : rawList;


  return (
    <div className="h-app-shell w-full bg-brand-surface dark:bg-brand-ink overflow-hidden">
      <div className="mx-auto w-full max-w-[760px] h-app-shell relative overflow-hidden shadow-sm">
        {/* Background image (non-scrolling shell keeps it static; only the content below scrolls) */}
        <img
          src={property?.backgroundUrl ?? DEFAULT_BACKGROUND_URL}
          alt={property?.name ?? ""}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-ink/30 dark:bg-brand-ink/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-6">
          {/* Back arrow */}
          <div className="sticky top-0 z-20 px-4 pt-4 flex items-center shrink-0">
            <Link to={`/${buildingSlug}/home`} aria-label={t.common.back} className="h-[41px] w-[41px] flex items-center justify-center backdrop-blur-md bg-white/30 dark:bg-brand-ink/50 rounded-[6px]">
              <ChevronLeft className="h-6 w-6 text-white" />
            </Link>
          </div>

          {/* Title */}
          <div className="text-center px-4 pt-[30px] mb-5 shrink-0">
            <h1 className="text-[32px] leading-tight font-serif font-semibold text-white uppercase">
              {pageText(property, "explore", "title", lang, t.explore.title)}
            </h1>
            <p className="text-base text-white/80">
              {pageText(property, "explore", "subtitle", lang, t.explore.subtitle)}
            </p>
          </div>

          {/* Widgets */}
          <div className="px-[30px] space-y-4">
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActive(cat.id); setActiveType(null); }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-[6px] w-full aspect-[106/92] rounded-xl text-sm font-medium transition-colors backdrop-blur-md",
                    active === cat.id
                      ? "bg-brand-ink text-white dark:bg-white dark:text-brand-ink"
                      : "bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white hover:bg-brand-surface/90 dark:hover:bg-brand-ink/85"
                  )}
                >
                  <cat.icon className="h-7 w-7 shrink-0" strokeWidth={1.5} />
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>

            {typeList.length > 0 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowFilter(true)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors backdrop-blur-md",
                    activeType
                      ? "bg-brand-ink text-white dark:bg-white dark:text-brand-ink"
                      : "bg-brand-surface/80 dark:bg-brand-ink/80 text-brand-ink dark:text-white"
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
                  {activeType ?? "Filtrer"}
                </button>
                {activeType && (
                  <button
                    onClick={() => setActiveType(null)}
                    className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white/80 backdrop-blur-md bg-white/15"
                  >
                    <X className="h-3.5 w-3.5" />
                    Tout voir
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {displayList?.length === 0 && (
                <p className="text-center text-sm text-white/80 py-6">
                  {t.explore.comingSoon}
                </p>
              )}
              {displayList?.map((place, i) => (
                <ExternalLink
                  key={`${place.name}-${i}`}
                  href={`https://www.google.com/maps/search/${encodeURIComponent(
                    place.address ? `${place.name}, ${place.address}` : place.name
                  )}`}
                  newTab
                  className="flex items-center justify-between rounded-xl px-4 py-3 backdrop-blur-md bg-brand-surface/80 dark:bg-brand-ink/80 hover:bg-brand-surface/90 dark:hover:bg-brand-ink/85 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] font-semibold text-brand-ink dark:text-white truncate">
                      {place.name}
                    </p>
                    {[place.description?.[lang], place.distance, place.price].filter(Boolean).length > 0 && (
                      <p className="text-[14px] text-brand-ink/70 dark:text-white/80 mt-0.5 truncate">
                        {[place.type ?? place.description?.[lang], place.distance, place.price].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-ink/10 dark:bg-white/10 shrink-0 ml-3">
                    <ChevronRight
                      className="h-5 w-5 text-brand-ink dark:text-white"
                      strokeWidth={1.75}
                    />
                  </span>
                </ExternalLink>
              ))}
            </div>
          </div>

          {/* Footer logo */}
          <div className="flex items-center justify-center gap-5 pt-8">
            <img
              src={joroLogo}
              alt="Jöro Living"
              className="h-[30px] w-auto object-contain brightness-0 invert"
            />
            {property?.logoUrl && (
              <img
                src={property.logoUrl}
                alt="Logo"
                className="h-auto max-h-[36px] max-w-[125px] w-auto object-contain brightness-0 invert"
              />
            )}
          </div>
        </div>

        {/* Filter bottom-sheet */}
        {showFilter && (
          <div className="absolute inset-0 z-30 flex flex-col justify-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm"
              onClick={() => setShowFilter(false)}
            />
            {/* Panel */}
            <div className="relative z-10 rounded-t-[24px] bg-brand-surface dark:bg-brand-ink px-6 pt-5 pb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-brand-ink dark:text-white">Type de cuisine</h2>
                <button onClick={() => setShowFilter(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-ink/10 dark:bg-white/10">
                  <X className="h-4 w-4 text-brand-ink dark:text-white" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setActiveType(null); setShowFilter(false); }}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activeType === null
                      ? "bg-brand-ink text-white dark:bg-white dark:text-brand-ink"
                      : "bg-brand-ink/10 dark:bg-white/10 text-brand-ink dark:text-white"
                  )}
                >
                  Tous
                </button>
                {typeList.map((type) => (
                  <button
                    key={type}
                    onClick={() => { setActiveType(type === activeType ? null : type); setShowFilter(false); }}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      activeType === type
                        ? "bg-brand-ink text-white dark:bg-white dark:text-brand-ink"
                        : "bg-brand-ink/10 dark:bg-white/10 text-brand-ink dark:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
