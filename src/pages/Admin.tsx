import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Eye, Key, LogOut, X, Copy, Check, Trash2, ChevronLeft } from "lucide-react";
import joroLogo from "@/assets/joro-living-logo.png";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Bilingual = { fr: string; en: string };
type PlaceItem = { name: string; address?: string; distance?: string; description?: Bilingual; type?: string };
type ServiceItem = { name: Bilingual; icon?: string; email?: string };
type AccessStep = { name: Bilingual; detail?: Bilingual; code?: string };
type StayBlock = { kind: "arrivee" | "depart" | "information"; name: Bilingual; detail?: Bilingual };
type FaqItem = { name: Bilingual; detail?: Bilingual };
type FacilityItem = { name: Bilingual; detail?: Bilingual; videoUrl?: string };
type FacilitySection = { id: string; title: Bilingual; kind: "video" | "rules"; icon?: string; items: FacilityItem[] };

type BuildingData = {
  id: string;
  name: string;
  address: string;
  wifi: { network: string; password: string };
  guestWifi?: { network: string; password: string };
  colors?: { primary: string; secondary: string };
  backgroundUrl?: string;
  logoUrl?: string;
  access: AccessStep[];
  extraInfo: FaqItem[];
  stay: StayBlock[];
  services: { included: ServiceItem[]; quote: ServiceItem[] };
  addresses: {
    restaurants: PlaceItem[];
    shopping: PlaceItem[];
    culture: PlaceItem[];
    enfants: PlaceItem[];
    wellness: PlaceItem[];
    pratique: PlaceItem[];
  };
  facilities?: { sections: FacilitySection[] };
};

type BuildingOption = { id: string; name: string };

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const cream = "bg-[#f5f2ed]";
const card = "bg-white rounded-2xl border border-black/8 shadow-sm";

function emptyBuilding(): BuildingData {
  return {
    id: "",
    name: "",
    address: "",
    wifi: { network: "", password: "" },
    access: [],
    extraInfo: [],
    stay: [
      { kind: "arrivee", name: { fr: "Arrivée", en: "Arrival" }, detail: { fr: "Arrivée à partir de 15h.", en: "Check-in from 3pm." } },
      { kind: "depart", name: { fr: "Départ", en: "Departure" }, detail: { fr: "Check-out avant 11h00.", en: "Check-out before 11am." } },
    ],
    services: { included: [], quote: [] },
    addresses: { restaurants: [], shopping: [], culture: [], enfants: [], wellness: [], pratique: [] },
  };
}

/** Ensures all array/object fields exist even when loading from incomplete legacy data. */
function normalizeBuilding(raw: Record<string, unknown>): BuildingData {
  const base = emptyBuilding();
  const svc = (raw.services as BuildingData["services"] | undefined) ?? { included: [], quote: [] };
  const addr = (raw.addresses as BuildingData["addresses"] | undefined) ?? base.addresses;
  return {
    ...base,
    ...(raw as Partial<BuildingData>),
    access: (raw.access as AccessStep[]) ?? [],
    extraInfo: (raw.extraInfo as FaqItem[]) ?? [],
    stay: (raw.stay as StayBlock[]) ?? base.stay,
    services: {
      included: svc.included ?? [],
      quote: svc.quote ?? [],
    },
    addresses: {
      restaurants: addr.restaurants ?? [],
      shopping: addr.shopping ?? [],
      culture: addr.culture ?? [],
      enfants: addr.enfants ?? [],
      wellness: addr.wellness ?? [],
      pratique: addr.pratique ?? [],
    },
  };
}

/* ─── Reusable form primitives ───────────────────────────────────────────── */
const inputCls = "w-full rounded-xl border border-black/15 bg-[#f5f2ed] px-3.5 py-2.5 text-sm text-[#1c2626] placeholder:text-[#1c2626]/30 focus:outline-none focus:ring-2 focus:ring-[#1c2626]/20";
const textareaCls = `${inputCls} resize-y min-h-[80px] font-mono text-xs leading-relaxed`;
const labelCls = "block text-xs font-medium text-[#1c2626]/60 mb-1 uppercase tracking-wide";
const sectionTitle = "text-sm font-semibold text-[#1c2626] mb-3";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function BilingualInput({
  label, value, onChange, multiline = false
}: {
  label: string; value: Bilingual; onChange: (v: Bilingual) => void; multiline?: boolean;
}) {
  const cls = multiline ? textareaCls : inputCls;
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="space-y-1.5">
      <label className={labelCls}>{label}</label>
      <Tag className={cls} value={value.fr} onChange={(e) => onChange({ ...value, fr: (e.target as HTMLInputElement | HTMLTextAreaElement).value })} />
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-[#1c2626]/60 hover:text-[#1c2626] border border-dashed border-black/20 rounded-xl px-4 py-2.5 w-full justify-center hover:border-black/40 transition"
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#1c2626]/30 hover:text-red-500 hover:bg-red-50 transition"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function ItemCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 space-y-3 relative">
      <div className="absolute top-3 right-3"><RemoveButton onClick={onRemove} /></div>
      {children}
    </div>
  );
}

