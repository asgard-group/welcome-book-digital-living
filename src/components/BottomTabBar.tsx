import { NavLink } from "react-router-dom";
import { KeyRound, Home, Info, Compass, PenSquare, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = { to: string; label: string; icon: LucideIcon };

const tabs: Tab[] = [
  { to: "/checkin", label: "Infos", icon: KeyRound },
  { to: "/facilities", label: "Logement", icon: Home },
  { to: "/info", label: "Sécurité", icon: Info },
  { to: "/explore", label: "Explorer", icon: Compass },
  { to: "/checkout", label: "Check-out", icon: PenSquare },
];

export function BottomTabBar() {
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border">
      <ul className="flex items-center justify-around h-16 max-w-[760px] mx-auto px-2">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 h-full text-[11px] font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )
              }
            >
              <t.icon className="h-5 w-5" strokeWidth={1.5} />
              <span>{t.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
