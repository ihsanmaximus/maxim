"use client";

import { useEffect, useState } from "react";
import { getProjectData, saveProjectData } from "@/lib/projects/projectStorage";

type SocialItem = { id: string; name: string; icon: string; url: string; enabled: boolean };
type ContactItem = { id: string; label: string; icon: string; value: string; url: string; enabled: boolean };
type ContactConfig = {
  version: 1;
  enabled: boolean;
  layout: "three-column" | "two-column" | "minimal";
  style: "display" | "editorial" | "minimal";
  backgroundStyle: "soft" | "solid" | "accent";
  accentColor: string;
  eyebrow: string;
  title: string;
  description: string;
  socialTitle: string;
  socialDescription: string;
  contactTitle: string;
  contactDescription: string;
  locationTitle: string;
  address: string;
  showMap: boolean;
  mapUrl: string;
  mapEmbedUrl: string;
  showHours: boolean;
  hours: string;
  socials: SocialItem[];
  directContacts: ContactItem[];
};

type Props = {
  projectId: string;
  primaryColor?: string;
  secondaryColor?: string;
  onBack?: () => void;
};

const makeDefaults = (primaryColor: string, secondaryColor: string): ContactConfig => ({
  version: 1,
  enabled: true,
  layout: "three-column",
  style: "editorial",
  backgroundStyle: "soft",
  // Website preview follows the palette selected in Project Setup.
  accentColor: primaryColor || secondaryColor || "#2563EB",
  eyebrow: "GET IN TOUCH",
  title: "Let’s Connect",
  description: "Kami siap membantu menjawab pertanyaan atau mendiskusikan kebutuhan Anda.",
  socialTitle: "Follow Us",
  socialDescription: "Ikuti kami di media sosial untuk mendapatkan kabar terbaru.",
  contactTitle: "Hubungi Kami",
  contactDescription: "Pilih cara yang paling nyaman untuk menghubungi kami.",
  locationTitle: "Lokasi Kami",
  address: "Jl. Melati No. 12, Bogor, Jawa Barat",
  showMap: true,
  mapUrl: "",
  mapEmbedUrl: "",
  showHours: true,
  hours: "Senin–Jumat · 08.00–17.00",
  socials: [
    { id: "instagram", name: "Instagram", icon: "◎", url: "", enabled: true },
    { id: "facebook", name: "Facebook", icon: "f", url: "", enabled: true },
    { id: "youtube", name: "YouTube", icon: "▶", url: "", enabled: false },
  ],
  directContacts: [
    { id: "whatsapp", label: "WhatsApp", icon: "◉", value: "", url: "", enabled: true },
    { id: "phone", label: "Telepon", icon: "☎", value: "", url: "", enabled: false },
    { id: "email", label: "Email", icon: "✉", value: "", url: "", enabled: true },
  ],
});

