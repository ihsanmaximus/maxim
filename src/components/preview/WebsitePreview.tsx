"use client";

import { useEffect, useMemo, useState } from "react";
import { getProjectData } from "@/lib/projects/projectStorage";
import { getProjectImages } from "@/lib/projects/imageStorage";

type Device = "mobile" | "tablet" | "desktop";
type StructureSection = {
  id: string;
  name?: string;
  enabled?: boolean;
  global?: boolean;
};
type WebsitePage = {
  id: string;
  name?: string;
  sections?: StructureSection[];
  structureOrder?: string[];
};
type Props = {
  projectId: string;
  projectName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  onBack?: () => void;
};

const SECTION_CONFIG_KEYS: Record<string, string> = {
  navbar: "navbar-config",
  hero: "hero-config",
  services: "services-config",
  portfolio: "portfolio-config",
  about: "about-me-config",
  "about-me": "about-me-config",
  "about-us": "about-me-config",
  testimonials: "testimonials-config",
  pricing: "pricing-config",
  faq: "faq-config",
  contact: "contact-config",
  footer: "footer-config",
};

const DEFAULT_ORDER = [
  "navbar", "hero", "services", "portfolio", "about", "testimonials",
  "pricing", "faq", "contact", "footer",
];

function asObject(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? value as Record<string, any> : {};
}
function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}
function color(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback;
}
function sectionKey(value: string): string {
  return value.replace(/^section:/, "").toLowerCase().trim().replace(/[\s_]+/g, "-");
}
function ImageBox({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  return src ? (
    // Images may currently be external URLs or data URLs. Image Library integration is a later step.
    <img src={src} alt={alt} className={`block object-cover ${className}`} />
  ) : (
    <div className={`flex items-center justify-center border border-dashed border-slate-300 bg-slate-100 text-xs font-medium text-slate-400 ${className}`}>
      Image placeholder
    </div>
  );
}
function SectionHeading({ eyebrow, title, description, accent, centered = true }: {
  eyebrow?: string; title?: string; description?: string; accent: string; centered?: boolean;
}) {
  return (
    <div className={`mb-8 ${centered ? "mx-auto text-center" : "text-left"} max-w-3xl`}>
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[.18em]" style={{ color: accent }}>{eyebrow}</p> : null}
      <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{title || "Section title"}</h2>
      {description ? <p className="mt-3 text-sm leading-6 opacity-70 sm:text-base">{description}</p> : null}
    </div>
  );
}

function Navbar({ config, primary, secondary }: { config: Record<string, any>; primary: string; secondary: string }) {
  const logo = text(config.logoText, "Your Brand");
  const links = Array.isArray(config.links) ? config.links : [];
  const image = text(config.logoImage);
  const dark = config.colorMode === "dark";
  const bg = config.appearance === "transparent" ? "transparent" : dark ? "#111827" : "#FFFFFF";
  const fg = dark ? "#FFFFFF" : "#172033";
  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b px-5 py-3 sm:px-8" style={{ background: bg, color: fg, borderColor: `${fg}18` }}>
      <div className="flex min-w-0 items-center gap-2 font-bold">
        {(config.logo === "image" || config.logo === "both") && image
          ? <img src={image} alt={logo} className="h-9 max-w-28 object-contain" />
          : null}
        {config.logo !== "image" ? <span className="truncate">{logo}</span> : null}
      </div>
      <nav className="hidden items-center gap-5 text-xs md:flex">
        {links.slice(0, 5).map((link: any, index: number) => (
          <span key={link.id || index} className="whitespace-nowrap">{text(link.label, `Menu ${index + 1}`)}</span>
        ))}
      </nav>
      {config.ctaEnabled !== false ? (
        <span className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-white" style={{ background: secondary }}>
          {text(config.ctaLabel, "Contact Us")}
        </span>
      ) : <span className="text-lg md:hidden">☰</span>}
    </header>
  );
}

