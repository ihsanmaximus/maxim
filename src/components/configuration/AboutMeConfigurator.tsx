"use client";

import { useEffect, useState } from "react";
import { getProjectData, saveProjectData } from "@/lib/projects/projectStorage";

type Device = "desktop" | "mobile";
type Template = "casual" | "creative" | "clean";
type Config = {
  eyebrow: string; name: string; role: string; headline: string; shortBio: string;
  story: string; photoUrl: string; location: string; interests: string; skills: string;
  quote: string; email: string; websiteUrl: string; socialUrl: string; template: Template;
  showLocation: boolean; showInterests: boolean; showSkills: boolean; showQuote: boolean;
  accentColor: string; textColor: string; backgroundColor: string;
};
type Props = { projectId: string; primaryColor?: string; secondaryColor?: string };

const inputClass = "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

function defaults(primary = "#14532D", secondary = "#A16207"): Config {
  return {
    eyebrow: "A LITTLE ABOUT ME", name: "Alex Morgan", role: "Designer · Creator · Problem Solver",
    headline: "Hello, I'm Alex. I turn ideas into meaningful work.",
    shortBio: "A curious creative who enjoys making useful things and connecting with good people.",
    story: "I believe the best work starts with curiosity, thoughtful collaboration, and a willingness to keep learning. I enjoy exploring new ideas, solving practical problems, and turning small details into experiences people remember.",
    photoUrl: "", location: "Jakarta, Indonesia", interests: "Design, photography, coffee, travelling",
    skills: "Visual design, Creative thinking, Communication", quote: "Stay curious. Keep creating.",
    email: "hello@example.com", websiteUrl: "", socialUrl: "", template: "casual",
    showLocation: true, showInterests: true, showSkills: true, showQuote: false,
    accentColor: secondary, textColor: "#1F2937", backgroundColor: "#F8FAF8",
  };
}

function Field({ label, value, onChange, placeholder = "", multiline = false, type = "text", hint }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string;
  multiline?: boolean; type?: string; hint?: string;
}) {
  return <label className="block min-w-0">
    <span className={labelClass}>{label}</span>
    {multiline
      ? <textarea className={`${inputClass} min-h-24 resize-y`} rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      : <input className={inputClass} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    {hint ? <span className="mt-1 block text-xs leading-5 text-slate-500">{hint}</span> : null}
  </label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block min-w-0"><span className={labelClass}>{label}</span>
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
      <input type="color" aria-label={label} value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
      <span className="truncate text-xs text-slate-500">{value}</span>
    </div>
  </label>;
}

function Group({ number, title, description, children, defaultOpen = false }: {
  number: string; title: string; description: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  return <details open={defaultOpen} className="group overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 border-l-4 border-emerald-700 bg-slate-50 px-4 py-3 [&::-webkit-details-marker]:hidden">
      <span className="min-w-0"><span className="block text-base font-bold text-slate-900">{number} · {title}</span><span className="mt-0.5 block text-xs text-slate-500">{description}</span></span>
      <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 group-open:hidden">Open +</span>
      <span className="hidden shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 group-open:inline">Close −</span>
    </summary>
    <div className="space-y-4 border-t-2 border-slate-200 bg-white p-4">{children}</div>
  </details>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
    <span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-emerald-700" />
  </label>;
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string }) {
  if (photoUrl.trim()) return <img src={photoUrl} alt={name || "Profile"} className="h-full w-full object-cover" />;
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "ME";
  return <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 via-stone-100 to-amber-100 text-4xl font-bold text-emerald-900">{initials}</div>;
}

function Preview({ config, device }: { config: Config; device: Device }) {
  const mobile = device === "mobile";
  const creative = config.template === "creative";
  const clean = config.template === "clean";
  const accent = config.accentColor || "#A16207";
  return <div className={`mx-auto overflow-hidden rounded-2xl border border-slate-200 shadow-sm ${mobile ? "max-w-[350px]" : "w-full"}`} style={{ backgroundColor: config.backgroundColor, color: config.textColor }}>
    <div className="p-5 sm:p-7">
      <div className={`flex ${mobile || clean ? "flex-col" : "flex-row"} gap-5 ${creative ? "items-center" : "items-start"}`}>
        <div className={`shrink-0 overflow-hidden ${creative ? "rounded-[2rem]" : clean ? "rounded-full" : "rounded-2xl"} ${mobile ? "mx-auto h-28 w-28" : "h-32 w-32"}`} style={{ backgroundColor: `${accent}18` }}>
          <Avatar name={config.name} photoUrl={config.photoUrl} />
        </div>
        <div className={`min-w-0 flex-1 ${mobile ? "text-center" : ""}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>{config.eyebrow || "A LITTLE ABOUT ME"}</p>
          <h3 className={`${mobile ? "text-2xl" : "text-3xl"} mt-2 font-bold leading-tight`}>{config.name || "Your Name"}</h3>
          <p className="mt-1 text-sm font-medium" style={{ color: accent }}>{config.role || "Your profession"}</p>
          <p className="mt-4 text-base font-semibold leading-snug">{config.headline || "Your personal headline goes here."}</p>
          <p className="mt-2 text-sm leading-6 opacity-75">{config.shortBio || "Add a short introduction about yourself."}</p>
          {config.showLocation && config.location ? <p className="mt-3 text-xs opacity-70">⌖ {config.location}</p> : null}
        </div>
      </div>
      <div className="my-6 border-t" style={{ borderColor: `${accent}35` }} />
      <div className="space-y-5">
        <section><h4 className="text-sm font-bold">My Story</h4><p className="mt-2 whitespace-pre-line text-sm leading-6 opacity-80">{config.story || "Share a little more about your journey."}</p></section>
        {config.showSkills && config.skills.trim() ? <section><h4 className="text-sm font-bold">A Few Things I Do</h4><div className="mt-2 flex flex-wrap gap-2">{config.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => <span key={s} className="rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}10` }}>{s}</span>)}</div></section> : null}
        {config.showInterests && config.interests.trim() ? <section><h4 className="text-sm font-bold">Things I Enjoy</h4><p className="mt-2 text-sm leading-6 opacity-80">{config.interests}</p></section> : null}
        {config.showQuote && config.quote.trim() ? <blockquote className="rounded-xl border-l-4 p-4 text-sm font-semibold italic" style={{ borderColor: accent, backgroundColor: `${accent}10` }}>“{config.quote}”</blockquote> : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {config.email ? <span className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: accent }}>{config.email}</span> : null}
        {config.websiteUrl ? <span className="rounded-full border px-4 py-2 text-xs font-semibold" style={{ borderColor: `${accent}70` }}>Website</span> : null}
        {config.socialUrl ? <span className="rounded-full border px-4 py-2 text-xs font-semibold" style={{ borderColor: `${accent}70` }}>Social profile</span> : null}
      </div>
    </div>
  </div>;
}