const input = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";
const idFor = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700"><span className={label}>{title}</span>{children}</label>;
}
function SettingsGroup({ number, title, description, children, defaultOpen = false }: {
  number: string; title: string; description: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 border-l-4 border-blue-600 bg-slate-50 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span><span className="block text-sm font-semibold text-slate-900">{number} · {title}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></span>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500 group-open:hidden">Open +</span>
        <span className="hidden shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 group-open:inline">Close −</span>
      </summary>
      <div className="space-y-4 border-t border-slate-100 p-4 sm:p-5">{children}</div>
    </details>
  );
}
function Toggle({ title, checked, onChange }: { title: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700"><span>{title}</span><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-4 w-4 accent-blue-600" /></label>;
}

export default function ContactConfigurator({
  projectId,
  primaryColor = "#2563EB",
  secondaryColor = "#172033",
  onBack,
}: Props) {
  const [config, setConfig] = useState<ContactConfig>(() => makeDefaults(primaryColor, secondaryColor));
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Memuat konfigurasi...");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const fallback = makeDefaults(primaryColor, secondaryColor);
    try {
      const saved = getProjectData<Partial<ContactConfig> | null>(projectId, "contact-config", null);
      setConfig(saved ? {
        ...fallback,
        ...saved,
        socials: Array.isArray(saved.socials) ? saved.socials : fallback.socials,
        directContacts: Array.isArray(saved.directContacts) ? saved.directContacts : fallback.directContacts,
        // The website preview always follows the palette selected for this project.
        accentColor: primaryColor || secondaryColor || fallback.accentColor,
      } : fallback);
    } catch (error) {
      console.error("Failed to load Contact configuration:", error);
      setConfig(fallback);
      setSaveStatus("Gagal memuat");
    } finally {
      setLoaded(true);
    }
  }, [projectId, primaryColor, secondaryColor]);

  useEffect(() => {
    if (!loaded) return;
    try {
      saveProjectData(projectId, "contact-config", config);
      setSaveStatus("Tersimpan");
    } catch (error) {
      console.error("Failed to save Contact configuration:", error);
      setSaveStatus("Gagal menyimpan");
    }
  }, [config, loaded, projectId]);

  function update<K extends keyof ContactConfig>(key: K, value: ContactConfig[K]) {
    setConfig(current => ({ ...current, [key]: value }));
  }
  function updateSocial(id: string, patch: Partial<SocialItem>) {
    setConfig(current => ({ ...current, socials: current.socials.map(item => item.id === id ? { ...item, ...patch } : item) }));
  }
  function updateContact(id: string, patch: Partial<ContactItem>) {
    setConfig(current => ({ ...current, directContacts: current.directContacts.map(item => item.id === id ? { ...item, ...patch } : item) }));
  }

  const socials = config.socials.filter(item => item.enabled);
  const contacts = config.directContacts.filter(item => item.enabled);
  const previewBg = config.backgroundStyle === "accent"
    ? "bg-slate-900 text-white"
    : config.backgroundStyle === "solid"
      ? "bg-white text-slate-900"
      : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900";

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-blue-700">Maximus · Section Configurator</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Contact Section</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Atur media sosial, kontak langsung, alamat, dan peta untuk pengunjung website.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm ${saveStatus === "Tersimpan" ? "border-slate-200 text-slate-700" : saveStatus.includes("Gagal") ? "border-red-200 text-red-700" : "border-blue-200 text-blue-700"}`}>
            <span className={`h-2 w-2 rounded-full ${saveStatus === "Tersimpan" ? "bg-emerald-500" : saveStatus.includes("Gagal") ? "bg-red-500" : "bg-blue-500"}`} />{saveStatus}
          </span>
          <Toggle title="Tampilkan Section" checked={config.enabled} onChange={value => update("enabled", value)} />
          {onBack && <button onClick={onBack} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">← Kembali</button>}
        </div>
      </header>

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)]">
        <div className="space-y-3">
          <SettingsGroup number="01" title="Layout & Tampilan" description="Pilih komposisi, gaya judul, dan background wrapper." defaultOpen>
            <div>
              <p className={label}>Layout Section</p>
              <div className="grid grid-cols-3 gap-2">{([["three-column","3 Kolom"],["two-column","2 Kolom"],["minimal","Minimal"]] as const).map(([v,t]) => <button key={v} type="button" onClick={() => update("layout",v)} className={`rounded-xl border p-3 text-sm font-semibold ${config.layout===v?"border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600":"border-slate-200 bg-white text-slate-600"}`}><span className="mb-2 flex h-9 gap-1">{Array.from({length:v==="three-column"?3:v==="two-column"?2:1},(_,i)=><span key={i} className="flex-1 rounded bg-slate-200"/>)}</span>{t}</button>)}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field title="Gaya judul"><select className={input} value={config.style} onChange={e=>update("style",e.target.value as ContactConfig["style"])}><option value="display">Display — besar & ekspresif</option><option value="editorial">Editorial — elegan</option><option value="minimal">Minimal — sederhana</option></select></Field>
              <Field title="Background wrapper"><select className={input} value={config.backgroundStyle} onChange={e=>update("backgroundStyle",e.target.value as ContactConfig["backgroundStyle"])}><option value="soft">Soft / lembut</option><option value="solid">Solid / bersih</option><option value="accent">Accent / navy</option></select></Field>
            </div>
          </SettingsGroup>

          <SettingsGroup number="02" title="Konten" description="Judul, eyebrow, dan deskripsi pengantar.">
            <div className="space-y-4"><Field title="Eyebrow / label kecil"><input className={input} value={config.eyebrow} onChange={e=>update("eyebrow",e.target.value)}/></Field><Field title="Judul"><input className={input} value={config.title} onChange={e=>update("title",e.target.value)}/></Field><Field title="Deskripsi singkat"><textarea rows={3} className={input} value={config.description} onChange={e=>update("description",e.target.value)}/></Field></div>
          </SettingsGroup>

          <SettingsGroup number="03" title="Social Media" description="Tambahkan ikon dan URL media sosial secara terpisah.">
            <div className="space-y-3">{config.socials.map(item=><div key={item.id} className="rounded-xl border border-slate-200 p-3">
              <div className="mb-3 flex items-center justify-between"><Toggle title="Tampilkan ikon" checked={item.enabled} onChange={value=>updateSocial(item.id,{enabled:value})}/><button type="button" onClick={()=>update("socials",config.socials.filter(x=>x.id!==item.id))} className="ml-3 text-xs font-semibold text-rose-600">Hapus</button></div>
              <div className="grid gap-3 sm:grid-cols-2"><Field title="Nama platform"><input className={input} value={item.name} onChange={e=>updateSocial(item.id,{name:e.target.value})} placeholder="Instagram"/></Field><Field title="URL / tautan"><input className={input} value={item.url} onChange={e=>updateSocial(item.id,{url:e.target.value})} placeholder="https://instagram.com/akun" inputMode="url"/></Field><Field title="Ikon"><input className={input} value={item.icon} onChange={e=>updateSocial(item.id,{icon:e.target.value})} placeholder="◎" maxLength={8}/></Field></div>
            </div>)}</div>
            <button type="button" onClick={()=>update("socials",[...config.socials,{id:idFor(),name:"Social Media",icon:"↗",url:"",enabled:true}])} className="rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">＋ Tambah Social Media</button>
          </SettingsGroup>

          <SettingsGroup number="04" title="Kontak Langsung" description="WhatsApp, telepon, email, atau kanal kontak lainnya.">
            <div className="space-y-3">{config.directContacts.map(item=><div key={item.id} className="rounded-xl border border-slate-200 p-3">
              <div className="mb-3 flex items-center justify-between"><Toggle title="Tampilkan kontak" checked={item.enabled} onChange={value=>updateContact(item.id,{enabled:value})}/><button type="button" onClick={()=>update("directContacts",config.directContacts.filter(x=>x.id!==item.id))} className="ml-3 text-xs font-semibold text-rose-600">Hapus</button></div>
              <div className="grid gap-3 sm:grid-cols-2"><Field title="Label tombol"><input className={input} value={item.label} onChange={e=>updateContact(item.id,{label:e.target.value})}/></Field><Field title="Ikon"><input className={input} value={item.icon} onChange={e=>updateContact(item.id,{icon:e.target.value})} maxLength={8}/></Field><Field title="Nomor / alamat"><input className={input} value={item.value} onChange={e=>updateContact(item.id,{value:e.target.value})} placeholder="+62... atau halo@bisnis.com"/></Field><Field title="URL aksi"><input className={input} value={item.url} onChange={e=>updateContact(item.id,{url:e.target.value})} placeholder="https://wa.me/... · mailto:... · tel:..."/></Field></div>
            </div>)}</div>
            <button type="button" onClick={()=>update("directContacts",[...config.directContacts,{id:idFor(),label:"Kontak Baru",icon:"↗",value:"",url:"",enabled:true}])} className="rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">＋ Tambah Kontak</button>
          </SettingsGroup>

          <SettingsGroup number="05" title="Alamat & Peta" description="Alamat, Google Maps, dan jam operasional.">
            <div className="space-y-4"><Field title="Judul lokasi"><input className={input} value={config.locationTitle} onChange={e=>update("locationTitle",e.target.value)}/></Field><Field title="Alamat"><textarea rows={3} className={input} value={config.address} onChange={e=>update("address",e.target.value)}/></Field>
              <Toggle title="Tampilkan peta" checked={config.showMap} onChange={value=>update("showMap",value)}/><Field title="URL Google Maps"><input className={input} value={config.mapUrl} onChange={e=>update("mapUrl",e.target.value)} placeholder="https://maps.google.com/..." inputMode="url"/></Field><Field title="URL embed peta (opsional)"><input className={input} value={config.mapEmbedUrl} onChange={e=>update("mapEmbedUrl",e.target.value)} placeholder="https://www.google.com/maps/embed?..." inputMode="url"/></Field><Toggle title="Tampilkan jam operasional" checked={config.showHours} onChange={value=>update("showHours",value)}/>{config.showHours&&<Field title="Jam operasional"><input className={input} value={config.hours} onChange={e=>update("hours",e.target.value)}/></Field>}
            </div>
          </SettingsGroup>
        </div>

        <aside className="min-w-0 max-w-full xl:sticky xl:top-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"><div><p className="text-sm font-bold">Live Preview</p><p className="text-xs text-slate-500">Preview mengikuti palette project untuk aksen website.</p></div><div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1"><button onClick={()=>setPreviewDevice("desktop")} className={`rounded-md px-3 py-1.5 text-xs ${previewDevice==="desktop"?"bg-blue-600 text-white":"text-slate-600"}`}>Desktop</button><button onClick={()=>setPreviewDevice("mobile")} className={`rounded-md px-3 py-1.5 text-xs ${previewDevice==="mobile"?"bg-blue-600 text-white":"text-slate-600"}`}>Mobile</button></div></div>
            <div className="w-full min-w-0 max-w-full overflow-x-auto">
              <div className={`${previewDevice === "desktop" ? "w-full min-w-0 p-6" : "mx-auto w-full max-w-sm p-5"} ${previewBg}`}>
              <p className="mb-3 text-[10px] font-bold tracking-[.25em]" style={{color:config.backgroundStyle==="accent"?"#BFDBFE":config.accentColor}}>{config.eyebrow}</p>
              <h2 className={`max-w-md leading-[.98] tracking-tight ${config.style==="display"?"text-5xl font-black sm:text-6xl":config.style==="editorial"?"font-serif text-4xl sm:text-5xl":"text-3xl font-semibold"}`}>{config.title}</h2>
              <p className={`mt-4 max-w-md text-sm leading-6 ${config.backgroundStyle==="accent"?"text-slate-200":"text-slate-600"}`}>{config.description}</p>
              <div className={`mt-6 grid gap-5 border-t pt-5 ${previewDevice === "desktop" ? (config.layout === "three-column" ? "grid-cols-3" : config.layout === "two-column" ? "grid-cols-2" : "grid-cols-1") : "grid-cols-1"} ${config.backgroundStyle==="accent"?"border-white/20":"border-slate-200"}`}>
                <div><h3 className="font-bold">{config.socialTitle}</h3><p className="mt-1 text-xs leading-5 opacity-70">{config.socialDescription}</p><div className="mt-4 flex flex-wrap gap-2">{socials.map(item=><a key={item.id} href={item.url||undefined} target={item.url?"_blank":undefined} rel={item.url?"noreferrer":undefined} title={item.name} className="flex h-10 w-10 items-center justify-center rounded-full border text-lg font-bold" style={{borderColor:config.accentColor,color:config.backgroundStyle==="accent"?"white":config.accentColor}}>{item.icon||"↗"}</a>)}</div></div>
                {config.layout!=="minimal"&&<div><h3 className="font-bold">{config.contactTitle}</h3><p className="mt-1 text-xs leading-5 opacity-70">{config.contactDescription}</p><div className="mt-3 space-y-2">{contacts.map(item=><a key={item.id} href={item.url||undefined} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800"><span style={{color:config.accentColor}}>{item.icon}</span>{item.label}</a>)}</div></div>}
                {config.layout==="three-column"&&<div><h3 className="font-bold">{config.locationTitle}</h3><p className="mt-2 whitespace-pre-line text-xs leading-5 opacity-80">{config.address}</p>{config.showHours&&<p className="mt-2 text-xs opacity-70">{config.hours}</p>}{config.showMap&&<a href={config.mapUrl||undefined} target={config.mapUrl?"_blank":undefined} rel={config.mapUrl?"noreferrer":undefined} className="mt-3 flex min-h-24 items-center justify-center rounded-xl border border-dashed text-xs font-semibold" style={{borderColor:config.accentColor,color:config.backgroundStyle==="accent"?"white":config.accentColor}}>📍 Thumbnail peta · Lihat Peta ↗</a>}</div>}
              </div>
              </div>
            </div>
            <div className="border-t bg-slate-50 px-4 py-3 text-xs text-slate-500">Penyimpanan: <code>contact-config</code> · Autosave aktif. Warna aksen preview memakai palette proyek.</div>
          </div>
        </aside>
      </div>
    </div>
  </main>;
}
