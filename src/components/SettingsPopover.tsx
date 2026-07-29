import { Settings, Sun, Moon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";
import { useState } from "react";

type Props = {
  variant?: "light" | "dark";
};

export function SettingsPopover({ variant = "dark" }: Props) {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const triggerColor = variant === "light" ? "text-white/95" : "text-foreground";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button aria-label="Paramètres" className={`${triggerColor} h-11 w-11 flex items-center justify-center`}>
          <Settings className="h-6 w-6" strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-72 rounded-2xl p-0 border-border shadow-xl"
      >
        <div className="flex items-center px-4 pt-3 pb-2">
          <p className="text-[15px] font-semibold text-foreground">Paramètres</p>
        </div>

        <div className="h-px bg-border" />

        {/* Language */}
        <div className="px-4 py-3">
          <p className="text-[12px] uppercase tracking-wide text-muted-foreground mb-2">
            Langue
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  lang === l
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-foreground border-border hover:bg-secondary/50"
                }`}
              >
                {l === "fr" ? "Français" : "English"}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Theme */}
        <div className="px-4 py-3">
          <p className="text-[12px] uppercase tracking-wide text-muted-foreground mb-2">
            Apparence
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                theme === "light"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-foreground border-border hover:bg-secondary/50"
              }`}
            >
              <Sun className="h-4 w-4" strokeWidth={1.75} />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-foreground border-border hover:bg-secondary/50"
              }`}
            >
              <Moon className="h-4 w-4" strokeWidth={1.75} />
              Dark
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
