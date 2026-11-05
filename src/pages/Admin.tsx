import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Plus, Eye, Key, LogOut, ChevronRight, X, Copy, Check } from "lucide-react";
import joroLogo from "@/assets/joro-living-logo.png";

type BuildingOption = { id: string; name: string };

/* ─── Design tokens ────────────────────────────────────────────────────── */
const cream = "bg-[#f5f2ed]";
const card = "bg-white rounded-2xl border border-black/8 shadow-sm";

/* ─── Login ─────────────────────────────────────────────────────────────── */
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          body?.error === "admin_not_configured"
            ? "Accès admin non configuré sur cet environnement."
            : "Mot de passe incorrect."
        );
        return;
      }
      onSuccess();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center ${cream} px-4`}>
      <div className="mb-8">
        <img src={joroLogo} alt="Jöro Living" className="h-7 w-auto object-contain brightness-0 opacity-80" />
      </div>
      <form onSubmit={handleSubmit} className={`w-full max-w-sm ${card} p-7 space-y-5`}>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-[#1c2626]">Espace admin</h1>
          <p className="text-sm text-[#1c2626]/50">Connectez-vous pour gérer vos welcome books.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="admin-password" className="text-sm font-medium text-[#1c2626]">
            Mot de passe
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-[#1c2626] placeholder:text-[#1c2626]/30 focus:outline-none focus:ring-2 focus:ring-[#1c2626]/20"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl bg-[#1c2626] py-2.5 text-sm font-medium text-white transition hover:bg-[#1c2626]/85 disabled:opacity-40"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

/* ─── Create access modal ────────────────────────────────────────────────── */
function AccessModal({
  building,
  onClose,
  onLogout,
}: {
  building: BuildingOption;
  onClose: () => void;
  onLogout: () => void;
}) {
  const [days, setDays] = useState("7");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLink("");
    try {
      const res = await fetch("/api/grants", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ buildingId: building.id, days: Number(days), email: email || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (body?.error === "unauthorized") { onLogout(); return; }
        toast.error("Échec de la création du lien.");
        return;
      }
      setLink(body.link);
      toast.success(body.emailed ? "Lien créé et envoyé par email." : "Lien créé.");
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copié !");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div className={`w-full max-w-md ${card} p-6 space-y-5`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1c2626]">Créer un accès</h2>
            <p className="text-sm text-[#1c2626]/50">{building.name}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/8 hover:bg-black/12 transition">
            <X className="h-4 w-4 text-[#1c2626]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1c2626]">Durée (jours)</label>
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
              className="w-full rounded-xl border border-black/15 bg-[#f5f2ed] px-4 py-2.5 text-sm text-[#1c2626] focus:outline-none focus:ring-2 focus:ring-[#1c2626]/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1c2626]">Email du voyageur <span className="text-[#1c2626]/40">(optionnel)</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voyageur@exemple.com"
              className="w-full rounded-xl border border-black/15 bg-[#f5f2ed] px-4 py-2.5 text-sm text-[#1c2626] placeholder:text-[#1c2626]/30 focus:outline-none focus:ring-2 focus:ring-[#1c2626]/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1c2626] py-2.5 text-sm font-medium text-white transition hover:bg-[#1c2626]/85 disabled:opacity-40"
          >
            {loading ? "Création…" : "Générer le lien"}
          </button>
        </form>

        {link && (
          <div className="rounded-xl border border-black/10 bg-[#f5f2ed] p-4 space-y-2">
            <p className="text-xs font-medium text-[#1c2626]/50 uppercase tracking-wide">Lien d'accès</p>
            <div className="flex gap-2 items-center">
              <input
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 rounded-lg bg-white border border-black/10 px-3 py-2 text-xs text-[#1c2626] focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1c2626] text-white hover:bg-[#1c2626]/85 transition"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────── */
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [accessTarget, setAccessTarget] = useState<BuildingOption | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/grants", { credentials: "include" });
        if (res.status === 401) { if (!cancelled) onLogout(); return; }
        const body = await res.json().catch(() => ({}));
        if (!cancelled) setBuildings(body.buildings ?? []);
      } catch {
        toast.error("Impossible de charger les logements.");
      } finally {
        if (!cancelled) setLoadingBuildings(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin-logout", { method: "POST", credentials: "include" }).catch(() => {});
    onLogout();
  };

  return (
    <div className={`min-h-screen w-full ${cream}`}>
      {/* Header */}
      <header className="border-b border-black/8 bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <img src={joroLogo} alt="Jöro Living" className="h-6 w-auto object-contain" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#1c2626]/50">Espace admin</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-[#1c2626]/60 hover:text-[#1c2626] transition"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Welcome books section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#1c2626]">Welcome books</h1>
              <p className="text-sm text-[#1c2626]/50 mt-0.5">Gérez vos logements et les accès voyageurs.</p>
            </div>
            <button
              className="flex items-center gap-2 rounded-xl bg-[#1c2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1c2626]/85 transition"
              onClick={() => toast.info("Création de welcome book — bientôt disponible.")}
            >
              <Plus className="h-4 w-4" />
              Nouveau logement
            </button>
          </div>

          {loadingBuildings ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className={`${card} h-20 animate-pulse`} />
              ))}
            </div>
          ) : buildings.length === 0 ? (
            <div className={`${card} px-6 py-10 text-center`}>
              <p className="text-sm text-[#1c2626]/50">Aucun logement configuré.</p>
              <p className="text-xs text-[#1c2626]/30 mt-1">Créez votre premier welcome book pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {buildings.map((b) => (
                <div key={b.id} className={`${card} flex items-center justify-between gap-4 px-5 py-4`}>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1c2626] truncate">{b.name}</p>
                    <p className="text-xs text-[#1c2626]/40 mt-0.5">/{b.id}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/${b.id}/home`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[#1c2626] hover:bg-black/4 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Prévisualiser
                    </a>
                    <button
                      onClick={() => setAccessTarget(b)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#1c2626] px-3 py-2 text-sm text-white hover:bg-[#1c2626]/85 transition"
                    >
                      <Key className="h-3.5 w-3.5" />
                      Créer un accès
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick links */}
        <section className={`${card} divide-y divide-black/8`}>
          {[
            { label: "Documentation Notion", sub: "Guide de configuration des contenus", icon: ExternalLink },
            { label: "Accès actifs", sub: "Voir les voyageurs connectés — bientôt disponible", icon: ChevronRight },
          ].map(({ label, sub, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-[#1c2626]">{label}</p>
                <p className="text-xs text-[#1c2626]/40 mt-0.5">{sub}</p>
              </div>
              <Icon className="h-4 w-4 text-[#1c2626]/30 shrink-0" />
            </div>
          ))}
        </section>
      </main>

      {/* Access modal */}
      {accessTarget && (
        <AccessModal
          building={accessTarget}
          onClose={() => setAccessTarget(null)}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────────── */
export default function Admin() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin-check", { credentials: "include" });
        const body = await res.json().catch(() => ({}));
        if (!cancelled) setAuthenticated(!!body?.authenticated);
      } catch {
        if (!cancelled) setAuthenticated(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (checking) return <div className={`min-h-screen ${cream}`} />;

  return authenticated ? (
    <Dashboard onLogout={() => setAuthenticated(false)} />
  ) : (
    <LoginForm onSuccess={() => setAuthenticated(true)} />
  );
}