function SectionSep() {
  return <div className="border-t border-black/8 my-6" />;
}

/* ─── ImageUpload ────────────────────────────────────────────────────────── */
function ImageUpload({ label, slug, field, value, onChange }: {
  label: string; slug: string; field: string; value?: string; onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useState<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!slug) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug);
      fd.append("field", field);
      const res = await fetch("/api/upload-image", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) { toast.error("Erreur lors de l'upload."); return; }
      const body = await res.json();
      onChange(body.url);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-1.5">
      <label className={labelCls}>{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative rounded-xl border-2 border-dashed border-black/15 hover:border-black/30 transition overflow-hidden"
        style={{ minHeight: 100 }}
      >
        {value ? (
          <div>
            <img src={value} alt="" className="w-full h-32 object-cover rounded-t-xl" />
            <div className="flex items-center gap-2 px-3 py-2 border-t border-black/8">
              <label className="cursor-pointer text-xs text-[#1c2626]/60 hover:text-[#1c2626] transition">
                Changer
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </label>
              <span className="text-[#1c2626]/20">·</span>
              <button type="button" onClick={() => onChange("")} className="text-xs text-red-400 hover:text-red-600 transition">Supprimer</button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 py-7 cursor-pointer">
            {uploading
              ? <span className="inline-block h-5 w-5 rounded-full border-2 border-[#1c2626]/20 border-t-[#1c2626] animate-spin" />
              : <span className="text-2xl">↑</span>}
            <span className="text-sm text-[#1c2626]/50">{uploading ? "Upload en cours…" : "Glisser-déposer ou cliquer"}</span>
            <span className="text-xs text-[#1c2626]/30">JPG, PNG, WebP — 10 Mo max</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </label>
        )}
      </div>
    </div>
  );
}

