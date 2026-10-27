"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getActiveProjectId,
  getProject,
  getProjects,
  getProjectData,
  type StoredProject,
} from "@/lib/projects/projectStorage";

type ExportFormat = "html" | "react" | "next";
type PageScope = "single" | "multi";
type ImageOptimization = "low" | "medium" | "high";

const DEFAULT_SECTIONS = [
  "navbar", "hero", "services", "portfolio", "about",
  "testimonials", "pricing", "faq", "contact", "footer",
];

function slugify(value: string) {
  return value.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "my-website";
}

type DataRecord = Record<string, unknown>;

function asRecord(value: unknown): DataRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as DataRecord
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asRecords(value: unknown): DataRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is DataRecord => item !== null && typeof item === "object" && !Array.isArray(item))
    : [];
}

function getSectionLabel(id: string) {
  const labels: Record<string, string> = {
    navbar: "Navbar", hero: "Hero", services: "Services", portfolio: "Portfolio",
    about: "About", "about-me": "About", "about-us": "About",
    testimonials: "Testimonials", pricing: "Pricing", faq: "FAQ",
    contact: "Contact", footer: "Footer",
  };
  return labels[id] || id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getProjectStructure(projectId: string): { pages: unknown[]; sections: DataRecord[] } {
  const raw = getProjectData<unknown>(projectId, "website-structure", null)
    ?? getProjectData<unknown>(projectId, "website-structure-config", null)
    ?? getProjectData<unknown>(projectId, "structure-config", null);

  if (!raw) {
    return { pages: [], sections: DEFAULT_SECTIONS.map((id) => ({ id, enabled: true })) };
  }

  const rawRecord = asRecord(raw);
  const pages: unknown[] = Array.isArray(raw) ? raw : Array.isArray(rawRecord.pages) ? rawRecord.pages : [];
  if (pages.length) {
    const allSections = pages.flatMap((page) => asRecords(asRecord(page).sections));
    return {
      pages,
      sections: allSections.length ? allSections : DEFAULT_SECTIONS.map((id) => ({ id, enabled: true })),
    };
  }

  const sections = asRecords(rawRecord.sections ?? rawRecord.items ?? rawRecord.structure);
  return {
    pages: [],
    sections: sections.length ? sections : DEFAULT_SECTIONS.map((id) => ({ id, enabled: true })),
  };
}

function getEnabledSections(projectId: string): string[] {
  const structure = getProjectStructure(projectId);
  const seen = new Set<string>();
  return structure.sections
    .filter((item) => {
      const id = String(item.id ?? item.key ?? item.type ?? "")
        .replace(/^section:/, "")
        .toLowerCase();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return item.enabled !== false && item.active !== false;
    })
    .map((item) => String(item.id ?? item.key ?? item.type ?? "")
      .replace(/^section:/, "")
      .toLowerCase());
}

function readTheme(projectId: string, project: StoredProject | null) {
  const theme = asRecord(getProjectData<unknown>(projectId, "theme-config", {}));
  const projectRecord = asRecord(project);
  return {
    primary: asString(theme.primaryColor) ?? asString(theme.primary) ?? asString(projectRecord.primaryColor) ?? "#087f5b",
    secondary: asString(theme.secondaryColor) ?? asString(theme.secondary) ?? asString(projectRecord.secondaryColor) ?? "#12304a",
  };
}

export default function ExportPage() {
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [format, setFormat] = useState<ExportFormat>("html");
  const [scope, setScope] = useState<PageScope>("single");
  const [folderName, setFolderName] = useState<string | null>(null);
  const [htmlTitle, setHtmlTitle] = useState<string | null>(null);
  const [faviconName, setFaviconName] = useState("");
  const [optimization, setOptimization] = useState<ImageOptimization>("medium");
  const [minify, setMinify] = useState(true);
  const [readme, setReadme] = useState(true);
  const [notice, setNotice] = useState("");

  const activeId = mounted ? getActiveProjectId() : null;
  const activeProject = mounted && activeId ? getProject(activeId) : null;
  const projectList = mounted ? getProjects() : [];
  const projectId = activeProject?.id || activeId || "";
  const activeProjectRecord = activeProject as (StoredProject & { name?: string; projectName?: string }) | null;
  const projectName = activeProjectRecord
    ? activeProjectRecord.name || activeProjectRecord.projectName || "Untitled Project"
    : "Belum ada proyek aktif";
  const resolvedFolderName = folderName ?? slugify(projectName);
  const resolvedHtmlTitle = htmlTitle ?? (projectName === "Belum ada proyek aktif" ? "" : projectName);

  const sections = useMemo(
    () => projectId ? getEnabledSections(projectId) : [],
    // refreshKey intentionally refreshes after a project change.
    [projectId, refreshKey],
  );

  const theme = projectId ? readTheme(projectId, activeProject) : { primary: "#087f5b", secondary: "#12304a" };

  function handleRefresh() {
    setNotice("");
    setFolderName(null);
    setHtmlTitle(null);
    setRefreshKey((value) => value + 1);
  }

  function handleExportPlaceholder() {
    if (!activeProject || !projectId) {
      setNotice("Pilih atau buka proyek terlebih dahulu, lalu jadikan proyek itu sebagai proyek aktif.");
      return;
    }
    setNotice(
      "Konfigurasi tersimpan untuk sesi ini. Mesin pembuat ZIP belum dihubungkan pada tahap UI ini; berikutnya kita pasang generator HTML/CSS/JS dan pengunduhan ZIP."
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Maximus / Website Builder</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Export Website</h1>
            <p className="mt-2 text-sm text-slate-600">Siapkan format dan pengaturan sebelum mengunduh website Anda.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleRefresh} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100">
              Muat Ulang Proyek
            </button>
            <div className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white">
              Proyek aktif: <strong className="ml-1">{projectName}</strong>
            </div>
          </div>
        </div>

        {!activeProject && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Belum ada proyek aktif.</strong> Buat proyek melalui Project Setup, atau buka proyek yang sudah ada. Terdeteksi {projectList.length} proyek tersimpan di browser.
          </div>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <StepHeading number="1" title="Pilih Format Export" subtitle="Pilih format sesuai kebutuhan Anda." />
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <FormatCard selected={format === "html"} onClick={() => setFormat("html")} icon="▤" title="HTML + CSS + JS" description="Website statis siap upload, ringan, tanpa instalasi." points={["File HTML, CSS, JavaScript", "Cocok untuk website satu halaman", "Tidak perlu build tools"]} />
                <FormatCard selected={format === "react"} onClick={() => setFormat("react")} icon="⚛" title="React + Vite" description="Source code React untuk pengembangan lanjutan." points={["Project React + Vite", "Komponen terstruktur", "Perlu instalasi npm"]} />
                <FormatCard selected={format === "next"} onClick={() => setFormat("next")} icon="N" title="Next.js" description="Struktur Next.js untuk kebutuhan lebih kompleks." points={["Project Next.js", "Cocok untuk banyak halaman", "Perlu instalasi npm"]} />
              </div>
              {format !== "html" && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Format {format === "react" ? "React + Vite" : "Next.js"} direncanakan untuk tahap berikutnya. MVP pertama difokuskan pada HTML + CSS + JS.</p>}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <StepHeading number="2" title="Pilih Halaman yang Diekspor" subtitle="Tentukan cakupan halaman yang disertakan dalam export." />
              <div className="mt-5 space-y-3">
                <RadioCard selected={scope === "single"} onClick={() => setScope("single")} title="Satu Halaman (Single Page)" description="Semua section aktif disusun dalam satu halaman website." />
                <RadioCard selected={scope === "multi"} onClick={() => setScope("multi")} title="Multi halaman (Jika tersedia)" description="Menyertakan halaman tambahan sesuai struktur proyek." />
              </div>
              {scope === "multi" && <p className="mt-3 text-xs text-slate-500">Pilihan ini disiapkan di UI. Dukungan ekspor multi-halaman akan mengikuti struktur halaman yang tersedia di proyek.</p>}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <StepHeading number="3" title="Pengaturan Export" subtitle="Sesuaikan nama dan optimasi website hasil export." />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Nama folder
                  <input value={resolvedFolderName} onChange={(e) => setFolderName(slugify(e.target.value))} placeholder="nama-website" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
                  <span className="mt-1 block text-xs font-normal text-slate-500">Huruf kecil, angka, dan tanda strip.</span>
                </label>
                <label className="block text-sm font-semibold">
                  Judul halaman (HTML title)
                  <input value={resolvedHtmlTitle} onChange={(e) => setHtmlTitle(e.target.value)} placeholder="Nama Website" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
                  <span className="mt-1 block text-xs font-normal text-slate-500">Ditampilkan pada tab browser.</span>
                </label>
                <label className="block text-sm font-semibold sm:col-span-2">
                  Favicon <span className="font-normal text-slate-400">(opsional)</span>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <input id="export-favicon" type="file" accept="image/png,image/x-icon,image/svg+xml,image/jpeg" onChange={(e) => setFaviconName(e.target.files?.[0]?.name || "")} className="block w-full max-w-md text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-semibold" />
                    {faviconName && <span className="text-xs text-emerald-700">Dipilih: {faviconName}</span>}
                  </div>
                  <span className="mt-1 block text-xs font-normal text-slate-500">Saran: PNG/ICO persegi 32 × 32 px. Pada tahap ini nama file ditampilkan; penyertaan file akan dihubungkan pada generator ZIP.</span>
                </label>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <label className="block text-sm font-semibold">
                  Optimasi gambar
                  <select value={optimization} onChange={(e) => setOptimization(e.target.value as ImageOptimization)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal">
                    <option value="low">Ringan (kompresi tinggi)</option>
                    <option value="medium">Sedang (Recommended)</option>
                    <option value="high">Kualitas tinggi</option>
                  </select>
                  <span className="mt-1 block text-xs font-normal text-slate-500">Pengaturan untuk pipeline optimasi berikutnya.</span>
                </label>
                <Toggle label="Minify file" description="Perkecil ukuran HTML, CSS, dan JS." checked={minify} onChange={setMinify} />
                <Toggle label="Include README" description="Sertakan panduan penggunaan." checked={readme} onChange={setReadme} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <StepHeading number="4" title="Section yang Disertakan" subtitle="Hanya section aktif dalam Website Structure yang akan diekspor." />
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {sections.length ? sections.map((id: string) => (
                  <div key={id} className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-xs font-bold text-white">✓</span>
                    <span className="font-medium">{getSectionLabel(id)}</span>
                  </div>
                )) : <p className="text-sm text-slate-500">Section belum ditemukan. Periksa Website Structure pada proyek aktif.</p>}
              </div>
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Preview Hasil Export</h2>
                  <p className="mt-1 text-sm text-slate-500">Pratinjau ringkas dari tema proyek.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Konsep</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 py-2">
                  <i className="h-2.5 w-2.5 rounded-full bg-red-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 truncate text-[10px] text-slate-500">{resolvedFolderName || "nama-website"}/index.html</span>
                </div>
                <div className="p-4 sm:p-6" style={{ background: "#fff", color: theme.secondary }}>
                  <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: `${theme.secondary}20` }}>
                    <span className="font-bold">{projectName}</span>
                    <span className="text-[10px]">Home　 Services　 Contact</span>
                  </div>
                  <div className="grid gap-4 py-7 sm:grid-cols-[1.1fr_.9fr] sm:items-center">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.primary }}>Website Preview</p>
                      <h3 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">{resolvedHtmlTitle || projectName}</h3>
                      <p className="mt-2 text-xs leading-5 text-slate-500">Konten dan tampilan final akan mengikuti konfigurasi section proyek saat generator export terhubung.</p>
                      <span className="mt-4 inline-block rounded-lg px-3 py-2 text-[10px] font-bold text-white" style={{ background: theme.primary }}>Hubungi Kami</span>
                    </div>
                    <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs text-slate-400">Area gambar Hero<br />mengikuti Image Library</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Services", "Portfolio", "Contact"].map((item) => <div key={item} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center text-[10px] font-semibold">{item}</div>)}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800">
                <span aria-hidden="true">ⓘ</span>
                <p>Ini pratinjau ringkas halaman konfigurasi, bukan render final website. Hasil final perlu diverifikasi setelah ZIP generator dipasang.</p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold">Ringkasan Export</h2>
              <p className="mt-1 text-sm text-slate-500">Informasi dari konfigurasi saat ini.</p>
              <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
                <SummaryRow label="Proyek" value={projectName} />
                <SummaryRow label="Total section aktif" value={`${sections.length} section`} />
                <SummaryRow label="Format export" value={format === "html" ? "HTML + CSS + JS" : format === "react" ? "React + Vite" : "Next.js"} />
                <SummaryRow label="Tipe halaman" value={scope === "single" ? "Single Page" : "Multi Page"} />
                <SummaryRow label="Optimasi gambar" value={optimization === "medium" ? "Sedang (Recommended)" : optimization === "low" ? "Ringan" : "Kualitas tinggi"} />
                <SummaryRow label="Minify file" value={minify ? "Aktif" : "Nonaktif"} />
                <SummaryRow label="README" value={readme ? "Disertakan" : "Tidak disertakan"} />
              </dl>
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-5 text-blue-900">
                <strong className="block text-sm">Catatan Export</strong>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Section nonaktif seharusnya tidak masuk ke output.</li>
                  <li>Gambar dari Image Library harus disalin ke folder assets.</li>
                  <li>Website hasil ekspor harus dapat dibuka tanpa Maximus.</li>
                  <li>Formulir dan fitur dinamis mungkin memerlukan layanan tambahan.</li>
                </ul>
              </div>
              {notice && <div role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">{notice}</div>}
              <button type="button" onClick={handleExportPlaceholder} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-bold text-white shadow-sm transition hover:brightness-95" style={{ background: theme.primary }}>
                <span aria-hidden="true">⇩</span> Export Website
              </button>
              <p className="mt-2 text-center text-xs text-slate-500">Tombol ini belum membuat ZIP; generator akan dihubungkan pada tahap berikutnya.</p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StepHeading({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">{number}</span>
      <div><h2 className="text-base font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>
    </div>
  );
}

function FormatCard({ selected, onClick, icon, title, description, points }: {
  selected: boolean; onClick: () => void; icon: string; title: string; description: string; points: string[];
}) {
  return (
    <button type="button" onClick={onClick} className={`relative rounded-xl border p-4 text-left transition ${selected ? "border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
      {selected && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">✓</span>}
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${selected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{icon}</span>
      <h3 className="mt-3 pr-4 text-sm font-bold">{title}</h3>
      <p className="mt-2 min-h-12 text-xs leading-5 text-slate-500">{description}</p>
      <ul className="mt-3 space-y-2">{points.map((point) => <li key={point} className="flex gap-2 text-[11px] leading-4 text-slate-600"><span className="font-bold text-emerald-700">●</span><span>{point}</span></li>)}</ul>
    </button>
  );
}

function RadioCard({ selected, onClick, title, description }: { selected: boolean; onClick: () => void; title: string; description: string }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${selected ? "border-emerald-600 bg-emerald-50/60" : "border-slate-200 hover:bg-slate-50"}`}>
      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-emerald-700" : "border-slate-300"}`}>{selected && <span className="h-2 w-2 rounded-full bg-emerald-700" />}</span>
      <span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-slate-500">{description}</span></span>
    </button>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-emerald-700" : "bg-slate-300"}`}>
          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
      <span className="text-[10px] font-semibold text-slate-400">{checked ? "Aktif" : "Nonaktif"}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 px-3 py-3 text-xs"><dt className="text-slate-500">{label}</dt><dd className="break-words font-semibold text-slate-800">{value}</dd></div>;
}