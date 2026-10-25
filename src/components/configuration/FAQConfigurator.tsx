"use client";

import { useEffect, useState } from "react";
import { getProjectData, saveProjectData } from "@/lib/projects/projectStorage";

type FAQItem = { id: string; question: string; answer: string };
type DesktopCTAType = "image" | "video" | "free-call";
type PreviewDevice = "desktop" | "mobile";
type FAQConfig = {
  eyebrow: string; title: string; description: string; items: FAQItem[];
  desktopLayout: "two-column" | "accordion"; mobileLayout: "accordion";
  showDesktopCTA: boolean; desktopCTAType: DesktopCTAType; desktopCTAImage: string;
  desktopCTATitle: string; desktopCTADescription: string; desktopCTAButtonLabel: string;
  desktopCTALink: string; desktopVideoUrl: string; desktopCallPhoto: string; desktopCallLabel: string;
  mobileCTAEnabled: boolean; mobileCTAImage: string; mobileCTATitle: string;
  mobileCTADescription: string; mobileCTAButtonLabel: string; formTitle: string;
  formNameLabel: string; formEmailLabel: string; formDetailsLabel: string; formSubmitLabel: string;
  accentColor: string; titleColor: string; textColor: string; sectionBackground: string;
  cardBackground: string; openIcon: "plus" | "chevron";
};
type Props = { projectId: string; primaryColor?: string; secondaryColor?: string };

