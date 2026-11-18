import { useState } from "react";
import { cn } from "@/lib/utils";
import {
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
import { useProperty } from "@/property/useProperty";
import { PageShell } from "@/components/PageShell";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  restaurants: UtensilsCrossed,
  shopping: ShoppingBag,
  culture: Landmark,
  enfants: Baby,
  wellness: Sparkles,
  pratique: Wrench,
};

export default function Explore() {
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
    <PageShell
      title={pageText(property, "explore", "title", lang, t.explore.title)}
      subtitle={pageText(property, "explore", "subtitle", lang, t.explore.subtitle)}
      overlay={showFilter && (
      <div className="absolute inset-0 z-30 flex flex-col justify-end">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm"
          onClick={() => setShowFilter(false)}
        />
        {/* Panel */}
        <div className="relative z-10 rounded-t-[24px] bg-brand-surface dark:bg-brand-ink px-6 pt-5 pb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-brand-ink dark:text-white">{t.explore.cuisineType}</h2>
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
              {t.explore.all}
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
    >

      {/* Widgets */}
      <div className="px-[30px] space-y-4 lg:px-10">
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3 lg:max-w-[720px]">
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
              {activeType ?? t.explore.filter}
            </button>
            {activeType && (
              <button
                onClick={() => setActiveType(null)}
                className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white/80 backdrop-blur-md bg-white/15 lg:text-brand-ink/80 lg:bg-brand-ink/10 dark:lg:text-white/80 dark:lg:bg-white/15"
              >
                <X className="h-3.5 w-3.5" />
                {t.explore.seeAll}
              </button>
            )}
          </div>
        )}

        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {displayList?.length === 0 && (
            <p className="text-center text-sm text-white/80 py-6 lg:col-span-2 lg:text-brand-ink/70 dark:lg:text-white/80">
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

    </PageShell>
  );
}
