import { Settings, Sun, Moon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";
import { useState } from "react";

type Props = {
  variant?: "light" | "dark";
};

export function SettingsPopover({ variant = "dark" }: Props) {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const triggerColor = variant === "light" ? "text-white/95" : "text-foreground";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button aria-label={t.settings.ariaLabel} className={`${triggerColor} h-[41px] w-[41px] flex items-center justify-center backdrop-blur-md bg-white/30 dark:bg-brand-ink/50 rounded-[6px]`}>
          <Settings className="h-6 w-6" strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-72 rounded-2xl p-0 bg-white dark:bg-brand-ink border-brand-ink/15 dark:border-white/15 shadow-xl"
      >
        <div className="flex items-center px-4 pt-3 pb-2">
          <p className="text-[15px] font-semibold text-brand-ink dark:text-white">{t.settings.title}</p>
        </div>

        <div className="h-px bg-brand-ink/15 dark:bg-white/15" />

        {/* Language */}
        <div className="px-4 py-3">
          <p className="text-[12px] uppercase text-brand-ink/70 dark:text-white/70 mb-2">
            {t.settings.language}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  lang === l
                    ? "bg-brand-ink text-white border-brand-ink dark:bg-white dark:text-brand-ink dark:border-white"
                    : "bg-white text-brand-ink border-brand-ink/20 hover:bg-brand-ink/5 dark:bg-white/10 dark:text-white dark:border-transparent dark:hover:bg-white/20"
                }`}
              >
                {l === "fr" ? t.settings.french : t.settings.english}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="px-4 py-3">
          <p className="text-[12px] uppercase text-brand-ink/70 dark:text-white/70 mb-2">
            {t.settings.appearance}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                theme === "light"
                  ? "bg-brand-ink text-white border-brand-ink dark:bg-white dark:text-brand-ink dark:border-white"
                  : "bg-white text-brand-ink border-brand-ink/20 hover:bg-brand-ink/5 dark:bg-white/10 dark:text-white dark:border-transparent dark:hover:bg-white/20"
              }`}
            >
              <Sun className="h-4 w-4" strokeWidth={1.75} />
              {t.settings.light}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "bg-brand-ink text-white border-brand-ink dark:bg-white dark:text-brand-ink dark:border-white"
                  : "bg-white text-brand-ink border-brand-ink/20 hover:bg-brand-ink/5 dark:bg-white/10 dark:text-white dark:border-transparent dark:hover:bg-white/20"
              }`}
            >
              <Moon className="h-4 w-4" strokeWidth={1.75} />
              {t.settings.dark}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
