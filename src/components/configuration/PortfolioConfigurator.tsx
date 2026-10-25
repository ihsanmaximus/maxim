"use client";

import { useEffect, useState } from "react";
import { getProjectData, saveProjectData } from "@/lib/projects/projectStorage";

type PortfolioType = "photography" | "video" | "project" | "product" | "creative" | "other";
type LinkType = "none" | "internal" | "external";
type PortfolioItem = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  description: string;
  linkType: LinkType;
  linkUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
};
type PortfolioConfig = {
  portfolioType: PortfolioType;
  eyebrow: string;
  title: string;
  description: string;
  items: PortfolioItem[];
  desktopColumns: 2 | 3 | 4;
  mobileMode: "slider" | "list";
  imageRatio: "landscape" | "square" | "portrait";
  sectionBackground: string;
  cardBackground: string;
  titleColor: string;
  descriptionColor: string;
  accentColor: string;
  cardGap: number;
  showCategory: boolean;
  showDescription: boolean;
  autoSlide: boolean;
};
type Props = { projectId: string; primaryColor?: string; secondaryColor?: string };

const starterItems: PortfolioItem[] = [
  { id: "portfolio-1", title: "Project One", imageUrl: "", category: "Photography", description: "", linkType: "none", linkUrl: "", videoUrl: "", thumbnailUrl: "" },
  { id: "portfolio-2", title: "Project Two", imageUrl: "", category: "Project", description: "", linkType: "none", linkUrl: "", videoUrl: "", thumbnailUrl: "" },
  { id: "portfolio-3", title: "Project Three", imageUrl: "", category: "Creative", description: "", linkType: "none", linkUrl: "", videoUrl: "", thumbnailUrl: "" },
];
const inputClass = "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

function defaults(primary = "#14532D", secondary = "#A16207"): PortfolioConfig {
  return {
    portfolioType: "project", eyebrow: "SELECTED WORK", title: "Our Portfolio",
    description: "A selection of our recent work.", items: starterItems.map((item) => ({ ...item })),
    desktopColumns: 3, mobileMode: "slider", imageRatio: "landscape",
    sectionBackground: "#F8F7F0", cardBackground: "#FFFFFF", titleColor: primary,
    descriptionColor: "#475569", accentColor: secondary, cardGap: 24,
    showCategory: true, showDescription: true, autoSlide: true,
  };
}
function Field({ label, value, onChange, placeholder = "", multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; multiline?: boolean }) {
  return <label className="block min-w-0"><span className={labelClass}>{label}</span>{multiline ? <textarea className={`${inputClass} min-h-20 resize-y`} rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /> : <input className={inputClass} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}</label>;
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block min-w-0"><span className={labelClass}>{label}</span><div className="flex items-center gap-2 rounded-lg border border-slate-200 p-2"><input type="color" aria-label={label} value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" /><span className="truncate text-xs text-slate-500">{value}</span></div></label>;
}
function Accordion({ number, title, children, defaultOpen = false }: { number: string; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return <details open={defaultOpen} className="group overflow-hidden rounded-xl border border-slate-200 bg-white"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden"><span>{number} · {title}</span><span className="text-xs font-normal text-slate-400 group-open:hidden">Buka</span><span className="hidden text-xs font-normal text-slate-400 group-open:inline">Tutup</span></summary><div className="space-y-4 border-t border-slate-100 p-4">{children}</div></details>;
}
function youtubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match?.[1] ?? "";
}
function getItemImage(item: PortfolioItem, type: PortfolioType) {
  if (type === "video") return item.thumbnailUrl || (youtubeId(item.videoUrl) ? `https://img.youtube.com/vi/${youtubeId(item.videoUrl)}/hqdefault.jpg` : "") || item.imageUrl;
  return item.imageUrl || item.thumbnailUrl;
}