const inputClass = "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const starterItems: FAQItem[] = [
  { id: "faq-1", question: "How does the process work?", answer: "We start by understanding your goals, then recommend the best approach and keep you informed throughout the project." },
  { id: "faq-2", question: "What is included in the service?", answer: "The scope depends on your selected package. We will confirm the deliverables and timeline before work begins." },
  { id: "faq-3", question: "How long does a project take?", answer: "Timing depends on the project scope and how quickly content and feedback are provided." },
  { id: "faq-4", question: "Can I request revisions?", answer: "The number of revisions depends on the package and the agreed project scope." },
];
function makeDefaults(primary = "#14532D", secondary = "#EA580C"): FAQConfig {
  return {
    eyebrow: "FAQs", title: "Frequently Asked Questions",
    description: "Find answers to the questions we hear most often. Still need help? Get in touch with us.",
    items: starterItems.map((item) => ({ ...item })), desktopLayout: "two-column", mobileLayout: "accordion",
    showDesktopCTA: true, desktopCTAType: "image", desktopCTAImage: "", desktopCTATitle: "Need a little more help?",
    desktopCTADescription: "Tell us what you need and we’ll help you find the right solution.",
    desktopCTAButtonLabel: "Get Quote", desktopCTALink: "#contact", desktopVideoUrl: "",
    desktopCallPhoto: "", desktopCallLabel: "Book a Free Call", mobileCTAEnabled: true,
    mobileCTAImage: "", mobileCTATitle: "Have a project in mind?",
    mobileCTADescription: "Tell us a little about your project and we’ll get back to you.",
    mobileCTAButtonLabel: "Get Quote", formTitle: "Tell us about your project", formNameLabel: "Your name",
    formEmailLabel: "Email address", formDetailsLabel: "Project details", formSubmitLabel: "Send Request",
    accentColor: secondary, titleColor: "#243746", textColor: "#52606D",
    sectionBackground: "#F7F7F5", cardBackground: "#FFFFFF", openIcon: "plus",
  };
}
function Field({ label, value, onChange, placeholder = "", multiline = false, type = "text" }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; multiline?: boolean; type?: string;
}) {
  return <label className="block min-w-0"><span className={labelClass}>{label}</span>{multiline
    ? <textarea className={`${inputClass} min-h-20 resize-y`} rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    : <input className={inputClass} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}</label>;
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block min-w-0"><span className={labelClass}>{label}</span><div className="flex items-center gap-2 rounded-lg border border-slate-200 p-2"><input type="color" aria-label={label} value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" /><span className="truncate text-xs text-slate-500">{value}</span></div></label>;
}
function SettingsGroup({ number, title, children, defaultOpen = false }: { number: string; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return <details open={defaultOpen} className="group overflow-hidden rounded-xl border border-slate-200 bg-white"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden"><span>{number} · {title}</span><span className="text-xs font-normal text-slate-400 group-open:hidden">Open</span><span className="hidden text-xs font-normal text-slate-400 group-open:inline">Close</span></summary><div className="space-y-4 border-t border-slate-100 p-4">{children}</div></details>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-emerald-700" /></label>;
}

export default function FAQConfigurator({ projectId, primaryColor = "#14532D", secondaryColor = "#EA580C" }: Props) {
  const [config, setConfig] = useState<FAQConfig>(() => makeDefaults(primaryColor, secondaryColor));
  const [loaded, setLoaded] = useState(false
  );
  const [saveStatus, setSaveStatus] = useState("Loading configuration...");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [openFAQ, setOpenFAQ] = useState<string | null>("faq-1");
  const [formExpanded, setFormExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>("faq-1");

  useEffect(() => {
    const fallback = makeDefaults(primaryColor, secondaryColor);
    try {
      const saved = getProjectData<Partial<FAQConfig> | null>(projectId, "faq-config", null);
      setConfig(saved ? { ...fallback, ...saved, items: Array.isArray(saved.items) ? saved.items.map((item) => ({ ...starterItems[0], ...item })) : fallback.items } : fallback);
    } catch (error) {
      console.error("Failed to load FAQ configuration:", error); setConfig(fallback);
    } finally { setLoaded(true); }
  }, [projectId, primaryColor, secondaryColor]);

  useEffect(() => {
    if (!loaded) return;
    try { saveProjectData(projectId, "faq-config", config); setSaveStatus("Saved"); }
    catch (error) { console.error("Failed to save FAQ configuration:", error); setSaveStatus("Save failed"); }
  }, [config, loaded, projectId]);

  function update<K extends keyof FAQConfig>(key: K, value: FAQConfig[K]) { setConfig((current) => ({ ...current, [key]: value })); }
  function updateItem(id: string, key: keyof FAQItem, value: string) {
    setConfig((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, [key]: value } : item) }));
  }
  function addItem() {
    const id = `faq-${Date.now()}`;
    setConfig((current) => ({ ...current, items: [...current.items, { id, question: `New question ${current.items.length + 1}`, answer: "Add the answer to this question." }] }));
    setEditingId(id); setOpenFAQ(id);
  }
  function removeItem(id: string) {
    setConfig((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) }));
    if (editingId === id) setEditingId(null); if (openFAQ === id) setOpenFAQ(null);
  }

  return <div className="space-y-6 text-slate-800">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">MAXIMUS · SECTION CONFIGURATOR</p><h2 className="mt-2 text-2xl font-bold">FAQ Section</h2><p className="mt-1 max-w-2xl text-sm text-slate-500">Configure FAQ content, separate desktop and mobile behaviour, and preview the animated Get Quote form.</p></div><div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs"><span className={`h-2 w-2 rounded-full ${saveStatus === "Saved" ? "bg-emerald-500" : saveStatus === "Save failed" ? "bg-red-500" : "bg-amber-400"}`} />{saveStatus}</div></header>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="space-y-4">
        <SettingsGroup number="01" title="Section content" defaultOpen>
          <Field label="Eyebrow" value={config.eyebrow} onChange={(v) => update("eyebrow", v)} placeholder="FAQs" />
          <Field label="Section title" value={config.title} onChange={(v) => update("title", v)} placeholder="Frequently Asked Questions" />
          <Field label="Description" value={config.description} onChange={(v) => update("description", v)} multiline />
        </SettingsGroup>
        <SettingsGroup number="02" title="FAQ list">
          <div className="space-y-3">{config.items.map((item, index) => <div key={item.id} className={`rounded-xl border p-3 ${editingId === item.id ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200"}`}>
            <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">{String(index + 1).padStart(2, "0")}</span><button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEditingId(editingId === item.id ? null : item.id)}><span className="block truncate text-sm font-semibold">{item.question || `Question ${index + 1}`}</span><span className="block text-xs text-slate-500">Edit question and answer</span></button><button type="button" onClick={() => removeItem(item.id)} className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button></div>
            {editingId === item.id && <div className="mt-4 space-y-3 border-t border-slate-200 pt-4"><Field label="Question" value={item.question} onChange={(v) => updateItem(item.id, "question", v)} placeholder="Enter a question" /><Field label="Answer" value={item.answer} onChange={(v) => updateItem(item.id, "answer", v)} multiline placeholder="Enter the answer" /></div>}
          </div>)}</div>
          <button type="button" onClick={addItem} className="w-full rounded-xl border border-dashed border-emerald-400 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">+ Add question</button>
        </SettingsGroup>
        <SettingsGroup number="03" title="Desktop layout">
          <div className="grid grid-cols-2 gap-2">{([{ value: "two-column", label: "Two columns + CTA" }, { value: "accordion", label: "Accordion only" }] as const).map((option) => <button key={option.value} type="button" onClick={() => update("desktopLayout", option.value)} className={`rounded-lg border px-3 py-3 text-sm font-semibold ${config.desktopLayout === option.value ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white"}`}>{option.label}</button>)}</div>
          {config.desktopLayout === "two-column" && <><Toggle label="Show desktop CTA" checked={config.showDesktopCTA} onChange={(v) => update("showDesktopCTA", v)} />{config.showDesktopCTA && <>
            <label className="block"><span className={labelClass}>CTA type</span><select className={inputClass} value={config.desktopCTAType} onChange={(e) => update("desktopCTAType", e.target.value as DesktopCTAType)}><option value="image">Image CTA → Contact form</option><option value="video">Video tutorial</option><option value="free-call">Free call with photo</option></select></label>
            {config.desktopCTAType === "image" && <Field label="CTA image URL" value={config.desktopCTAImage} onChange={(v) => update("desktopCTAImage", v)} placeholder="https://..." />}
            {config.desktopCTAType === "video" && <Field label="Tutorial video URL" value={config.desktopVideoUrl} onChange={(v) => update("desktopVideoUrl", v)} placeholder="YouTube or video URL" />}
            {config.desktopCTAType === "free-call" && <><Field label="Photo URL" value={config.desktopCallPhoto} onChange={(v) => update("desktopCallPhoto", v)} placeholder="https://..." /><Field label="Button label" value={config.desktopCallLabel} onChange={(v) => update("desktopCallLabel", v)} placeholder="Book a Free Call" /></>}
            <Field label="CTA title" value={config.desktopCTATitle} onChange={(v) => update("desktopCTATitle", v)} /><Field label="CTA description" value={config.desktopCTADescription} onChange={(v) => update("desktopCTADescription", v)} multiline />
            {config.desktopCTAType !== "free-call" && <Field label="CTA button label" value={config.desktopCTAButtonLabel} onChange={(v) => update("desktopCTAButtonLabel", v)} />}
            <Field label="CTA destination URL" value={config.desktopCTALink} onChange={(v) => update("desktopCTALink", v)} placeholder="#contact or https://..." />
          </>}</>}
        </SettingsGroup>
        <SettingsGroup number="04" title="Mobile CTA + animated form">
          <Toggle label="Show mobile image CTA" checked={config.mobileCTAEnabled} onChange={(v) => update("mobileCTAEnabled", v)} />
          {config.mobileCTAEnabled && <>
            <Field label="CTA image URL" value={config.mobileCTAImage} onChange={(v) => update("mobileCTAImage", v)} placeholder="https://..." /><Field label="CTA title" value={config.mobileCTATitle} onChange={(v) => update("mobileCTATitle", v)} /><Field label="CTA description" value={config.mobileCTADescription} onChange={(v) => update("mobileCTADescription", v)} multiline /><Field label="Button label" value={config.mobileCTAButtonLabel} onChange={(v) => update("mobileCTAButtonLabel", v)} />
            <div className="rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">The form expands below the image CTA when the button is pressed. This preview tests the interaction; message delivery will be integrated separately.</div>
            <Field label="Form title" value={config.formTitle} onChange={(v) => update("formTitle", v)} /><Field label="Name field label" value={config.formNameLabel} onChange={(v) => update("formNameLabel", v)} /><Field label="Email field label" value={config.formEmailLabel} onChange={(v) => update("formEmailLabel", v)} /><Field label="Project details field label" value={config.formDetailsLabel} onChange={(v) => update("formDetailsLabel", v)} /><Field label="Submit button label" value={config.formSubmitLabel} onChange={(v) => update("formSubmitLabel", v)} />
          </>}
        </SettingsGroup>
        <SettingsGroup number="05" title="Visual style">
          <label className="block"><span className={labelClass}>Accordion icon</span><select className={inputClass} value={config.openIcon} onChange={(e) => update("openIcon", e.target.value as "plus" | "chevron")}><option value="plus">Plus / minus</option><option value="chevron">Chevron</option></select></label>
          <div className="grid grid-cols-2 gap-3"><ColorField label="Section background" value={config.sectionBackground} onChange={(v) => update("sectionBackground", v)} /><ColorField label="Card background" value={config.cardBackground} onChange={(v) => update("cardBackground", v)} /><ColorField label="Title color" value={config.titleColor} onChange={(v) => update("titleColor", v)} /><ColorField label="Text color" value={config.textColor} onChange={(v) => update("textColor", v)} /><ColorField label="Accent color" value={config.accentColor} onChange={(v) => update("accentColor", v)} /></div>
        </SettingsGroup>
      </div>
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">Live Preview</h3><p className="mt-1 text-xs text-slate-500">Switch device sizes to test separate desktop and mobile layouts.</p></div><div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">{(["desktop", "mobile"] as const).map((device) => <button key={device} type="button" onClick={() => setPreviewDevice(device)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${previewDevice === device ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{device === "desktop" ? "Desktop" : "Mobile"}</button>)}</div></div>
        <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-5"><div className={`mx-auto overflow-hidden rounded-xl shadow-sm ${previewDevice === "mobile" ? "max-w-[390px]" : "max-w-full"}`} style={{ backgroundColor: config.sectionBackground }}><section className="px-5 py-8 sm:px-8 sm:py-12" style={{ backgroundColor: config.sectionBackground }}><div className={`mx-auto ${previewDevice === "desktop" && config.desktopLayout === "two-column" ? "max-w-6xl" : "max-w-3xl"}`}>
          {previewDevice === "desktop" && config.desktopLayout === "two-column" ? <div className="grid items-start gap-8 md:grid-cols-[0.85fr_1.15fr]"><div>{renderHeading()}{config.showDesktopCTA && renderDesktopCTA()}</div><div className="space-y-3">{config.items.map((item) => renderQuestion(item))}</div></div> : <>{renderHeading()}<div className="mt-7 space-y-3">{config.items.map((item) => renderQuestion(item))}</div>{previewDevice === "mobile" && config.mobileCTAEnabled && renderMobileCTA()}{previewDevice === "desktop" && config.desktopLayout === "accordion" && config.showDesktopCTA && renderDesktopCTA()}</>}
        </div></section></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><h4 className="text-sm font-semibold">Configuration summary</h4><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600"><li>• FAQ items: {config.items.length}</li><li>• Desktop: {config.desktopLayout}</li><li>• Desktop CTA: {config.showDesktopCTA ? config.desktopCTAType : "hidden"}</li><li>• Mobile CTA: {config.mobileCTAEnabled ? "image + inline form" : "hidden"}</li><li>• Form delivery: not connected yet (preview only)</li></ul></div>
      </div>
    </div>
  </div>;

  function renderHeading() {
    return <div>{config.eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: config.accentColor }}>{config.eyebrow}</p>}<h2 className="text-2xl font-bold leading-tight sm:text-4xl" style={{ color: config.titleColor }}>{config.title || "Frequently Asked Questions"}</h2>{config.description && <p className="mt-3 text-sm leading-6 sm:text-base" style={{ color: config.textColor }}>{config.description}</p>}</div>;
  }
  function renderQuestion(item: FAQItem) {
    const isOpen = openFAQ === item.id;
    return <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm" style={{ backgroundColor: config.cardBackground }}><button type="button" aria-expanded={isOpen} onClick={() => setOpenFAQ(isOpen ? null : item.id)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold sm:px-5" style={{ color: config.titleColor }}><span>{item.question || "Your question here"}</span><span className="shrink-0 text-xl font-normal" style={{ color: config.accentColor }}>{config.openIcon === "plus" ? (isOpen ? "−" : "+") : (isOpen ? "⌄" : "›")}</span></button><div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><div className="overflow-hidden"><p className="px-4 pb-5 text-sm leading-6 sm:px-5" style={{ color: config.textColor }}>{item.answer}</p></div></div></article>;
  }
  function renderDesktopCTA() {
    const isCall = config.desktopCTAType === "free-call";
    const image = config.desktopCTAType === "image" ? config.desktopCTAImage : isCall ? config.desktopCallPhoto : "";
    return <div className="mt-7 overflow-hidden rounded-2xl border border-white/80 shadow-sm" style={{ backgroundColor: config.cardBackground }}>
      {config.desktopCTAType === "video" ? <div className="flex aspect-video items-center justify-center bg-slate-200 p-4 text-center">{config.desktopVideoUrl ? <a href={config.desktopVideoUrl} target="_blank" rel="noreferrer" className="rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: config.accentColor }}>▶ Watch tutorial</a> : <span className="text-sm text-slate-500">Add a tutorial video URL</span>}</div> : image ? <img src={image} alt="" className="h-40 w-full object-cover" /> : <div className="flex h-36 items-center justify-center text-sm" style={{ backgroundColor: `${config.accentColor}12`, color: config.accentColor }}>{isCall ? "Free call photo" : "CTA image"}</div>}
      <div className="p-5"><h3 className="text-xl font-bold" style={{ color: config.titleColor }}>{config.desktopCTATitle}</h3><p className="mt-2 text-sm leading-6" style={{ color: config.textColor }}>{config.desktopCTADescription}</p><a href={config.desktopCTALink || "#contact"} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: config.accentColor }}>{isCall ? config.desktopCallLabel : config.desktopCTAButtonLabel}</a></div>
    </div>;
  }
  function renderMobileCTA() {
    return <div className="mt-7"><div className="overflow-hidden rounded-2xl border border-white/80 shadow-sm" style={{ backgroundColor: config.cardBackground }}>{config.mobileCTAImage ? <img src={config.mobileCTAImage} alt="" className="h-44 w-full object-cover" /> : <div className="flex h-36 items-center justify-center text-sm" style={{ backgroundColor: `${config.accentColor}12`, color: config.accentColor }}>Mobile CTA image</div>}<div className="p-5"><h3 className="text-xl font-bold" style={{ color: config.titleColor }}>{config.mobileCTATitle}</h3><p className="mt-2 text-sm leading-6" style={{ color: config.textColor }}>{config.mobileCTADescription}</p><button type="button" onClick={() => setFormExpanded((current) => !current)} aria-expanded={formExpanded} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.99]" style={{ backgroundColor: config.accentColor }}>{formExpanded ? "Hide Form" : config.mobileCTAButtonLabel}</button></div></div>
      <div className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${formExpanded ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}><div className="overflow-hidden"><form className="space-y-4 rounded-2xl border border-slate-200 p-5 shadow-sm" style={{ backgroundColor: config.cardBackground }} onSubmit={(e) => e.preventDefault()}><h4 className="text-lg font-bold" style={{ color: config.titleColor }}>{config.formTitle}</h4><label className="block"><span className={labelClass}>{config.formNameLabel}</span><input className={inputClass} type="text" placeholder={config.formNameLabel} autoComplete="name" /></label><label className="block"><span className={labelClass}>{config.formEmailLabel}</span><input className={inputClass} type="email" placeholder="you@example.com" autoComplete="email" /></label><label className="block"><span className={labelClass}>{config.formDetailsLabel}</span><textarea className={`${inputClass} min-h-24 resize-y`} rows={4} placeholder={config.formDetailsLabel} /></label><button type="submit" className="min-h-12 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: config.accentColor }}>{config.formSubmitLabel}</button><p className="text-xs leading-5 text-slate-500">Preview only: this form does not send or save submissions yet.</p></form></div></div>
    </div>;
  }
}