function Hero({ c, primary, secondary }: { c: Record<string, any>; primary: string; secondary: string }) {
  const layout = text(c.layout, "text-image");
  const image = text(c.imageUrl);
  const bg = color(c.backgroundColor, "#F8FAFC");
  const fg = color(c.textColor, "#172033");
  const headlineColor = color(c.headlineColor, fg);
  const descriptionColor = color(c.descriptionColor, fg);
  const copy = (
    <div className={`min-w-0 ${c.alignment === "center" ? "text-center" : "text-left"}`}>
      {c.eyebrow ? <p className="mb-3 text-xs font-bold uppercase tracking-[.18em]" style={{ color: color(c.eyebrowColor, secondary) }}>{c.eyebrow}</p> : null}
      <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl" style={{ color: headlineColor }}>{text(c.headline, "Build Something Remarkable")}</h1>
      <p className="mt-4 text-sm leading-6 sm:text-base" style={{ color: descriptionColor }}>{text(c.subheadline, "Your story and value proposition will appear here.")}</p>
      <div className="mt-6 flex flex-wrap gap-3" style={{ justifyContent: c.alignment === "center" ? "center" : "flex-start" }}>
        {c.primaryCtaEnabled !== false ? <span className="rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ background: color(c.accentColor, primary) }}>{text(c.primaryCtaLabel, "Get Started")}</span> : null}
        {c.secondaryCtaEnabled ? <span className="rounded-lg border px-5 py-3 text-sm font-bold" style={{ borderColor: primary, color: primary }}>{text(c.secondaryCtaLabel, "Learn More")}</span> : null}
      </div>
    </div>
  );
  return (
    <section className={`p-6 sm:p-12 ${layout === "background-image" ? "relative" : ""}`} style={{ background: bg, color: fg, minHeight:
      c.height === "compact" ? 480 :
      c.height === "medium" ? 560 :
      c.height === "large" ? 640 :
      c.height === "full" ? 520 : undefined }}>
      {layout === "background-image" && image ? (
        <>
          <img
            src={image}
            alt={text(c.imageAlt, "Hero")}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {c.gradientEnabled === true && (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 ${
                c.gradientPosition === "right"
                  ? "bg-gradient-to-l"
                  : "bg-gradient-to-r"
              } ${
                c.gradientTheme === "light"
                  ? "from-white/75 via-white/45 to-transparent"
                  : "from-black/75 via-black/45 to-transparent"
              }`}
              style={{ width: "100%" }}
            />
          )}
        </>
      ) : null}
      <div className={`relative mx-auto grid max-w-6xl items-center gap-8 ${layout === "text-only" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {layout === "split-full-bleed" ? <ImageBox src={image} alt={text(c.imageAlt, "Hero image")} className="min-h-64 w-full rounded-2xl" /> : null}
        <div className={layout === "text-only" ? "mx-auto max-w-3xl" : ""}>{copy}</div>
        {layout !== "text-only" && layout !== "background-image" && layout !== "split-full-bleed" ? <ImageBox src={image} alt={text(c.imageAlt, "Hero image")} className="min-h-56 w-full rounded-2xl sm:min-h-80" /> : null}
      </div>
    </section>
  );
}

function Services({ c, primary, secondary }: { c: Record<string, any>; primary: string; secondary: string }) {
  const items = Array.isArray(c.items) ? c.items : [];
  const isCarousel = c.displayMode === "carousel";
  const desktopColumns = [2, 3, 4].includes(Number(c.desktopColumns)) ? Number(c.desktopColumns) : 3;
  const mobileColumns = Number(c.mobileColumns) === 2 ? 2 : 1;
  const cardStyle = { background: color(c.cardBackground, "#FFFFFF") };
  return <section className="px-5 py-12 sm:px-8 sm:py-16" style={{ background: color(c.sectionBackground, "#F8F7F0"), color: color(c.titleColor, "#172033"), paddingTop: `${Number(c.paddingTop ?? 80)}px`, paddingBottom: `${Number(c.paddingBottom ?? 80)}px` }}>
    <SectionHeading eyebrow={c.eyebrow} title={c.title} description={c.description} accent={color(c.accentColor, secondary)} />
    {items.length ? (isCarousel ? <div className="mx-auto max-w-6xl">
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3" aria-label="Carousel layanan">
        {items.map((item: any, i: number) => <article key={item.id || i} className="w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl border border-black/5 shadow-sm sm:w-[46%] lg:w-[32%]" style={cardStyle}>
          {c.visualType !== "icon" ? <ImageBox src={text(item.image)} alt={text(item.title, "Service")} className={`${c.imageRatio === "square" ? "aspect-square" : "aspect-[16/9]"} w-full`} /> : <div className="grid h-24 place-items-center text-3xl" style={{ color: primary }}>✳</div>}
          <div className="p-5"><h3 className="font-bold">{text(item.title, `Service ${i + 1}`)}</h3><p className="mt-2 text-sm leading-6 opacity-70">{text(item.description, "Service description placeholder.")}</p></div>
        </article>)}
      </div>
      <p className="mt-2 text-center text-xs opacity-60">Geser untuk melihat layanan lainnya</p>
    </div> : <div className="services-grid mx-auto grid max-w-6xl gap-5" style={{ "--mobile-service-columns": mobileColumns, gridTemplateColumns: `repeat(${desktopColumns}, minmax(0, 1fr))`, gap: `${Number(c.cardGap ?? 24)}px` } as any}>
      {items.map((item: any, i: number) => <article key={item.id || i} className="min-w-0 overflow-hidden rounded-2xl border border-black/5 shadow-sm" style={cardStyle}>
        {c.visualType !== "icon" ? <ImageBox src={text(item.image)} alt={text(item.title, "Service")} className={`${c.imageRatio === "square" ? "aspect-square" : "aspect-[16/9]"} w-full`} /> : <div className="grid h-24 place-items-center text-3xl" style={{ color: primary }}>✳</div>}
        <div className="p-5"><h3 className="font-bold">{text(item.title, `Service ${i + 1}`)}</h3><p className="mt-2 text-sm leading-6 opacity-70">{text(item.description, "Service description placeholder.")}</p></div>
      </article>)}
    </div>) : <PlaceholderCard title="Services placeholder" />}
    {c.ribbonEnabled ? <div className="mx-auto mt-8 max-w-6xl rounded-2xl p-5 text-white sm:p-7" style={{ background: color(c.ribbonBackground, primary) }}>
      <h3 className="text-xl font-bold">{text(c.ribbonTitle, "Ready to get started?")}</h3><p className="mt-2 text-sm opacity-85">{text(c.ribbonDescription)}</p>
      <span className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-bold" style={{ color: primary }}>{text(c.ribbonButton, "Contact Us")}</span>
    </div> : null}
  </section>;
}

function Portfolio({ c, secondary }: { c: Record<string, any>; secondary: string }) {
  const items = Array.isArray(c.items) ? c.items : [];
  return <section className="px-5 py-12 sm:px-8 sm:py-16" style={{ background: color(c.sectionBackground, "#FFFFFF"), color: color(c.titleColor, "#172033") }}>
    <SectionHeading eyebrow={c.eyebrow} title={c.title} description={c.description} accent={color(c.accentColor, secondary)} />
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.length ? items.map((item: any, i: number) => <article key={item.id || i} className="overflow-hidden rounded-2xl border border-black/5" style={{ background: color(c.cardBackground, "#FFFFFF") }}>
        <ImageBox src={text(item.imageUrl || item.thumbnailUrl)} alt={text(item.title, "Portfolio")} className="h-48 w-full" />
        <div className="p-4">{c.showCategory !== false ? <p className="text-xs font-bold uppercase tracking-wide" style={{ color: secondary }}>{text(item.category, "Category")}</p> : null}<h3 className="mt-2 font-bold">{text(item.title, `Project ${i + 1}`)}</h3>{c.showDescription !== false && item.description ? <p className="mt-2 text-sm leading-6 opacity-70">{item.description}</p> : null}</div>
      </article>) : <PlaceholderCard title="Portfolio placeholder" />}
    </div>
  </section>;
}

function About({ c, primary, secondary }: { c: Record<string, any>; primary: string; secondary: string }) {
  return <section id="about" className="px-5 py-12 sm:px-8 sm:py-16" style={{ background: color(c.backgroundColor, "#F8FAF8"), color: color(c.textColor, "#1F2937") }}>
    <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <ImageBox src={text(c.photoUrl)} alt={text(c.name, "Profile")} className="mx-auto aspect-[4/5] w-full max-w-sm rounded-2xl" />
      <div><SectionHeading eyebrow={c.eyebrow} title={c.headline || c.name} description={c.shortBio || c.role} accent={color(c.accentColor, secondary)} centered={false} />
        {c.story ? <p className="whitespace-pre-line text-sm leading-7 opacity-80">{c.story}</p> : null}
        {c.showQuote && c.quote ? <blockquote className="mt-5 border-l-4 pl-4 italic" style={{ borderColor: primary }}>{c.quote}</blockquote> : null}
        <div className="mt-5 flex flex-wrap gap-2 text-xs">{c.showLocation && c.location ? <span className="rounded-full bg-black/5 px-3 py-2">{c.location}</span> : null}{c.showSkills && c.skills ? <span className="rounded-full bg-black/5 px-3 py-2">{c.skills}</span> : null}{c.showInterests && c.interests ? <span className="rounded-full bg-black/5 px-3 py-2">{c.interests}</span> : null}</div>
      </div>
    </div>
  </section>;
}

function Testimonials({ c, secondary }: { c: Record<string, any>; secondary: string }) {
  const items = Array.isArray(c.items) ? c.items : [];
  return <section className="px-5 py-12 sm:px-8 sm:py-16" style={{ background: color(c.backgroundColor, "#F8FAFC"), color: color(c.textColor, "#172033") }}>
    <SectionHeading eyebrow={c.eyebrow} title={c.title} description={c.subtitle} accent={color(c.accentColor, secondary)} />
    <div className={`mx-auto grid max-w-6xl gap-4 ${c.layout === "grid" ? "md:grid-cols-3" : "md:grid-cols-3"}`}>
      {items.length ? items.map((item: any, i: number) => <article key={item.id || i} className="rounded-2xl border border-black/5 p-5 shadow-sm" style={{ background: color(c.cardColor, "#FFFFFF") }}>
        {c.showPhotos ? <div className="mb-4 flex items-center gap-3">{item.photoUrl ? <img src={item.photoUrl} alt={text(item.name, "Client")} className="h-11 w-11 rounded-full object-cover" /> : <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-sm">◎</div>}<div><p className="text-sm font-bold">{text(item.name, `Client ${i + 1}`)}</p>{c.showRole && item.role ? <p className="text-xs opacity-60">{item.role}</p> : null}</div></div> : null}
        {c.showRating ? <p className="mb-2 tracking-widest" style={{ color: secondary }}>{"★".repeat(Math.max(0, Math.min(5, Number(item.rating) || 5)))}</p> : null}
        <p className="text-sm leading-6">“{text(item.quote, "Testimonial placeholder.")}”</p>
      </article>) : <PlaceholderCard title="Testimonials placeholder" />}
    </div>
  </section>;
}

function FAQ({ c, secondary }: { c: Record<string, any>; secondary: string }) {
  const items = Array.isArray(c.items) ? c.items : [];
  return <section className="px-5 py-12 sm:px-8 sm:py-16" style={{ background: color(c.sectionBackground, "#F7F7F5"), color: color(c.titleColor, "#243746") }}>
    <SectionHeading eyebrow={c.eyebrow} title={c.title} description={c.description} accent={color(c.accentColor, secondary)} />
    <div className="mx-auto max-w-3xl space-y-3">{items.length ? items.map((item: any, i: number) => <details key={item.id || i} className="rounded-xl border border-black/10 p-4" style={{ background: color(c.cardBackground, "#FFFFFF") }}><summary className="cursor-pointer text-sm font-bold">{text(item.question, `Question ${i + 1}`)}</summary><p className="mt-3 text-sm leading-6 opacity-75">{text(item.answer, "Answer placeholder.")}</p></details>) : <PlaceholderCard title="FAQ placeholder" />}</div>
  </section>;
}

function Contact({ c, primary, secondary }: { c: Record<string, any>; primary: string; secondary: string }) {
  const contacts = Array.isArray(c.directContacts) ? c.directContacts.filter((x: any) => x.enabled) : [];
  const socials = Array.isArray(c.socials) ? c.socials.filter((x: any) => x.enabled) : [];
  const dark = c.backgroundStyle === "accent";
  return <section className="px-5 py-12 sm:px-8 sm:py-16" style={{ background: dark ? "#0F172A" : c.backgroundStyle === "solid" ? "#FFFFFF" : "#F1F5F9", color: dark ? "#FFFFFF" : "#172033" }}>
    <SectionHeading eyebrow={c.eyebrow} title={c.title} description={c.description} accent={color(c.accentColor, primary)} />
    <div className={`mx-auto grid max-w-6xl gap-5 ${c.layout === "minimal" ? "grid-cols-1" : c.layout === "two-column" ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
      <article className="rounded-2xl border border-black/10 p-5"><h3 className="font-bold">{text(c.contactTitle, "Contact Us")}</h3><p className="mt-2 text-sm opacity-70">{text(c.contactDescription)}</p><div className="mt-4 space-y-3">{contacts.map((item: any, i: number) => <p key={item.id || i} className="text-sm"><span className="mr-2" style={{ color: secondary }}>{text(item.icon, "•")}</span>{text(item.label, "Contact")}{item.value ? `: ${item.value}` : ""}</p>)}</div></article>
      {c.layout !== "minimal" ? <article className="rounded-2xl border border-black/10 p-5"><h3 className="font-bold">{text(c.socialTitle, "Follow Us")}</h3><p className="mt-2 text-sm opacity-70">{text(c.socialDescription)}</p><div className="mt-4 flex flex-wrap gap-2">{socials.map((item: any, i: number) => <span key={item.id || i} className="rounded-full border px-3 py-2 text-xs">{text(item.name, "Social")}</span>)}</div></article> : null}
      {c.layout === "three-column" ? <article className="rounded-2xl border border-black/10 p-5"><h3 className="font-bold">{text(c.locationTitle, "Our Location")}</h3><p className="mt-2 text-sm opacity-70">{text(c.address, "Address placeholder")}</p>{c.showHours && c.hours ? <p className="mt-3 text-xs opacity-70">{c.hours}</p> : null}{c.showMap ? <div className="mt-4 grid h-24 place-items-center rounded-lg bg-slate-100 text-xs text-slate-500">Map placeholder</div> : null}</article> : null}
    </div>
  </section>;
}

function Footer({ c, primary, secondary }: { c: Record<string, any>; primary: string; secondary: string }) {
  if (c.enabled === false) return null;
  const groups = Array.isArray(c.groups) ? c.groups : [];
  return <footer className="px-5 py-10 sm:px-8" style={{ background: color(c.backgroundColor, primary), color: color(c.textColor, "#F8FAFC") }}>
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>{c.showBrand !== false ? <h3 className="text-lg font-bold">{text(c.brandName, "Your Brand")}</h3> : null}{c.showTagline !== false && c.tagline ? <p className="mt-2 max-w-xs text-sm leading-6 opacity-75">{c.tagline}</p> : null}{c.showSocialLinks && Array.isArray(c.socials) ? <div className="mt-3 flex flex-wrap gap-2 text-xs">{c.socials.map((s: any, i: number) => <span key={s.id || i} className="rounded-full border border-white/20 px-2 py-1">{s.label}</span>)}</div> : null}</div>
        {groups.map((group: any, i: number) => <div key={group.id || i}><h4 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: secondary }}>{text(group.title, "Links")}</h4><div className="space-y-2 text-sm opacity-75">{(Array.isArray(group.links) ? group.links : []).map((link: any, j: number) => <p key={link.id || j}>{text(link.label, "Link")}</p>)}</div></div>)}
      </div>
      <div className="mt-8 border-t border-white/20 pt-4 text-xs opacity-70">{text(c.copyright, "© {year} Your Brand. All rights reserved.").replaceAll("{year}", String(new Date().getFullYear()))}</div>
    </div>
  </footer>;
}

function PlaceholderCard({ title }: { title: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{title} — configuration belum tersedia.</div>;
}
function GenericPlaceholder({ name }: { name: string }) {
  return <section className="px-5 py-12 sm:px-8 sm:py-16"><div className="mx-auto max-w-5xl"><SectionHeading title={name} description="Preview placeholder. Konfigurasi section ini belum tersedia." accent="#64748B" /><PlaceholderCard title={`${name} placeholder`} /></div></section>;
}

function RenderSection({ id, config, primary, secondary }: { id: string; config: Record<string, any>; primary: string; secondary: string }) {
  const key = sectionKey(id);
  if (key === "navbar") return <Navbar config={config} primary={primary} secondary={secondary} />;
  if (key === "hero") return <Hero c={config} primary={primary} secondary={secondary} />;
  if (key === "services") return <Services c={config} primary={primary} secondary={secondary} />;
  if (key === "portfolio") return <Portfolio c={config} secondary={secondary} />;
  if (["about", "about-me", "about-us"].includes(key)) return <About c={config} primary={primary} secondary={secondary} />;
  if (key === "testimonials") return <Testimonials c={config} secondary={secondary} />;
  if (key === "faq") return <FAQ c={config} secondary={secondary} />;
  if (key === "contact") return config.enabled === false ? null : <Contact c={config} primary={primary} secondary={secondary} />;
  if (key === "footer") return <Footer c={config} primary={primary} secondary={secondary} />;
  if (key === "pricing") return <GenericPlaceholder name="Pricing" />;
  return <GenericPlaceholder name={key.replace(/-/g, " ")} />;
}

export default function WebsitePreview({ projectId, projectName = "Website Preview", primaryColor = "#14532D", secondaryColor = "#16A34A", onBack }: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const [refreshKey, setRefreshKey] = useState(0);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [activePageId, setActivePageId] = useState("home");
  const [configs, setConfigs] = useState<Record<string, Record<string, any>>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const savedPages = getProjectData<WebsitePage[]>(projectId, "website-structure", []);
    const validPages = Array.isArray(savedPages) && savedPages.length ? savedPages : [];
    const savedActivePageId = getProjectData<string>(projectId, "website-structure-active-page", "home");
    const chosenPage = validPages.find((p) => p.id === savedActivePageId) ?? validPages[0];
    setPages(validPages);
    setActivePageId(chosenPage?.id ?? "home");

    const nextConfigs: Record<string, Record<string, any>> = {};
    Object.entries(SECTION_CONFIG_KEYS).forEach(([sectionId, storageKey]) => {
      if (nextConfigs[sectionId]) return;
      nextConfigs[sectionId] = asObject(getProjectData<unknown>(projectId, storageKey, {}));
    });
    // Keep aliases for the IDs used by Website Structure.
    nextConfigs.about = nextConfigs["about-me"] ?? nextConfigs["about-us"] ?? {};
    nextConfigs["about-us"] = nextConfigs["about-me"] ?? nextConfigs["about-us"] ?? {};

    let cancelled = false;
    getProjectImages(projectId).then((images) => {
      if (cancelled) return;
      const hero = nextConfigs.hero ?? {};
      if (hero.imageId) {
        const selectedImage = images.find((image) => image.id === hero.imageId);
        if (selectedImage) nextConfigs.hero = { ...hero, imageUrl: selectedImage.dataUrl };
      }
      // Resolve Services image IDs from the same project Image Library.
      const services = nextConfigs.services ?? {};
      if (Array.isArray(services.items)) {
        nextConfigs.services = {
          ...services,
          items: services.items.map((item: any) => {
            if (!item?.imageId) return item; // Keep legacy external/data URLs working.
            const selectedImage = images.find((image) => image.id === item.imageId);
            return selectedImage ? { ...item, image: selectedImage.dataUrl } : { ...item, image: "" };
          }),
          ribbonImage: services.ribbonImageId
            ? (images.find((image) => image.id === services.ribbonImageId)?.dataUrl || "")
            : services.ribbonImage,
        };
      }
      setConfigs(nextConfigs);
      setLoaded(true);
    }).catch((error) => {
      console.error("Gagal memuat gambar untuk Website Preview:", error);
      if (!cancelled) {
        setConfigs(nextConfigs);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, [projectId, refreshKey]);

  const activePage = useMemo(() => pages.find((p) => p.id === activePageId) ?? pages[0], [pages, activePageId]);
  const orderedSections = useMemo(() => {
    if (!activePage) return DEFAULT_ORDER.map((id) => ({ id, name: id, enabled: true }));
    const sections = Array.isArray(activePage.sections) ? activePage.sections : [];
    const byId = new Map(sections.map((section) => [section.id, section]));
    const order = Array.isArray(activePage.structureOrder) ? activePage.structureOrder : [];
    const orderedIds = [
      ...order.filter((id) => id.startsWith("section:")).map(sectionKey),
      ...sections.map((section) => section.id).filter((id) => !order.includes(`section:${id}`)),
    ];
    return orderedIds
      .map((id) => byId.get(id))
      .filter((section): section is StructureSection => section !== undefined)
      .filter((section) => section.enabled !== false);
  }, [activePage]);

  const widths: Record<Device, string> = { mobile: "w-[390px] max-w-none", tablet: "w-[820px] max-w-none", desktop: "w-[1280px] max-w-none" };

  if (!projectId) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="text-xl font-bold">Pilih proyek terlebih dahulu</h2><p className="mt-2 text-sm text-slate-500">Buka atau buat proyek sebelum melihat preview website.</p></div>;
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">MAXIMUS · WEBSITE BUILDER</p><h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Website Preview</h2><p className="mt-1 text-sm text-slate-500">{projectName} · Preview gabungan berdasarkan Website Structure.</p></div>
        <div className="flex flex-wrap gap-2">
          {onBack ? <button onClick={onBack} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">← Kembali</button> : null}
          <button onClick={() => setRefreshKey((n) => n + 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">↻ Muat ulang</button>
        </div>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex gap-2">{(["desktop", "tablet", "mobile"] as Device[]).map((d) => <button key={d} onClick={() => setDevice(d)} aria-pressed={device === d} className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${device === d ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{d === "desktop" ? "▰ Desktop" : d === "tablet" ? "▣ Tablet" : "▯ Mobile"}</button>)}</div>
        <span className="text-xs text-slate-500">{orderedSections.length} section aktif</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-slate-200 p-2 sm:p-5">
        <div id="maximus-website-preview" data-device={device} className={`mx-auto min-h-[480px] max-w-none overflow-hidden bg-white shadow-xl transition-all duration-200 ${widths[device]}`}>
          <style>{`
            #maximus-website-preview { container-type: inline-size; }
            #maximus-website-preview[data-device="mobile"] .grid:not(.services-grid) { grid-template-columns: minmax(0, 1fr) !important; }
            #maximus-website-preview[data-device="mobile"] nav { display: none !important; }
            #maximus-website-preview[data-device="mobile"] section { min-width: 0; }
            #maximus-website-preview[data-device="mobile"] img { max-width: 100%; }
            #maximus-website-preview[data-device="tablet"] .grid:not(.services-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            #maximus-website-preview[data-device="mobile"] .services-grid { grid-template-columns: repeat(var(--mobile-service-columns, 1), minmax(0, 1fr)) !important; }
            #maximus-website-preview[data-device="tablet"] section[id="navbar"] nav { display: none; }
            #maximus-website-preview[data-device="desktop"] { width: 1280px; }
            #maximus-website-preview[data-device="tablet"] { width: 820px; }
            #maximus-website-preview[data-device="mobile"] { width: 390px; }
            #maximus-website-preview[data-device="mobile"] .grid > * { min-width: 0; }
          `}</style>
          {!loaded ? <div className="p-10 text-center text-sm text-slate-500">Memuat preview…</div> : orderedSections.length ? orderedSections.map((section, index) => {
            const id = section.id;
            const key = sectionKey(id);
            const configKey = SECTION_CONFIG_KEYS[key] ? key : key === "about" ? "about" : key;
            const config = configs[configKey] ?? configs[id] ?? {};
            return <div key={`${id}-${index}`} id={key} className="min-w-0"><RenderSection id={id} config={config} primary={primaryColor} secondary={secondaryColor} /></div>;
          }) : <div className="p-10 text-center"><h3 className="text-lg font-bold text-slate-800">Belum ada section aktif</h3><p className="mt-2 text-sm text-slate-500">Aktifkan section di Website Structure untuk menampilkannya di sini.</p></div>}
        </div>
      </div>
      <p className="text-xs leading-5 text-slate-500">Ukuran preview: Desktop 1280 px, Tablet 820 px, Mobile 390 px. Pada layar HP, geser area preview secara horizontal untuk melihat seluruh kanvas Desktop/Tablet. Preview membaca konfigurasi tersimpan; gunakan Muat ulang setelah menyimpan. Gambar Hero dari Image Library dimuat berdasarkan ID gambar; URL gambar lama tetap didukung.</p>
    </section>
  );
}
