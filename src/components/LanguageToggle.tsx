import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import flagFr from "@/assets/flag-fr.svg";
import flagGb from "@/assets/flag-gb.svg";

const FLAGS = {
  fr: flagFr,
  en: flagGb,
} as const;

const LABELS = {
  fr: "Français",
  en: "English",
} as const;

export function LanguageToggle({
  className,
  variant = "dark",
  showLabel = false,
}: {
  className?: string;
  variant?: "dark" | "light";
  showLabel?: boolean;
}) {
  const { lang, setLang } = useLanguage();
  const isLight = variant === "light";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Language switcher"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-transparent border",
            showLabel ? "h-8 pl-1 pr-2.5 text-sm" : "h-6 pl-0.5 pr-2",
            isLight ? "border-white/90 text-white" : "border-foreground text-foreground",
            className
          )}
        >
          <img
            src={FLAGS[lang]}
            alt=""
            className={cn("rounded-full object-cover", showLabel ? "h-5 w-5" : "h-4 w-4")}
          />
          {showLabel && <span className="font-medium">{LABELS[lang]}</span>}
          <ChevronDown className={cn("h-3.5 w-3.5", isLight ? "text-white" : "text-foreground")} strokeWidth={2.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {(["fr", "en"] as const).map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLang(l)}
            className={cn("gap-2 cursor-pointer", lang === l && "font-semibold")}
          >
            <img src={FLAGS[l]} alt="" className="h-5 w-5 rounded-full object-cover" />
            <span>{LABELS[l]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
