"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getProjectData, saveProjectData } from "@/lib/projects/projectStorage";

type Device = "desktop" | "mobile";
type FooterLink = { id: string; label: string; url: string };
type LinkGroup = { id: string; title: string; links: FooterLink[] };
type Config = {
  enabled: boolean;
  brandName: string;
  tagline: string;
  showBrand: boolean;
  showTagline: boolean;
  groups: LinkGroup[];
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  surfaceColor: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: "right" | "left";
  imageShape: "organic" | "rounded" | "circle";
  imageSize: "small" | "medium" | "large";
  showImage: boolean;
  imageOpacity: number;
  copyright: string;
  showPrivacy: boolean;
  privacyLabel: string;
  privacyUrl: string;
  showTerms: boolean;
  termsLabel: string;
  termsUrl: string;
  showSitemap: boolean;
  sitemapLabel: string;
  sitemapUrl: string;
  showBackToTop: boolean;
  showSocialLinks: boolean;
  socials: FooterLink[];
};

type Props = {
  projectId: string;
  primaryColor?: string;
  secondaryColor?: string;
};

const inputClass =
  "mt-1.5 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block text-sm font-semibold text-slate-700";

const createId = () => `footer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function defaults(primary = "#1E3A8A", secondary = "#3B82F6"): Config {
  return {
    enabled: true,
    brandName: "Your Brand",
    tagline: "Thoughtful solutions built around your next big idea.",
    showBrand: true,
    showTagline: true,
    groups: [
      {
        id: "company",
        title: "Company",
        links: [
          { id: "about", label: "About Us", url: "#about" },
          { id: "team", label: "Our Team", url: "#team" },
          { id: "careers", label: "Careers", url: "#careers" },
        ],
      },
      {
        id: "services",
        title: "Services",
        links: [
          { id: "services-link", label: "Services", url: "#services" },
          { id: "portfolio", label: "Portfolio", url: "#portfolio" },
          { id: "pricing", label: "Pricing", url: "#pricing" },
        ],
      },
      {
        id: "resources",
        title: "Resources",
        links: [
          { id: "articles", label: "Articles", url: "#articles" },
          { id: "faq", label: "FAQ", url: "#faq" },
          { id: "guides", label: "Guides", url: "#guides" },
        ],
      },
    ],
    backgroundColor: primary,
    textColor: "#F8FAFC",
    accentColor: secondary,
    surfaceColor: "#FFFFFF",
    imageUrl: "",
    imageAlt: "Decorative brand image",
    imagePosition: "right",
    imageShape: "organic",
    imageSize: "medium",
    showImage: true,
    imageOpacity: 25,
    copyright: "© {year} Your Brand. All rights reserved.",
    showPrivacy: true,
    privacyLabel: "Privacy Policy",
    privacyUrl: "/privacy",
    showTerms: true,
    termsLabel: "Terms & Conditions",
    termsUrl: "/terms",
    showSitemap: false,
    sitemapLabel: "Sitemap",
    sitemapUrl: "/sitemap",
    showBackToTop: false,
    showSocialLinks: false,
    socials: [
      { id: "instagram", label: "Instagram", url: "#" },
      { id: "linkedin", label: "LinkedIn", url: "#" },
    ],
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className={labelClass}>{label}</span>
      {multiline ? (
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={inputClass}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {hint ? <span className="mt-1 block text-xs leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const safeColor = /^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff";
  return (
    <label className="block min-w-0">
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
        <input
          type="color"
          aria-label={label}
          value={safeColor}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="truncate text-xs text-slate-500">{value}</span>
      </div>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-blue-700"
      />
    </label>
  );
}

function Group({
  number,
  title,
  description,
  children,
  defaultOpen = false,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 border-l-4 border-blue-700 bg-slate-50 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-base font-bold text-slate-900">{number} · {title}</span>
          <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
        </span>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 group-open:hidden">Open +</span>
        <span className="hidden shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 group-open:inline">Close −</span>
      </summary>
      <div className="space-y-4 border-t-2 border-slate-200 bg-white p-4">{children}</div>
    </details>
  );
}

function ImagePlaceholder({
  config,
  mobile = false,
}: {
  config: Config;
  mobile?: boolean;
}) {
  const size = config.imageSize === "small"
    ? mobile ? "h-24 w-28" : "h-28 w-36"
    : config.imageSize === "large"
      ? mobile ? "h-36 w-40" : "h-48 w-56"
      : mobile ? "h-28 w-32" : "h-36 w-44";
  return (
    <div
      className={`relative overflow-hidden ${size}`}
      style={{ backgroundColor: config.backgroundColor }}
      aria-hidden="true"
    >
      {config.imageUrl.trim() ? (
        <img
          src={config.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/40 text-[9px] font-semibold uppercase tracking-wider text-white/70">
          Image placeholder
        </div>
      )}
    </div>
  );
}

function Preview({ config, device }: { config: Config; device: Device }) {
  const mobile = device === "mobile";
  const groups = config.groups.filter((group) => group.title.trim() && group.links.some((link) => link.label.trim()));
  const bottomLinks = [
    config.showPrivacy ? { label: config.privacyLabel, url: config.privacyUrl } : null,
    config.showTerms ? { label: config.termsLabel, url: config.termsUrl } : null,
    config.showSitemap ? { label: config.sitemapLabel, url: config.sitemapUrl } : null,
  ].filter((link): link is { label: string; url: string } => Boolean(link?.label.trim()));
  const copyright = config.copyright.replaceAll("{year}", String(new Date().getFullYear()));

  return (
    <div
      className="relative mx-auto w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xl"
      style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
    >
      {config.showImage ? (
        <div
          className={`pointer-events-none absolute z-0 bottom-0 ${
            config.imagePosition === "left" ? "left-0" : "right-0"
          }`}
          style={{ opacity: Math.min(100, Math.max(0, config.imageOpacity)) / 100 }}
          aria-hidden="true"
        >
          <ImagePlaceholder config={config} mobile={mobile} />
        </div>
      ) : null}

      <div className={`relative z-10 min-w-0 ${mobile ? "space-y-5 p-5" : "p-6 sm:p-8"}`}>
        <div className={mobile ? "space-y-4" : "flex items-start gap-6 lg:gap-8"}>
          <div className={`${mobile ? "space-y-3" : "w-[30%] min-w-0 shrink-0"} ${config.showBrand ? "" : "hidden"}`}>
            <p className={`${mobile ? "text-2xl" : "text-xl"} font-bold tracking-tight`}>{config.brandName || "Your Brand"}</p>
            {config.showTagline && config.tagline ? (
              <p className="mt-2 max-w-xs text-sm leading-6 opacity-80">{config.tagline}</p>
            ) : null}
            {config.showSocialLinks && config.socials.some((social) => social.label.trim()) ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {config.socials.filter((social) => social.label.trim()).map((social) => (
                  <span key={social.id} className="rounded-full border px-3 py-1.5 text-[10px] font-semibold" style={{ borderColor: `${config.textColor}45` }}>{social.label}</span>
                ))}
              </div>
            ) : null}
          </div>

          {mobile ? (
            <div className="min-w-0 border-t pt-2" style={{ borderColor: `${config.textColor}30` }}>
              {groups.map((group) => (
                <details key={group.id} className="border-b" style={{ borderColor: `${config.textColor}30` }}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    <span>{group.title}</span>
                    <span className="text-lg font-normal opacity-75">+</span>
                  </summary>
                  <ul className="space-y-2 pb-4 pl-1">
                    {group.links.filter((link) => link.label.trim()).map((link) => (
                      <li key={link.id} className="break-words text-xs leading-5 opacity-80">{link.label}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          ) : (
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
              {groups.map((group) => (
                <div key={group.id} className="min-w-0">
                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: config.accentColor }}>{group.title}</h4>
                  <ul className="space-y-2.5">
                    {group.links.filter((link) => link.label.trim()).map((link) => (
                      <li key={link.id} className="break-words text-xs leading-5 opacity-80">{link.label}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4" style={{ borderColor: `${config.textColor}30` }}>
          <div className={`flex ${mobile ? "flex-col items-start gap-3" : "flex-row items-center justify-between gap-4"}`}>
            <p className="text-[10px] leading-5 opacity-75">{copyright}</p>
            <div className={`flex flex-wrap gap-x-3 gap-y-2 ${mobile ? "text-left" : "justify-end text-right"}`}>
              {bottomLinks.map((link) => (
                <span key={link.label} className="text-[10px] opacity-85">{link.label}</span>
              ))}
              {config.showBackToTop ? (
                <span className="grid h-7 w-7 place-items-center rounded-full text-sm font-bold" style={{ backgroundColor: config.textColor, color: config.backgroundColor }}>↑</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FooterConfigurator({ projectId, primaryColor = "#1E3A8A", secondaryColor = "#3B82F6" }: Props) {
  const [config, setConfig] = useState<Config>(() => defaults(primaryColor, secondaryColor));
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Loading settings…");
  const [device, setDevice] = useState<Device>("desktop");

  useEffect(() => {
    const fallback = defaults(primaryColor, secondaryColor);
    try {
      const saved = getProjectData<Partial<Config> | null>(projectId, "footer-config", null);
      setConfig(saved ? {
        ...fallback,
        ...saved,
        groups: Array.isArray(saved.groups) ? saved.groups : fallback.groups,
        socials: Array.isArray(saved.socials) ? saved.socials : fallback.socials,
      } : fallback);
    } catch (error) {
      console.error("Failed to load Footer Configurator:", error);
      setConfig(fallback);
    } finally {
      setLoaded(true);
    }
  }, [projectId, primaryColor, secondaryColor]);

  useEffect(() => {
    if (!loaded) return;
    try {
      saveProjectData(projectId, "footer-config", config);
      setSaveStatus("All changes saved");
    } catch (error) {
      console.error("Failed to save Footer Configurator:", error);
      setSaveStatus("Unable to save");
    }
  }, [config, loaded, projectId]);

  function update<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function updateGroup(groupId: string, patch: Partial<LinkGroup>) {
    update("groups", config.groups.map((group) => group.id === groupId ? { ...group, ...patch } : group));
  }

  function updateLink(groupId: string, linkId: string, patch: Partial<FooterLink>) {
    update("groups", config.groups.map((group) => group.id === groupId
      ? { ...group, links: group.links.map((link) => link.id === linkId ? { ...link, ...patch } : link) }
      : group));
  }

  function addGroup() {
    update("groups", [...config.groups, { id: createId(), title: "New group", links: [{ id: createId(), label: "New link", url: "#" }] }]);
  }

  function removeGroup(groupId: string) {
    update("groups", config.groups.filter((group) => group.id !== groupId));
  }

  function addLink(groupId: string) {
    update("groups", config.groups.map((group) => group.id === groupId
      ? { ...group, links: [...group.links, { id: createId(), label: "New link", url: "#" }] }
      : group));
  }

  function removeLink(groupId: string, linkId: string) {
    update("groups", config.groups.map((group) => group.id === groupId
      ? { ...group, links: group.links.filter((link) => link.id !== linkId) }
      : group));
  }

  function updateSocial(id: string, patch: Partial<FooterLink>) {
    update("socials", config.socials.map((social) => social.id === id ? { ...social, ...patch } : social));
  }

  function addSocial() {
    update("socials", [...config.socials, { id: createId(), label: "Social profile", url: "#" }]);
  }

  function removeSocial(id: string) {
    update("socials", config.socials.filter((social) => social.id !== id));
  }

  return (
    <div className="space-y-6 text-slate-800">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">MAXIMUS · SECTION CONFIGURATOR</p>
          <h2 className="mt-2 text-2xl font-bold">Footer</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Create a distinctive, solid-color footer with clear navigation and an optional decorative image. Contact details stay in the Contact section.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs">
          <span className={`h-2 w-2 rounded-full ${saveStatus === "All changes saved" ? "bg-emerald-500" : saveStatus === "Unable to save" ? "bg-red-500" : "bg-amber-400"}`} />
          {saveStatus}
        </div>
      </header>

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 space-y-4">
          <Group number="01" title="Footer content" description="Brand identity and the short supporting message." defaultOpen>
            <Toggle label="Show brand name" checked={config.showBrand} onChange={(value) => update("showBrand", value)} />
            <Field label="Brand name" value={config.brandName} onChange={(value) => update("brandName", value)} placeholder="Your Brand" />
            <Toggle label="Show tagline" checked={config.showTagline} onChange={(value) => update("showTagline", value)} />
            <Field label="Tagline" value={config.tagline} onChange={(value) => update("tagline", value)} multiline placeholder="A short brand statement…" />
            <Toggle label="Enable this footer section" checked={config.enabled} onChange={(value) => update("enabled", value)} />
          </Group>

          <Group number="02" title="Navigation groups" description="Add link columns without repeating Contact information." defaultOpen>
            <p className="text-xs leading-5 text-slate-500">Use links to sections or pages that actually exist on the generated website. Example URLs: #services, /about, /privacy.</p>
            {config.groups.map((group, groupIndex) => (
              <div key={group.id} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <Field label={`Group ${groupIndex + 1} title`} value={group.title} onChange={(value) => updateGroup(group.id, { title: value })} placeholder="Company" />
                  </div>
                  <button type="button" onClick={() => removeGroup(group.id)} className="mb-0.5 rounded-lg border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-50">Remove</button>
                </div>
                {group.links.map((link, linkIndex) => (
                  <div key={link.id} className="grid min-w-0 gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2">
                    <Field label={`Link ${linkIndex + 1} label`} value={link.label} onChange={(value) => updateLink(group.id, link.id, { label: value })} placeholder="About Us" />
                    <Field label="Destination URL" value={link.url} onChange={(value) => updateLink(group.id, link.id, { url: value })} placeholder="#about" />
                    <button type="button" onClick={() => removeLink(group.id, link.id)} className="justify-self-start rounded-lg px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">Remove link</button>
                  </div>
                ))}
                <button type="button" onClick={() => addLink(group.id)} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-50">+ Add link</button>
              </div>
            ))}
            <button type="button" onClick={addGroup} className="w-full rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800 hover:bg-blue-100">+ Add navigation group</button>
          </Group>

          <Group number="03" title="Color palette" description="Use contrasting solid colors from the project palette." defaultOpen>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Solid background" value={config.backgroundColor} onChange={(value) => update("backgroundColor", value)} />
              <ColorField label="Text color" value={config.textColor} onChange={(value) => update("textColor", value)} />
              <ColorField label="Accent color" value={config.accentColor} onChange={(value) => update("accentColor", value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { update("backgroundColor", primaryColor); update("accentColor", secondaryColor); update("textColor", "#F8FAFC"); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Project palette</button>
              <button type="button" onClick={() => { update("backgroundColor", secondaryColor); update("accentColor", primaryColor); update("textColor", "#FFFFFF"); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Reverse contrast</button>
              <button type="button" onClick={() => { update("backgroundColor", "#0F172A"); update("accentColor", "#60A5FA"); update("textColor", "#F8FAFC"); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Deep navy</button>
            </div>
            <p className="text-xs leading-5 text-slate-500">The initial colors come from Project Setup. You can adjust them to create stronger contrast in this footer.</p>
          </Group>

          <Group number="04" title="Decorative image" description="One small visual accent at the edge of the solid-color block.">
            <Toggle label="Show decorative image" checked={config.showImage} onChange={(value) => update("showImage", value)} />
            <Field label="Image URL" value={config.imageUrl} onChange={(value) => update("imageUrl", value)} placeholder="https://example.com/footer-image.jpg" hint="Paste a hosted image URL. If left blank, a styled placeholder is shown in the preview." />
            <Field label="Image alt text" value={config.imageAlt} onChange={(value) => update("imageAlt", value)} placeholder="Decorative brand image" />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block min-w-0"><span className={labelClass}>Image position</span><select className={inputClass} value={config.imagePosition} onChange={(event) => update("imagePosition", event.target.value as Config["imagePosition"])}><option value="right">Right edge</option><option value="left">Left edge</option></select></label>
              <label className="block min-w-0"><span className={labelClass}>Image size</span><select className={inputClass} value={config.imageSize} onChange={(event) => update("imageSize", event.target.value as Config["imageSize"])}><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label>
              <label className="block min-w-0"><span className={labelClass}>Image opacity · {config.imageOpacity}%</span><input type="range" min="5" max="60" step="5" value={config.imageOpacity} onChange={(event) => update("imageOpacity", Number(event.target.value))} className="mt-3 w-full accent-blue-700" /><span className="mt-1 block text-xs text-slate-500">Keep it subtle so the text remains readable.</span></label>
            </div>
            <p className="rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-900">Overlay mode: the image sits behind the footer content and never takes up layout space.</p>
          </Group>

          <Group number="05" title="Legal and bottom bar" description="Copyright and policy links only; contact details are configured elsewhere.">
            <Field label="Copyright text" value={config.copyright} onChange={(value) => update("copyright", value)} placeholder="© {year} Your Brand. All rights reserved." hint="Use {year} to insert the current year automatically." />
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle label="Show Privacy Policy" checked={config.showPrivacy} onChange={(value) => update("showPrivacy", value)} />
              <Toggle label="Show Terms & Conditions" checked={config.showTerms} onChange={(value) => update("showTerms", value)} />
              <Toggle label="Show Sitemap" checked={config.showSitemap} onChange={(value) => update("showSitemap", value)} />
              <Toggle label="Show Back to Top" checked={config.showBackToTop} onChange={(value) => update("showBackToTop", value)} />
            </div>
            {config.showPrivacy ? <div className="grid gap-3 sm:grid-cols-2"><Field label="Privacy label" value={config.privacyLabel} onChange={(value) => update("privacyLabel", value)} /><Field label="Privacy URL" value={config.privacyUrl} onChange={(value) => update("privacyUrl", value)} /></div> : null}
            {config.showTerms ? <div className="grid gap-3 sm:grid-cols-2"><Field label="Terms label" value={config.termsLabel} onChange={(value) => update("termsLabel", value)} /><Field label="Terms URL" value={config.termsUrl} onChange={(value) => update("termsUrl", value)} /></div> : null}
            {config.showSitemap ? <div className="grid gap-3 sm:grid-cols-2"><Field label="Sitemap label" value={config.sitemapLabel} onChange={(value) => update("sitemapLabel", value)} /><Field label="Sitemap URL" value={config.sitemapUrl} onChange={(value) => update("sitemapUrl", value)} /></div> : null}
          </Group>

          <Group number="06" title="Social links (optional)" description="Off by default because social links may already appear in Contact.">
            <Toggle label="Show social links in Footer" checked={config.showSocialLinks} onChange={(value) => update("showSocialLinks", value)} />
            {config.socials.map((social, index) => (
              <div key={social.id} className="grid min-w-0 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                <Field label={`Social link ${index + 1}`} value={social.label} onChange={(value) => updateSocial(social.id, { label: value })} placeholder="Instagram" />
                <Field label="Profile URL" value={social.url} onChange={(value) => updateSocial(social.id, { url: value })} placeholder="https://…" />
                <button type="button" onClick={() => removeSocial(social.id)} className="justify-self-start rounded-lg px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">Remove social link</button>
              </div>
            ))}
            <button type="button" onClick={addSocial} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-50">+ Add social link</button>
          </Group>
        </div>

        <aside className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4">
              <div>
                <h3 className="font-bold text-slate-900">Live preview</h3>
                <p className="mt-1 text-xs text-slate-500">Solid background · responsive layout</p>
              </div>
              <div className="flex rounded-lg border border-slate-200 bg-white p-1">
                <button type="button" onClick={() => setDevice("desktop")} className={`rounded-md px-3 py-2 text-xs font-semibold ${device === "desktop" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Desktop</button>
                <button type="button" onClick={() => setDevice("mobile")} className={`rounded-md px-3 py-2 text-xs font-semibold ${device === "mobile" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Mobile</button>
              </div>
            </div>
            <div className={`${device === "mobile" ? "mx-auto w-full max-w-sm p-3" : "w-full min-w-0 p-4 sm:p-6"}`}>
              {config.enabled ? <Preview config={config} device={device} /> : <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Footer section is disabled.</div>}
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">Preview is illustrative. The generated website should use only the links and pages configured for that project.</p>
        </aside>
      </div>
    </div>
  );
}