export default function PortfolioConfigurator({ projectId, primaryColor = "#14532D", secondaryColor = "#A16207" }: Props) {
  const [config, setConfig] = useState<PortfolioConfig>(() => defaults(primaryColor, secondaryColor));
  const [loaded, setLoaded] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [mobileSlide, setMobileSlide] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("Memuat konfigurasi...");

  useEffect(() => {
    const fallback = defaults(primaryColor, secondaryColor);
    try {
      const saved = getProjectData<Partial<PortfolioConfig> | null>(projectId, "portfolio-config", null);
      setConfig(saved ? { ...fallback, ...saved, items: Array.isArray(saved.items) ? saved.items.map((item) => ({ ...starterItems[0], ...item })) : fallback.items } : fallback);
    } catch (error) {
      console.error("Gagal memuat Portfolio Configurator:", error);
      setConfig(fallback);
    } finally { setLoaded(true); }
  }, [projectId, primaryColor, secondaryColor]);

  useEffect(() => {
    if (!loaded) return;
    try { saveProjectData(projectId, "portfolio-config", config); setSaveStatus("Tersimpan"); }
    catch (error) { console.error("Gagal menyimpan Portfolio Configurator:", error); setSaveStatus("Gagal menyimpan"); }
  }, [config, loaded, projectId]);

  useEffect(() => {
    if (previewDevice !== "mobile" || config.mobileMode !== "slider" || !config.autoSlide || config.items.length < 2) return;
    const timer = window.setInterval(() => setMobileSlide((current) => (current + 1) % config.items.length), 3000);
    return () => window.clearInterval(timer);
  }, [previewDevice, config.mobileMode, config.autoSlide, config.items.length]);
  useEffect(() => { setMobileSlide((current) => config.items.length ? current % config.items.length : 0); }, [config.items.length]);

  function update<K extends keyof PortfolioConfig>(key: K, value: PortfolioConfig[K]) { setConfig((current) => ({ ...current, [key]: value })); }
  function updateItem(id: string, key: keyof PortfolioItem, value: string) { setConfig((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, [key]: value } : item) })); }
  function addItem() {
    const id = `portfolio-${Date.now()}`;
    setConfig((current) => ({ ...current, items: [...current.items, { id, title: `Project ${current.items.length + 1}`, imageUrl: "", category: "", description: "", linkType: "none", linkUrl: "", videoUrl: "", thumbnailUrl: "" }] }));
    setEditingId(id);
  }
  function removeItem(id: string) { setConfig((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) })); if (editingId === id) setEditingId(null); }
  const isPhoto = config.portfolioType === "photography";
  const isVideo = config.portfolioType === "video";
  const previewWidth = previewDevice === "mobile" ? "max-w-[390px]" : "max-w-full";
  const columns = config.desktopColumns === 2 ? "md:grid-cols-2" : config.desktopColumns === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3";
  const ratioClass = config.imageRatio === "square" ? "aspect-square" : config.imageRatio === "portrait" ? "aspect-[3/4]" : "aspect-[16/9]";

  return <div className="space-y-6 text-slate-800">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">MAXIMUS · SECTION CONFIGURATOR</p><h2 className="mt-2 text-2xl font-bold">Portfolio Section</h2><p className="mt-1 max-w-2xl text-sm text-slate-500">Atur jenis portfolio, konten, layout, dan tujuan link.</p></div><div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs"><span className={`h-2 w-2 rounded-full ${saveStatus === "Tersimpan" ? "bg-emerald-500" : saveStatus === "Gagal menyimpan" ? "bg-red-500" : "bg-amber-400"}`} />{saveStatus}</div></header>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-4">
        <Accordion number="01" title="Konten Section" defaultOpen>
          <Field label="Label kecil" value={config.eyebrow} onChange={(v) => update("eyebrow", v)} placeholder="SELECTED WORK" />
          <Field label="Judul section" value={config.title} onChange={(v) => update("title", v)} placeholder="Our Portfolio" />
          <Field label="Deskripsi section" value={config.description} onChange={(v) => update("description", v)} multiline placeholder="Deskripsi singkat (opsional)" />
          <label className="block"><span className={labelClass}>Jenis portfolio</span><select className={inputClass} value={config.portfolioType} onChange={(e) => update("portfolioType", e.target.value as PortfolioType)}><option value="photography">Photography — full image, judul saja</option><option value="video">Video Creator — thumbnail + YouTube</option><option value="project">Project — proyek/case study</option><option value="product">Product Gallery — galeri produk</option><option value="creative">Art & Creative — karya kreatif</option><option value="other">Custom / Other</option></select></label>
          <p className="rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">Pilihan jenis menentukan informasi yang relevan pada kartu. Ini hanya konfigurasi Portfolio Section; pembuatan Full Portfolio Page dan paket upgrade berada di luar komponen ini.</p>
        </Accordion>
        <Accordion number="02" title="Daftar Portfolio">
          <div className="space-y-3">{config.items.map((item, index) => <div key={item.id} className={`rounded-xl border p-3 ${editingId === item.id ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200"}`}>
            <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">{String(index + 1).padStart(2, "0")}</span><button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEditingId(editingId === item.id ? null : item.id)}><span className="block truncate text-sm font-semibold">{item.title || `Portfolio ${index + 1}`}</span><span className="block truncate text-xs text-slate-500">{item.linkType === "none" ? "Tanpa link" : item.linkUrl || "URL belum diisi"}</span></button><button type="button" onClick={() => removeItem(item.id)} className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Hapus</button></div>
            {editingId === item.id && <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <Field label="Judul" value={item.title} onChange={(v) => updateItem(item.id, "title", v)} placeholder="Nama karya / proyek" />
              <Field label={isVideo ? "URL thumbnail (opsional)" : "URL gambar"} value={isVideo ? item.thumbnailUrl : item.imageUrl} onChange={(v) => updateItem(item.id, isVideo ? "thumbnailUrl" : "imageUrl", v)} placeholder="https://..." />
              {isVideo && <Field label="URL YouTube" value={item.videoUrl} onChange={(v) => updateItem(item.id, "videoUrl", v)} placeholder="https://www.youtube.com/watch?v=..." />}
              {!isPhoto && <Field label="Kategori" value={item.category} onChange={(v) => updateItem(item.id, "category", v)} placeholder="Contoh: Interior" />}
              {!isPhoto && <Field label="Deskripsi (opsional)" value={item.description} onChange={(v) => updateItem(item.id, "description", v)} multiline placeholder="Deskripsi singkat" />}
              <label className="block"><span className={labelClass}>Tujuan klik</span><select className={inputClass} value={item.linkType} onChange={(e) => updateItem(item.id, "linkType", e.target.value)}><option value="none">Tidak ada link</option><option value="internal">Halaman internal</option><option value="external">Link eksternal</option></select></label>
              {item.linkType !== "none" && <Field label={item.linkType === "internal" ? "Path halaman internal" : "URL eksternal"} value={item.linkUrl} onChange={(v) => updateItem(item.id, "linkUrl", v)} placeholder={item.linkType === "internal" ? "/portfolio/nama-proyek" : "https://..."} />}
            </div>}
          </div>)}</div>
          <button type="button" onClick={addItem} className="w-full rounded-xl border border-dashed border-emerald-400 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">+ Tambah Portfolio</button>
        </Accordion>
        <Accordion number="03" title="Layout Desktop"><p className="text-xs text-slate-500">Desktop selalu menggunakan grid dan tidak memakai state slider mobile.</p><div className="grid grid-cols-3 gap-2">{([2, 3, 4] as const).map((n) => <button key={n} type="button" onClick={() => update("desktopColumns", n)} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${config.desktopColumns === n ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200"}`}>{n} kolom</button>)}</div></Accordion>
        <Accordion number="04" title="Layout Mobile"><div className="grid grid-cols-2 gap-2">{([{ value: "slider", label: "Slider" }, { value: "list", label: "List" }] as const).map((option) => <button key={option.value} type="button" onClick={() => update("mobileMode", option.value)} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${config.mobileMode === option.value ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200"}`}>{option.label}</button>)}</div>{config.mobileMode === "slider" && <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm"><span>Auto-slide setiap 3 detik</span><input type="checkbox" checked={config.autoSlide} onChange={(e) => update("autoSlide", e.target.checked)} className="h-4 w-4 accent-emerald-700" /></label>}</Accordion>
        <Accordion number="05" title="Tampilan Kartu"><label className="block"><span className={labelClass}>Rasio gambar</span><select className={inputClass} value={config.imageRatio} onChange={(e) => update("imageRatio", e.target.value as PortfolioConfig["imageRatio"])}><option value="landscape">Landscape (16:9)</option><option value="square">Square (1:1)</option><option value="portrait">Portrait (3:4)</option></select></label><label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm"><span>Tampilkan kategori</span><input type="checkbox" checked={config.showCategory} onChange={(e) => update("showCategory", e.target.checked)} className="h-4 w-4 accent-emerald-700" /></label><label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm"><span>Tampilkan deskripsi</span><input type="checkbox" checked={config.showDescription} onChange={(e) => update("showDescription", e.target.checked)} className="h-4 w-4 accent-emerald-700" /></label><Field label="Jarak kartu (px)" value={String(config.cardGap)} onChange={(v) => update("cardGap", Math.max(0, Number(v) || 0))} /><div className="grid grid-cols-2 gap-3"><ColorField label="Latar section" value={config.sectionBackground} onChange={(v) => update("sectionBackground", v)} /><ColorField label="Latar kartu" value={config.cardBackground} onChange={(v) => update("cardBackground", v)} /><ColorField label="Warna judul" value={config.titleColor} onChange={(v) => update("titleColor", v)} /><ColorField label="Warna deskripsi" value={config.descriptionColor} onChange={(v) => update("descriptionColor", v)} /><ColorField label="Warna aksen" value={config.accentColor} onChange={(v) => update("accentColor", v)} /></div></Accordion>
      </div>
      <div className="min-w-0 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">Live Preview</h3><p className="mt-1 text-xs text-slate-500">Perubahan ditampilkan langsung.</p></div><div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">{(["desktop", "mobile"] as const).map((device) => <button key={device} type="button" onClick={() => setPreviewDevice(device)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${previewDevice === device ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{device === "desktop" ? "Desktop" : "Mobile"}</button>)}</div></div>
        <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-5"><div className={`mx-auto overflow-hidden rounded-xl shadow-sm ${previewWidth}`} style={{ backgroundColor: config.sectionBackground }}><section className="px-5 py-12 sm:px-8" style={{ backgroundColor: config.sectionBackground }}><div className="mx-auto max-w-5xl">
          {config.eyebrow && <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.18em]" style={{ color: config.accentColor }}>{config.eyebrow}</p>}<h2 className="text-center text-2xl font-bold leading-tight sm:text-4xl" style={{ color: config.titleColor }}>{config.title || "Portfolio"}</h2>{config.description && <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 sm:text-base" style={{ color: config.descriptionColor }}>{config.description}</p>}
          <div className="mt-8">{previewDevice === "desktop" ? <div className={`grid ${columns}`} style={{ gap: config.cardGap }}>{config.items.map((item, index) => renderCard(item, index))}</div> : config.mobileMode === "list" ? <div className="grid grid-cols-1" style={{ gap: config.cardGap }}>{config.items.map((item, index) => renderCard(item, index))}</div> : <><div className="overflow-hidden"><div className="flex touch-pan-y transition-transform duration-500 ease-in-out" style={{ width: `${Math.max(config.items.length, 1) * 100}%`, transform: `translateX(-${mobileSlide * (100 / Math.max(config.items.length, 1))}%)` }} onTouchStart={(e) => { e.currentTarget.dataset.startX = String(e.touches[0].clientX); }} onTouchEnd={(e) => { const start = Number(e.currentTarget.dataset.startX); const delta = e.changedTouches[0].clientX - start; if (Math.abs(delta) < 45 || config.items.length < 2) return; setMobileSlide((current) => delta < 0 ? (current + 1) % config.items.length : (current - 1 + config.items.length) % config.items.length); }}>{config.items.map((item, index) => <div key={item.id} className="shrink-0" style={{ width: `${100 / Math.max(config.items.length, 1)}%`, paddingRight: 1 }}>{renderCard(item, index, true)}</div>)}</div></div>{config.items.length > 1 && <div className="mt-4 flex items-center justify-center gap-2">{config.items.map((item, index) => <button key={item.id} type="button" aria-label={`Buka slide ${index + 1}`} onClick={() => setMobileSlide(index)} className={`h-2 rounded-full transition-all ${mobileSlide === index ? "w-6" : "w-2 bg-slate-300"}`} style={mobileSlide === index ? { backgroundColor: config.accentColor } : undefined} />)}</div>}</>}</div>
        </div></section></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><h4 className="text-sm font-semibold">Ringkasan konfigurasi</h4><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600"><li>• Jenis: {config.portfolioType}</li><li>• Jumlah item: {config.items.length}</li><li>• Desktop: {config.desktopColumns} kolom</li><li>• Mobile: {config.mobileMode}</li><li>• Link: internal, eksternal, atau tanpa link per item</li></ul></div>
      </div>
    </div>
  </div>;

  function renderCard(item: PortfolioItem, index: number, mobile = false) {
    const image = getItemImage(item, config.portfolioType);
    const card = <article className="h-full min-w-0 overflow-hidden rounded-xl" style={{ backgroundColor: config.cardBackground, color: config.descriptionColor }}>
      <div className={`relative w-full overflow-hidden ${ratioClass}`} style={{ backgroundColor: `${config.accentColor}12` }}>{image ? <img src={image} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs" style={{ color: config.accentColor }}>{isVideo ? "Thumbnail video" : `Gambar portfolio ${index + 1}`}</div>}{isVideo && <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 text-xl text-white">▶</span></span>}{isPhoto && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 pb-3 pt-10"><h3 className="text-base font-bold text-white">{item.title || `Karya ${index + 1}`}</h3></div>}</div>
      {!isPhoto && <div className="p-4">{item.category && config.showCategory && <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: config.accentColor }}>{item.category}</p>}<h3 className="text-base font-bold" style={{ color: config.titleColor }}>{item.title || `Portfolio ${index + 1}`}</h3>{item.description && config.showDescription && <p className="mt-2 text-sm leading-6">{item.description}</p>}{isVideo && item.videoUrl && <p className="mt-2 truncate text-xs" style={{ color: config.accentColor }}>YouTube video</p>}</div>}
    </article>;
    const shouldLink = item.linkType !== "none" && item.linkUrl.trim();
    return <div key={item.id} className={mobile ? "min-w-0" : "min-w-0"}>{shouldLink ? <a href={item.linkUrl} target={item.linkType === "external" ? "_blank" : undefined} rel={item.linkType === "external" ? "noopener noreferrer" : undefined} className="block h-full rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">{card}</a> : card}</div>;
  }
}