/* ─── Tab: Infos de base ─────────────────────────────────────────────────── */
function TabInfos({ data, onChange, isNew }: { data: BuildingData; onChange: (d: BuildingData) => void; isNew: boolean }) {
  const set = (key: keyof BuildingData, val: unknown) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-4">
      {/* Identité */}
      <div className="bg-white rounded-2xl border border-black/8 p-5 space-y-4">
        <p className={sectionTitle}>Identité</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom public">
            <input className={inputCls} value={data.name} onChange={(e) => set("name", e.target.value)} placeholder="Haussmann Mogador" />
          </Field>
          <Field label="Slug (identifiant URL)">
            <input
              className={inputCls}
              value={data.id}
              readOnly={!isNew}
              onChange={(e) => set("id", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="haussmann-halevy-1"
              title={isNew ? undefined : "Le slug ne peut pas être modifié après création"}
            />
          </Field>
        </div>
        <Field label="Adresse complète">
          <input className={inputCls} value={data.address} onChange={(e) => set("address", e.target.value)} placeholder="43 boulevard Haussmann, 75009 Paris, France" />
        </Field>
      </div>

      {/* WiFi principal */}
      <div className="bg-white rounded-2xl border border-black/8 p-5 space-y-4">
        <p className={sectionTitle}>WiFi principal</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Réseau">
            <input className={inputCls} value={data.wifi.network} onChange={(e) => set("wifi", { ...data.wifi, network: e.target.value })} placeholder="JORO-LIVING" />
          </Field>
          <Field label="Mot de passe">
            <input className={inputCls} value={data.wifi.password} onChange={(e) => set("wifi", { ...data.wifi, password: e.target.value })} placeholder="bienvenue2024" />
          </Field>
        </div>
      </div>

      {/* WiFi invité */}
      <div className="bg-white rounded-2xl border border-black/8 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className={sectionTitle}>WiFi invité <span className="font-normal text-[#1c2626]/40">(optionnel)</span></p>
          {!data.guestWifi
            ? <button type="button" onClick={() => set("guestWifi", { network: "", password: "" })} className="text-xs text-[#1c2626]/60 hover:text-[#1c2626]">+ Ajouter</button>
            : <button type="button" onClick={() => set("guestWifi", undefined)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>}
        </div>
        {data.guestWifi && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Réseau">
              <input className={inputCls} value={data.guestWifi.network} onChange={(e) => set("guestWifi", { ...data.guestWifi, network: e.target.value })} placeholder="JORO-GUEST" />
            </Field>
            <Field label="Mot de passe">
              <input className={inputCls} value={data.guestWifi.password} onChange={(e) => set("guestWifi", { ...data.guestWifi, password: e.target.value })} placeholder="" />
            </Field>
          </div>
        )}
      </div>

      {/* Apparence */}
      <div className="bg-white rounded-2xl border border-black/8 p-5 space-y-4">
        <p className={sectionTitle}>Apparence <span className="font-normal text-[#1c2626]/40">(optionnel)</span></p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Couleur principale">
            <div className="flex gap-2">
              <input type="color" value={data.colors?.primary ?? "#1c2626"} onChange={(e) => set("colors", { ...data.colors, primary: e.target.value })} className="h-10 w-10 rounded-lg border border-black/15 cursor-pointer" />
              <input className={inputCls} value={data.colors?.primary ?? ""} onChange={(e) => set("colors", { ...data.colors, primary: e.target.value })} placeholder="#1c2626" />
            </div>
          </Field>
          <Field label="Couleur secondaire">
            <div className="flex gap-2">
              <input type="color" value={data.colors?.secondary ?? "#ffffff"} onChange={(e) => set("colors", { ...data.colors, secondary: e.target.value })} className="h-10 w-10 rounded-lg border border-black/15 cursor-pointer" />
              <input className={inputCls} value={data.colors?.secondary ?? ""} onChange={(e) => set("colors", { ...data.colors, secondary: e.target.value })} placeholder="#ffffff" />
            </div>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ImageUpload
            label="Photo de fond"
            slug={data.id}
            field="background"
            value={data.backgroundUrl}
            onChange={(url) => set("backgroundUrl", url || undefined)}
          />
          <ImageUpload
            label="Logo de l'immeuble"
            slug={data.id}
            field="logo"
            value={data.logoUrl}
            onChange={(url) => set("logoUrl", url || undefined)}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Accès ─────────────────────────────────────────────────────────── */
function TabAcces({ data, onChange }: { data: BuildingData; onChange: (d: BuildingData) => void }) {
  const steps = data.access;
  const update = (i: number, step: AccessStep) => {
    const next = [...steps]; next[i] = step; onChange({ ...data, access: next });
  };
  const add = () => onChange({ ...data, access: [...steps, { name: { fr: "", en: "" } }] });
  const remove = (i: number) => onChange({ ...data, access: steps.filter((_, j) => j !== i) });

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#1c2626]/50 mb-4">Étapes pour accéder à l'appartement (codes, ascenseur, porte…)</p>
      {steps.map((step, i) => (
        <ItemCard key={i} onRemove={() => remove(i)}>
          <div className="text-xs font-semibold text-[#1c2626]/40 uppercase tracking-widest mb-2">Étape {i + 1}</div>
          <BilingualInput label="Titre de l'étape" value={step.name} onChange={(v) => update(i, { ...step, name: v })} />
          <BilingualInput label="Description" value={step.detail ?? { fr: "", en: "" }} onChange={(v) => update(i, { ...step, detail: v.fr || v.en ? v : undefined })} />
          <Field label="Code (optionnel)">
            <input className={inputCls} value={step.code ?? ""} onChange={(e) => update(i, { ...step, code: e.target.value || undefined })} placeholder="A3187" />
          </Field>
        </ItemCard>
      ))}
      <AddButton label="Ajouter une étape" onClick={add} />
    </div>
  );
}

/* ─── Tab: Check-in / Check-out ─────────────────────────────────────────── */
function TabCheckin({ data, onChange }: { data: BuildingData; onChange: (d: BuildingData) => void }) {
  const stays = data.stay;
  const update = (i: number, block: StayBlock) => {
    const next = [...stays]; next[i] = block; onChange({ ...data, stay: next });
  };
  const add = () => onChange({ ...data, stay: [...stays, { kind: "information", name: { fr: "", en: "" }, detail: { fr: "", en: "" } }] });
  const remove = (i: number) => onChange({ ...data, stay: stays.filter((_, j) => j !== i) });

  const KIND_LABELS: Record<StayBlock["kind"], string> = {
    arrivee: "Arrivée (15h)",
    depart: "Départ (11h)",
    information: "Information",
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#1c2626]/50 mb-4">Les lignes commençant par « - » s'affichent en puces dans l'app.</p>
      {stays.map((block, i) => (
        <ItemCard key={i} onRemove={() => remove(i)}>
          <Field label="Type de bloc">
            <select
              className={inputCls}
              value={block.kind}
              onChange={(e) => update(i, { ...block, kind: e.target.value as StayBlock["kind"] })}
            >
              {(Object.entries(KIND_LABELS) as [StayBlock["kind"], string][]).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </Field>
          <BilingualInput label="Titre" value={block.name} onChange={(v) => update(i, { ...block, name: v })} />
          <BilingualInput label="Contenu" value={block.detail ?? { fr: "", en: "" }} onChange={(v) => update(i, { ...block, detail: v.fr || v.en ? v : undefined })} multiline />
        </ItemCard>
      ))}
      <AddButton label="Ajouter un bloc" onClick={add} />
    </div>
  );
}

/* ─── Tab: Infos complémentaires (FAQ) ───────────────────────────────────── */
function TabFaq({ data, onChange }: { data: BuildingData; onChange: (d: BuildingData) => void }) {
  const items = data.extraInfo;
  const update = (i: number, item: FaqItem) => {
    const next = [...items]; next[i] = item; onChange({ ...data, extraInfo: next });
  };
  const add = () => onChange({ ...data, extraInfo: [...items, { name: { fr: "", en: "" }, detail: { fr: "", en: "" } }] });
  const remove = (i: number) => onChange({ ...data, extraInfo: items.filter((_, j) => j !== i) });

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#1c2626]/50 mb-4">Questions / réponses affichées en accordéon sur la page d'accès.</p>
      {items.map((item, i) => (
        <ItemCard key={i} onRemove={() => remove(i)}>
          <BilingualInput label="Question" value={item.name} onChange={(v) => update(i, { ...item, name: v })} />
          <BilingualInput label="Réponse" value={item.detail ?? { fr: "", en: "" }} onChange={(v) => update(i, { ...item, detail: v.fr || v.en ? v : undefined })} multiline />
        </ItemCard>
      ))}
      <AddButton label="Ajouter une question" onClick={add} />
    </div>
  );
}

/* ─── Tab: Services ──────────────────────────────────────────────────────── */
function ServiceList({
  label, items, onChange,
}: {
  label: string; items: ServiceItem[]; onChange: (items: ServiceItem[]) => void;
}) {
  const update = (i: number, item: ServiceItem) => { const next = [...items]; next[i] = item; onChange(next); };
  const add = () => onChange([...items, { name: { fr: "", en: "" } }]);
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      <p className={sectionTitle}>{label}</p>
      {items.map((svc, i) => (
        <ItemCard key={i} onRemove={() => remove(i)}>
          <BilingualInput label="Nom du service" value={svc.name} onChange={(v) => update(i, { ...svc, name: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Icône (texte libre)">
              <input className={inputCls} value={svc.icon ?? ""} onChange={(e) => update(i, { ...svc, icon: e.target.value || undefined })} placeholder="wifi, clé, ménage…" />
            </Field>
            <Field label="Email de contact (optionnel)">
              <input className={inputCls} type="email" value={svc.email ?? ""} onChange={(e) => update(i, { ...svc, email: e.target.value || undefined })} placeholder="reservation@joro-space.fr" />
            </Field>
          </div>
        </ItemCard>
      ))}
      <AddButton label={`Ajouter — ${label}`} onClick={add} />
    </div>
  );
}

function TabServices({ data, onChange }: { data: BuildingData; onChange: (d: BuildingData) => void }) {
  return (
    <div className="space-y-6">
      <ServiceList
        label="Services inclus"
        items={data.services.included}
        onChange={(included) => onChange({ ...data, services: { ...data.services, included } })}
      />
      <SectionSep />
      <ServiceList
        label="Services sur devis (En plus)"
        items={data.services.quote}
        onChange={(quote) => onChange({ ...data, services: { ...data.services, quote } })}
      />
    </div>
  );
}

/* ─── Tab: Explorer (Adresses) ───────────────────────────────────────────── */
const EXPLORER_CATEGORIES: { key: keyof BuildingData["addresses"]; label: string }[] = [
  { key: "restaurants", label: "Restaurants" },
  { key: "shopping", label: "Shopping" },
  { key: "culture", label: "Culture" },
  { key: "enfants", label: "Enfants" },
  { key: "wellness", label: "Bien-être" },
  { key: "pratique", label: "Pratique" },
];

function PlaceList({
  items, onChange, showType = false,
}: {
  items: PlaceItem[]; onChange: (items: PlaceItem[]) => void; showType?: boolean;
}) {
  const update = (i: number, item: PlaceItem) => { const next = [...items]; next[i] = item; onChange(next); };
  const add = () => onChange([...items, { name: "", description: { fr: "", en: "" } }]);
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      {items.map((place, i) => (
        <ItemCard key={i} onRemove={() => remove(i)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom">
              <input className={inputCls} value={place.name} onChange={(e) => update(i, { ...place, name: e.target.value })} />
            </Field>
            <Field label="Distance">
              <input className={inputCls} value={place.distance ?? ""} onChange={(e) => update(i, { ...place, distance: e.target.value || undefined })} placeholder="5 min" />
            </Field>
          </div>
          <Field label="Adresse">
            <input className={inputCls} value={place.address ?? ""} onChange={(e) => update(i, { ...place, address: e.target.value || undefined })} placeholder="31 Rue Saint-Lazare, 75009 Paris" />
          </Field>
          <BilingualInput label="Description / sous-titre" value={place.description ?? { fr: "", en: "" }} onChange={(v) => update(i, { ...place, description: v.fr || v.en ? v : undefined })} />
          {showType && (
            <Field label="Type (filtre cuisine)">
              <input className={inputCls} value={place.type ?? ""} onChange={(e) => update(i, { ...place, type: e.target.value || undefined })} placeholder="Française, Italienne, Café…" />
            </Field>
          )}
        </ItemCard>
      ))}
      <AddButton label="Ajouter un lieu" onClick={add} />
    </div>
  );
}

function TabExplorer({ data, onChange }: { data: BuildingData; onChange: (d: BuildingData) => void }) {
  const [cat, setCat] = useState<keyof BuildingData["addresses"]>("restaurants");

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {EXPLORER_CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setCat(key)}
            className={`px-3.5 py-1.5 rounded-full text-sm transition ${cat === key ? "bg-[#1c2626] text-white" : "bg-black/8 text-[#1c2626]/70 hover:bg-black/12"}`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-60">{data.addresses[key].length}</span>
          </button>
        ))}
      </div>

      <PlaceList
        items={data.addresses[cat]}
        onChange={(items) => onChange({ ...data, addresses: { ...data.addresses, [cat]: items } })}
        showType={cat === "restaurants"}
      />
    </div>
  );
}

/* ─── Tab: Guide du logement ─────────────────────────────────────────────── */
function TabGuide({ data, onChange }: { data: BuildingData; onChange: (d: BuildingData) => void }) {
  const sections = data.facilities?.sections ?? [];

  const updateSections = (s: FacilitySection[]) => onChange({ ...data, facilities: { sections: s } });
  const updateSection = (i: number, s: FacilitySection) => { const next = [...sections]; next[i] = s; updateSections(next); };
  const removeSection = (i: number) => updateSections(sections.filter((_, j) => j !== i));
  const addSection = () =>
    updateSections([...sections, { id: `section-${Date.now()}`, title: { fr: "", en: "" }, kind: "video", items: [] }]);

  const updateItem = (si: number, ii: number, item: FacilityItem) => {
    const items = [...sections[si].items]; items[ii] = item;
    updateSection(si, { ...sections[si], items });
  };
  const removeItem = (si: number, ii: number) =>
    updateSection(si, { ...sections[si], items: sections[si].items.filter((_, j) => j !== ii) });
  const addItem = (si: number) =>
    updateSection(si, { ...sections[si], items: [...sections[si].items, { name: { fr: "", en: "" } }] });

  return (
    <div className="space-y-4">
      {sections.map((section, si) => (
        <div key={section.id} className={`${card} p-4 space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1c2626]/40 uppercase tracking-widest">Section {si + 1}</span>
            <button type="button" onClick={() => removeSection(si)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#1c2626]/30 hover:text-red-500 hover:bg-red-50 transition">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <BilingualInput label="Titre de la section" value={section.title} onChange={(v) => updateSection(si, { ...section, title: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select className={inputCls} value={section.kind} onChange={(e) => updateSection(si, { ...section, kind: e.target.value as "video" | "rules" })}>
                <option value="video">Standard (vidéos)</option>
                <option value="rules">Règlement intérieur</option>
              </select>
            </Field>
            <Field label="Icône (texte libre)">
              <input className={inputCls} value={section.icon ?? ""} onChange={(e) => updateSection(si, { ...section, icon: e.target.value || undefined })} placeholder="cuisine, équipements…" />
            </Field>
          </div>

          <div className="border-t border-black/8 pt-4 space-y-3">
            <p className="text-xs font-medium text-[#1c2626]/50 uppercase tracking-wide">Éléments</p>
            {section.items.map((item, ii) => (
              <ItemCard key={ii} onRemove={() => removeItem(si, ii)}>
                <BilingualInput label="Nom" value={item.name} onChange={(v) => updateItem(si, ii, { ...item, name: v })} />
                <BilingualInput label="Description" value={item.detail ?? { fr: "", en: "" }} onChange={(v) => updateItem(si, ii, { ...item, detail: v.fr || v.en ? v : undefined })} multiline />
                <Field label="URL vidéo (optionnel)">
                  <input className={inputCls} value={item.videoUrl ?? ""} onChange={(e) => updateItem(si, ii, { ...item, videoUrl: e.target.value || undefined })} placeholder="https://..." />
                </Field>
              </ItemCard>
            ))}
            <AddButton label="Ajouter un élément" onClick={() => addItem(si)} />
          </div>
        </div>
      ))}
      <AddButton label="Ajouter une section" onClick={addSection} />
    </div>
  );
}

/* ─── Building Form ──────────────────────────────────────────────────────── */
const TABS = [
  { id: "infos", label: "Infos de base" },
  { id: "acces", label: "Accès" },
  { id: "checkin", label: "Check-in/out" },
  { id: "faq", label: "FAQ" },
  { id: "services", label: "Services" },
  { id: "explorer", label: "Explorer" },
  { id: "guide", label: "Guide" },
] as const;

type TabId = typeof TABS[number]["id"];

function BuildingForm({
  initial,
  isNew,
  onSave,
  onCancel,
}: {
  initial: BuildingData;
  isNew: boolean;
  onSave: (data: BuildingData) => Promise<void>;
  onCancel: () => void;
}) {
  const [data, setData] = useState<BuildingData>(initial);
  const [tab, setTab] = useState<TabId>("infos");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!data.id) { toast.error("Le slug (identifiant) est obligatoire."); setTab("infos"); return; }
    if (!data.name) { toast.error("Le nom public est obligatoire."); setTab("infos"); return; }
    setSaving(true);
    try {
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen w-full ${cream}`}>
      {/* Header */}
      <header className="border-b border-black/8 bg-white px-6 py-4 sticky top-0 z-30">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/8 hover:bg-black/12 transition">
              <ChevronLeft className="h-4 w-4 text-[#1c2626]" />
            </button>
            <div>
              <p className="text-xs text-[#1c2626]/40 uppercase tracking-widest">{isNew ? "Nouveau logement" : "Modifier"}</p>
              <p className="font-semibold text-[#1c2626]">{data.name || "Sans nom"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && data.id && (
              <a href={`/${data.id}/home`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl border border-black/15 px-3.5 py-2 text-sm text-[#1c2626] hover:bg-black/4 transition">
                <Eye className="h-3.5 w-3.5" /> Prévisualiser
              </a>
            )}
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#1c2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c2626]/85 disabled:opacity-40 transition">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="mx-auto max-w-5xl mt-3 flex gap-1 overflow-x-auto pb-px">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm transition ${tab === id ? "bg-[#1c2626] text-white" : "text-[#1c2626]/60 hover:bg-black/8"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {tab === "infos" && <TabInfos data={data} onChange={setData} isNew={isNew} />}
        {tab === "acces" && <TabAcces data={data} onChange={setData} />}
        {tab === "checkin" && <TabCheckin data={data} onChange={setData} />}
        {tab === "faq" && <TabFaq data={data} onChange={setData} />}
        {tab === "services" && <TabServices data={data} onChange={setData} />}
        {tab === "explorer" && <TabExplorer data={data} onChange={setData} />}
        {tab === "guide" && <TabGuide data={data} onChange={setData} />}
      </main>
    </div>
  );
}

/* ─── Grants section ─────────────────────────────────────────────────────── */
type GrantEntry = {
  key: string;
  buildingId: string;
  buildingName: string;
  guestEmail?: string;
  validFrom: number;
  validUntil: number;
  createdAt: number;
  revoked: boolean;
  status: "active" | "expired" | "revoked";
};

function fmt(ts: number) {
  return new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function StatusBadge({ status }: { status: GrantEntry["status"] }) {
  const styles: Record<GrantEntry["status"], string> = {
    active: "bg-emerald-50 text-emerald-700",
    expired: "bg-black/8 text-[#1c2626]/50",
    revoked: "bg-red-50 text-red-600",
  };
  const labels: Record<GrantEntry["status"], string> = { active: "Actif", expired: "Expiré", revoked: "Révoqué" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function GrantsSection({ onLogout, refreshKey }: { onLogout: () => void; refreshKey: number }) {
  const [grants, setGrants] = useState<GrantEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/grant-list", { credentials: "include" });
      if (res.status === 401) { onLogout(); return; }
      const body = await res.json().catch(() => ({}));
      setGrants(body.grants ?? []);
    } catch {
      toast.error("Impossible de charger les accès.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshKey]);

  const handleRevoke = async (grant: GrantEntry) => {
    if (!confirm(`Révoquer l'accès de ${grant.guestEmail ?? grant.buildingName} ?`)) return;
    setRevoking(grant.key);
    try {
      await fetch(`/api/grant-list?key=${encodeURIComponent(grant.key)}`, { method: "DELETE", credentials: "include" });
      toast.success("Accès révoqué.");
      await load();
    } catch {
      toast.error("Erreur lors de la révocation.");
    } finally {
      setRevoking(null);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1c2626]">Accès voyageurs</h2>
        <button onClick={load} className="text-xs text-[#1c2626]/50 hover:text-[#1c2626] transition">
          Actualiser
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className={`${card} h-14 animate-pulse`} />)}
        </div>
      ) : grants.length === 0 ? (
        <div className={`${card} px-6 py-8 text-center`}>
          <p className="text-sm text-[#1c2626]/50">Aucun accès créé pour le moment.</p>
        </div>
      ) : (
        <div className={`${card} divide-y divide-black/8 overflow-hidden`}>
          {grants.map((g) => (
            <div key={g.key} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[#1c2626] truncate">{g.buildingName}</span>
                  <StatusBadge status={g.status} />
                </div>
                <p className="text-xs text-[#1c2626]/40 truncate">
                  {g.guestEmail ? `${g.guestEmail} · ` : ""}
                  {fmt(g.validFrom)} → {fmt(g.validUntil)}
                </p>
              </div>
              {g.status === "active" && (
                <button
                  onClick={() => handleRevoke(g)}
                  disabled={revoking === g.key}
                  className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40 transition"
                >
                  {revoking === g.key ? "…" : "Révoquer"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Create access modal ─────────────────────────────────────────────────── */
function AccessModal({
  building,
  onClose,
  onLogout,
  onSuccess,
}: {
  building: BuildingOption;
  onClose: () => void;
  onLogout: () => void;
  onSuccess?: () => void;
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
      onSuccess?.();
      setTimeout(() => onClose(), 3000);
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
            <input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} required className="w-full rounded-xl border border-black/15 bg-[#f5f2ed] px-4 py-2.5 text-sm text-[#1c2626] focus:outline-none focus:ring-2 focus:ring-[#1c2626]/20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1c2626]">Email du voyageur <span className="text-[#1c2626]/40">(optionnel)</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voyageur@exemple.com" className="w-full rounded-xl border border-black/15 bg-[#f5f2ed] px-4 py-2.5 text-sm text-[#1c2626] placeholder:text-[#1c2626]/30 focus:outline-none focus:ring-2 focus:ring-[#1c2626]/20" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#1c2626] py-2.5 text-sm font-medium text-white transition hover:bg-[#1c2626]/85 disabled:opacity-40">
            {loading ? "Création…" : "Générer le lien"}
          </button>
        </form>

        {link && (
          <div className="rounded-xl border border-black/10 bg-[#f5f2ed] p-4 space-y-2">
            <p className="text-xs font-medium text-[#1c2626]/50 uppercase tracking-wide">Lien d'accès</p>
            <div className="flex gap-2 items-center">
              <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="flex-1 min-w-0 rounded-lg bg-white border border-black/10 px-3 py-2 text-xs text-[#1c2626] focus:outline-none" />
              <button onClick={handleCopy} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1c2626] text-white hover:bg-[#1c2626]/85 transition">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CopyUrl ────────────────────────────────────────────────────────────── */
function CopyUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="group flex items-center gap-1.5 mt-0.5 text-left">
      <span className="text-xs text-[#1c2626]/40 truncate group-hover:text-[#1c2626]/70 transition">{url}</span>
      <span className="text-[10px] text-[#1c2626]/30 group-hover:text-[#1c2626]/60 transition shrink-0">
        {copied ? "✓ Copié" : "Copier"}
      </span>
    </button>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────── */
type DashboardView =
  | { screen: "dashboard" }
  | { screen: "new" }
  | { screen: "edit"; slug: string };

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [view, setView] = useState<DashboardView>({ screen: "dashboard" });
  const [editData, setEditData] = useState<BuildingData | null>(null);
  const [deployState, setDeployState] = useState<"idle" | "loading" | "ok" | "error" | "unconfigured">("idle");

  const handleDeploy = async () => {
    setDeployState("loading");
    try {
      const res = await fetch("/api/deploy", { method: "POST", credentials: "include" });
      if (res.status === 503) { setDeployState("unconfigured"); return; }
      setDeployState(res.ok ? "ok" : "error");
    } catch {
      setDeployState("error");
    } finally {
      setTimeout(() => setDeployState("idle"), 5000);
    }
  };

  const loadBuildings = async () => {
    try {
      const res = await fetch("/api/building-admin", { credentials: "include" });
      if (res.status === 401) { onLogout(); return; }
      const body = await res.json().catch(() => ({}));
      setBuildings(body.buildings ?? []);
    } catch {
      toast.error("Impossible de charger les logements.");
    } finally {
      setLoadingBuildings(false);
    }
  };

  useEffect(() => { loadBuildings(); }, []);

  const handleLogout = async () => {
    await fetch("/api/admin-logout", { method: "POST", credentials: "include" }).catch(() => {});
    onLogout();
  };

  const handleEditClick = async (b: BuildingOption) => {
    try {
      const res = await fetch(`/api/building-admin?slug=${b.id}`, { credentials: "include" });
      const body = await res.json();
      setEditData(normalizeBuilding(body));
      setView({ screen: "edit", slug: b.id });
    } catch {
      toast.error("Impossible de charger les données du logement.");
    }
  };

  const handleSave = async (data: BuildingData) => {
    const res = await fetch("/api/building-admin", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (body?.error === "unauthorized") { onLogout(); return; }
      toast.error("Erreur lors de l'enregistrement.");
      return;
    }
    toast.success("Logement enregistré.");
    setView({ screen: "dashboard" });
    setEditData(null);
    setLoadingBuildings(true);
    await loadBuildings();
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Supprimer le logement « ${slug} » ? Cette action est irréversible.`)) return;
    const res = await fetch(`/api/building-admin?slug=${encodeURIComponent(slug)}`, { method: "DELETE", credentials: "include" });
    if (res.status === 401) { onLogout(); return; }
    if (!res.ok) { toast.error("Erreur lors de la suppression."); return; }
    toast.success("Logement supprimé.");
    setLoadingBuildings(true);
    await loadBuildings();
  };

  const buildingUrl = (slug: string) => `${window.location.origin}/${slug}`;
  const qrSrc = (slug: string) => `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(buildingUrl(slug))}`;

  const handleDownloadQr = async (slug: string, name: string) => {
    const res = await fetch(qrSrc(slug));
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${slug}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ── Building form views ──────────────────────────────────────────────────
  if (view.screen === "new") {
    return (
      <BuildingForm
        initial={emptyBuilding()}
        isNew
        onSave={handleSave}
        onCancel={() => setView({ screen: "dashboard" })}
      />
    );
  }

  if (view.screen === "edit" && editData) {
    return (
      <BuildingForm
        initial={editData}
        isNew={false}
        onSave={handleSave}
        onCancel={() => { setView({ screen: "dashboard" }); setEditData(null); }}
      />
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen w-full ${cream}`}>
      <header className="border-b border-black/8 bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <img src={joroLogo} alt="Jöro Living" className="h-6 w-auto object-contain brightness-0 opacity-80" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#1c2626]/50">Espace admin</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-[#1c2626]/60 hover:text-[#1c2626] transition">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#1c2626]">Welcome books</h1>
              <p className="text-sm text-[#1c2626]/50 mt-0.5">Gérez vos logements et les accès voyageurs.</p>
            </div>
            <button
              className="flex items-center gap-2 rounded-xl bg-[#1c2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1c2626]/85 transition"
              onClick={() => setView({ screen: "new" })}
            >
              <Plus className="h-4 w-4" /> Nouveau logement
            </button>
          </div>

          {loadingBuildings ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className={`${card} h-20 animate-pulse`} />)}
            </div>
          ) : buildings.length === 0 ? (
            <div className={`${card} px-6 py-10 text-center`}>
              <p className="text-sm text-[#1c2626]/50">Aucun logement configuré.</p>
              <button onClick={() => setView({ screen: "new" })} className="mt-3 text-sm text-[#1c2626] underline underline-offset-2">
                Créer votre premier welcome book
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {buildings.map((b) => (
                <div key={b.id} className={`${card} px-5 py-4`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#1c2626] truncate">{b.name}</p>
                      <CopyUrl url={buildingUrl(b.id)} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleEditClick(b)} className="flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[#1c2626] hover:bg-black/4 transition">
                        Modifier
                      </button>
                      <a href={`/${b.id}/home`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[#1c2626] hover:bg-black/4 transition">
                        <Eye className="h-3.5 w-3.5" /> Voir
                      </a>
                      <button
                        onClick={() => handleDelete(b.id)}
                        title="Supprimer ce logement"
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Supprimer
                      </button>
                    </div>
                  </div>
                  {/* QR Code */}
                  <div className="mt-4 flex items-center gap-5 pt-4 border-t border-black/6">
                    <img src={qrSrc(b.id)} alt={`QR ${b.name}`} className="h-24 w-24 rounded-lg border border-black/8" />
                    <div className="space-y-2">
                      <p className="text-xs text-[#1c2626]/50">QR code à imprimer pour les voyageurs</p>
                      <button onClick={() => handleDownloadQr(b.id, b.name)} className="flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs text-[#1c2626] hover:bg-black/4 transition">
                        ↓ Télécharger le QR code
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Maintenance */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium text-[#1c2626]/40 uppercase tracking-widest">Maintenance</h2>
          <div className={`${card} px-5 py-4 flex items-center justify-between gap-4`}>
            <div>
              <p className="text-sm font-medium text-[#1c2626]">Redéployer le site</p>
              <p className="text-xs text-[#1c2626]/50 mt-0.5">
                Le contenu des welcome books est mis à jour instantanément — ce bouton sert uniquement pour déployer des mises à jour du code.
              </p>
            </div>
            <button
              onClick={handleDeploy}
              disabled={deployState === "loading"}
              className="shrink-0 flex items-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2 text-sm text-[#1c2626] hover:bg-black/4 disabled:opacity-40 transition"
            >
              {deployState === "loading" && <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-[#1c2626]/30 border-t-[#1c2626] animate-spin" />}
              {deployState === "ok" ? "✓ Lancé !" : deployState === "error" ? "✗ Erreur" : deployState === "unconfigured" ? "⚠ Hook non configuré" : deployState === "loading" ? "Déploiement…" : "🚀 Déployer"}
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

/* ─── Login ──────────────────────────────────────────────────────────────── */
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
        setError(body?.error === "admin_not_configured" ? "Accès admin non configuré sur cet environnement." : "Mot de passe incorrect.");
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
          <label htmlFor="admin-password" className="text-sm font-medium text-[#1c2626]">Mot de passe</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-[#1c2626] placeholder:text-[#1c2626]/30 focus:outline-none focus:ring-2 focus:ring-[#1c2626]/20" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading || !password} className="w-full rounded-xl bg-[#1c2626] py-2.5 text-sm font-medium text-white transition hover:bg-[#1c2626]/85 disabled:opacity-40">
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
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
  return authenticated ? <Dashboard onLogout={() => setAuthenticated(false)} /> : <LoginForm onSuccess={() => setAuthenticated(true)} />;
}
