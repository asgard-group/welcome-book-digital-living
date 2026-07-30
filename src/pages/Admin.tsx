import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BUILDINGS = [
  { id: "haussmann-halevy", label: "Haussmann Mogador" },
  { id: "demo-marais", label: "Demo — Marais" },
  { id: "demo-montmartre", label: "Demo — Montmartre" },
  { id: "demo-bastille", label: "Demo — Bastille" },
];

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
            : "Mot de passe incorrect.",
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
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border bg-background p-6 space-y-4"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-lg font-semibold">Espace admin</h1>
          <p className="text-sm text-muted-foreground">Jöro Living</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Mot de passe</Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || !password}>
          {loading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}

function GrantPanel({ onLogout }: { onLogout: () => void }) {
  const [buildingId, setBuildingId] = useState(BUILDINGS[0].id);
  const [days, setDays] = useState("7");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLink("");
    try {
      const res = await fetch("/api/grants", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          buildingId,
          days: Number(days),
          email: email || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(body?.error === "unauthorized" ? "Session expirée, reconnectez-vous." : "Échec de la création du lien.");
        if (body?.error === "unauthorized") onLogout();
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

  const handleLogout = async () => {
    await fetch("/api/admin-logout", { method: "POST", credentials: "include" }).catch(() => {});
    onLogout();
  };

  return (
    <div className="min-h-screen w-full bg-muted/30 px-4 py-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Créer un accès</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border bg-background p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="building">Logement</Label>
            <Select value={buildingId} onValueChange={setBuildingId}>
              <SelectTrigger id="building">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUILDINGS.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">Durée (jours)</Label>
            <Input
              id="days"
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email du voyageur (optionnel)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voyageur@exemple.com"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Création…" : "Créer le lien"}
          </Button>
        </form>

        {link && (
          <div className="rounded-xl border bg-background p-4 space-y-2">
            <Label>Lien d'accès</Label>
            <div className="flex gap-2">
              <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(link);
                  toast.success("Copié !");
                }}
              >
                Copier
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) return null;

  return authenticated ? (
    <GrantPanel onLogout={() => setAuthenticated(false)} />
  ) : (
    <LoginForm onSuccess={() => setAuthenticated(true)} />
  );
}