export default function AboutMeConfigurator({ projectId, primaryColor = "#14532D", secondaryColor = "#A16207" }: Props) {
  const [config, setConfig] = useState<Config>(() => defaults(primaryColor, secondaryColor));
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Memuat konfigurasi...");
  const [device, setDevice] = useState<Device>("desktop");

  useEffect(() => {
    const fallback = defaults(primaryColor, secondaryColor);
    try {
      const saved = getProjectData<Partial<Config> | null>(projectId, "about-me-config", null);
      setConfig(saved ? { ...fallback, ...saved } : fallback);
    } catch (error) {
      console.error("Gagal memuat About Me Configurator:", error);
      setConfig(fallback);
    } finally { setLoaded(true); }
  }, [projectId, primaryColor, secondaryColor]);

  useEffect(() => {
    if (!loaded) return;
    try { saveProjectData(projectId, "about-me-config", config); setSaveStatus("Tersimpan"); }
    catch (error) { console.error("Gagal menyimpan About Me Configurator:", error); setSaveStatus("Gagal menyimpan"); }
  }, [config, loaded, projectId]);

  function update<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  return <div className="space-y-6 text-slate-800">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">MAXIMUS · SECTION CONFIGURATOR</p>
        <h2 className="mt-2 text-2xl font-bold">About Me</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Build a personal introduction with a relaxed, approachable style. This is a personal profile, not a formal CV.</p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs"><span className={`h-2 w-2 rounded-full ${saveStatus === "Tersimpan" ? "bg-emerald-500" : saveStatus === "Gagal menyimpan" ? "bg-red-500" : "bg-amber-400"}`} />{saveStatus}</div>
    </header>

    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <div className="space-y-4">
        <Group number="01" title="Personal introduction" description="Nama, profesi, headline, dan pengenalan singkat." defaultOpen>
          <Field label="Eyebrow / small heading" value={config.eyebrow} onChange={(v) => update("eyebrow", v)} placeholder="A LITTLE ABOUT ME" />
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Your name" value={config.name} onChange={(v) => update("name", v)} placeholder="Your full name" /><Field label="Profession / role" value={config.role} onChange={(v) => update("role", v)} placeholder="Designer, Writer, Founder..." /></div>
          <Field label="Personal headline" value={config.headline} onChange={(v) => update("headline", v)} multiline placeholder="A short sentence that sounds like you." />
          <Field label="Short introduction" value={config.shortBio} onChange={(v) => update("shortBio", v)} multiline placeholder="Introduce yourself in a few sentences." />
          <Field label="Profile photo URL" value={config.photoUrl} onChange={(v) => update("photoUrl", v)} placeholder="https://..." hint="Masukkan URL gambar. Jika kosong, preview memakai avatar inisial." />
          <Toggle label="Show location" checked={config.showLocation} onChange={(v) => update("showLocation", v)} />
          {config.showLocation ? <Field label="Location" value={config.location} onChange={(v) => update("location", v)} placeholder="City, Country" /> : null}
        </Group>

        <Group number="02" title="My story" description="Cerita personal yang lebih panjang.">
          <Field label="About me / personal story" value={config.story} onChange={(v) => update("story", v)} multiline placeholder="Tell visitors a little about your journey, values, or approach." />
          <Toggle label="Show personal quote" checked={config.showQuote} onChange={(v) => update("showQuote", v)} />
          {config.showQuote ? <Field label="Personal quote" value={config.quote} onChange={(v) => update("quote", v)} multiline placeholder="A phrase that represents you." /> : null}
        </Group>

        <Group number="03" title="Interests & skills" description="Sorot hal yang Anda sukai dan kuasai.">
          <Toggle label="Show interests" checked={config.showInterests} onChange={(v) => update("showInterests", v)} />
          {config.showInterests ? <Field label="Interests" value={config.interests} onChange={(v) => update("interests", v)} multiline placeholder="Photography, hiking, coffee..." hint="Pisahkan beberapa minat dengan koma." /> : null}
          <Toggle label="Show skills" checked={config.showSkills} onChange={(v) => update("showSkills", v)} />
          {config.showSkills ? <Field label="Skills / things you do" value={config.skills} onChange={(v) => update("skills", v)} multiline placeholder="Design, writing, strategy..." hint="Pisahkan beberapa keahlian dengan koma." /> : null}
        </Group>

        <Group number="04" title="Contact & links" description="Cara pengunjung menghubungi atau menemukan Anda.">
          <Field label="Email" value={config.email} onChange={(v) => update("email", v)} placeholder="hello@example.com" type="email" />
          <Field label="Personal website URL" value={config.websiteUrl} onChange={(v) => update("websiteUrl", v)} placeholder="https://..." />
          <Field label="Social profile URL" value={config.socialUrl} onChange={(v) => update("socialUrl", v)} placeholder="https://linkedin.com/in/..." />
        </Group>

        <Group number="05" title="Visual style" description="Pilih karakter desain dan warna dasar.">
          <div className="grid gap-3 sm:grid-cols-3">
            {([["casual", "Casual", "Hangat & santai"], ["creative", "Creative", "Lebih ekspresif"], ["clean", "Clean", "Minimal & rapi"]] as const).map(([value, title, desc]) =>
              <button key={value} type="button" onClick={() => update("template", value)} className={`rounded-xl border p-3 text-left transition ${config.template === value ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 bg-white hover:border-slate-400"}`}>
                <span className="block text-sm font-bold text-slate-900">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{desc}</span>
              </button>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-3"><ColorField label="Accent color" value={config.accentColor} onChange={(v) => update("accentColor", v)} /><ColorField label="Text color" value={config.textColor} onChange={(v) => update("textColor", v)} /><ColorField label="Background" value={config.backgroundColor} onChange={(v) => update("backgroundColor", v)} /></div>
        </Group>
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4">
          <div><h3 className="text-base font-bold text-slate-900">Live Preview</h3><p className="mt-1 text-xs text-slate-500">Periksa isi dan karakter tampilan.</p></div>
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">{(["desktop", "mobile"] as const).map((d) =>
            <button key={d} type="button" onClick={() => setDevice(d)} className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${device === d ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{d}</button>)}</div>
        </div>
        <div className="overflow-x-auto p-3 sm:p-5"><Preview config={config} device={device} /></div>
        <p className="border-t border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">Preview modul About Me. Integrasi template final dengan CV dan Gallery akan diuji pada siklus integrasi berikutnya.</p>
      </section>
    </div>
  </div>;
}
