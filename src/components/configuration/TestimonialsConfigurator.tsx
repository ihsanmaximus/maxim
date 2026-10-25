"use client";

import { useEffect, useState } from "react";
import {
  getProjectData,
  saveProjectData,
} from "@/lib/projects/projectStorage";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  photoUrl: string;
  rating: number;
};

type TestimonialsConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  layout: "grid" | "carousel";
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  cardColor: string;
  showPhotos: boolean;
  showRole: boolean;
  showRating: boolean;
  items: Testimonial[];
};

type Props = {
  projectId: string;
  primaryColor?: string;
  secondaryColor?: string;
};

const createTestimonial = (index: number): Testimonial => ({
  id: `testimonial-${Date.now()}-${index}`,
  name: "",
  role: "",
  quote: "",
  photoUrl: "",
  rating: 5,
});

function defaults(primary = "#14532D", secondary = "#16A34A"): TestimonialsConfig {
  return {
    eyebrow: "WHAT CLIENTS SAY",
    title: "Kind words from our clients",
    subtitle: "A few words from people we’ve had the pleasure to work with.",
    layout: "grid",
    accentColor: secondary,
    textColor: "#172033",
    backgroundColor: "#F8FAFC",
    cardColor: "#FFFFFF",
    showPhotos: true,
    showRole: true,
    showRating: false,
    items: [
      {
        id: "testimonial-1",
        name: "Client name",
        role: "Client role or company",
        quote: "Add a genuine testimonial from a happy client here.",
        photoUrl: "",
        rating: 5,
      },
      {
        id: "testimonial-2",
        name: "Client name",
        role: "Client role or company",
        quote: "Share what the client appreciated about working with you.",
        photoUrl: "",
        rating: 5,
      },
      {
        id: "testimonial-3",
        name: "Client name",
        role: "Client role or company",
        quote: "Keep the quote clear, specific, and easy to read.",
        photoUrl: "",
        rating: 5,
      },
    ],
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
}) {
  const className =
    "mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <label className="block min-w-0 text-sm font-semibold text-slate-700">
      {label}
      {multiline ? (
        <textarea
          className={`${className} min-h-24 resize-y`}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={className}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
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
    <label className="flex min-h-11 items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-emerald-700"
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
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b-2 border-emerald-700 bg-slate-50 px-4 py-4 marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-start gap-3">
          <span className="shrink-0 text-sm font-extrabold text-emerald-800">
            {number}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-extrabold text-slate-900">
              {title}
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              {description}
            </span>
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 group-open:hidden">
          Open +
        </span>
        <span className="hidden shrink-0 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 group-open:inline">
          Close −
        </span>
      </summary>
      <div className="space-y-4 border-t border-slate-200 bg-white p-4 sm:p-5">
        {children}
      </div>
    </details>
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
  return (
    <label className="block min-w-0 text-sm font-semibold text-slate-700">
      {label}
      <span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
        <input
          type="color"
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#ffffff"}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
          aria-label={label}
        />
        <span className="truncate text-xs font-normal text-slate-500">
          {value}
        </span>
      </span>
    </label>
  );
}

function TestimonialCard({
  item,
  config,
  compact = false,
}: {
  item: Testimonial;
  config: TestimonialsConfig;
  compact?: boolean;
}) {
  return (
    <article
      className={`flex min-w-0 flex-col rounded-2xl border border-black/5 p-5 shadow-sm ${
        compact ? "text-center" : ""
      }`}
      style={{ backgroundColor: config.cardColor, color: config.textColor }}
    >
      {config.showPhotos ? (
        item.photoUrl.trim() ? (
          // The URL is supplied by the website owner.
          <img
            src={item.photoUrl}
            alt={item.name || "Client"}
            className={`mb-4 h-14 w-14 rounded-full object-cover ${
              compact ? "mx-auto" : ""
            }`}
          />
        ) : (
          <div
            className={`mb-4 grid h-14 w-14 place-items-center rounded-full text-lg font-bold ${
              compact ? "mx-auto" : ""
            }`}
            style={{
              backgroundColor: `${config.accentColor}20`,
              color: config.accentColor,
            }}
            aria-label="Photo placeholder"
          >
            {(item.name.trim().charAt(0) || "C").toUpperCase()}
          </div>
        )
      ) : null}

      {config.showRating && (
        <div
          className={`mb-3 text-sm tracking-wider ${
            compact ? "text-center" : ""
          }`}
          style={{ color: config.accentColor }}
          aria-label={`${item.rating} out of 5 stars`}
        >
          {"★".repeat(Math.max(0, Math.min(5, item.rating)))}
          <span className="text-slate-300">
            {"★".repeat(5 - Math.max(0, Math.min(5, item.rating)))}
          </span>
        </div>
      )}

      <p className="flex-1 whitespace-pre-wrap text-sm leading-6">
        “{item.quote || "Your client’s testimonial will appear here."}”
      </p>
      <div className="mt-5">
        <p className="text-sm font-bold">{item.name || "Client name"}</p>
        {config.showRole && item.role && (
          <p className="mt-1 text-xs opacity-70">{item.role}</p>
        )}
      </div>
    </article>
  );
}

function Preview({
  config,
  device,
}: {
  config: TestimonialsConfig;
  device: "desktop" | "mobile";
}) {
  const items = config.items.length ? config.items : [createTestimonial(0)];
  const mobile = device === "mobile";
  const visibleItems = mobile ? items.slice(0, 1) : items;

  return (
    <section
      className={`mx-auto w-full overflow-hidden rounded-xl p-4 sm:p-6 ${
        mobile ? "max-w-[340px]" : "max-w-5xl"
      }`}
      style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
    >
      <div className="mx-auto mb-6 max-w-2xl text-center">
        {config.eyebrow && (
          <p
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: config.accentColor }}
          >
            {config.eyebrow}
          </p>
        )}
        <h3 className="mt-2 text-xl font-extrabold leading-tight sm:text-2xl">
          {config.title}
        </h3>
        {config.subtitle && (
          <p className="mt-2 text-sm leading-6 opacity-70">{config.subtitle}</p>
        )}
      </div>

      <div
        className={
          mobile
            ? "grid grid-cols-1 gap-3"
            : config.layout === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "grid grid-cols-1 gap-4 md:grid-cols-3"
        }
      >
        {visibleItems.map((item) => (
          <TestimonialCard
            key={item.id}
            item={item}
            config={config}
            compact={mobile}
          />
        ))}
      </div>

      {config.layout === "carousel" && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-full border text-sm"
            style={{ borderColor: `${config.accentColor}55`, color: config.accentColor }}
          >
            ←
          </span>
          <span className="text-xs opacity-60">
            {mobile ? "1" : Math.min(visibleItems.length, 3)} / {items.length}
          </span>
          <span
            className="grid h-8 w-8 place-items-center rounded-full border text-sm"
            style={{ borderColor: `${config.accentColor}55`, color: config.accentColor }}
          >
            →
          </span>
        </div>
      )}
    </section>
  );
}

export default function TestimonialsConfigurator({
  projectId,
  primaryColor,
  secondaryColor,
}: Props) {
  const [config, setConfig] = useState<TestimonialsConfig>(() =>
    defaults(primaryColor, secondaryColor)
  );
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fallback = defaults(primaryColor, secondaryColor);
    const saved = getProjectData<Partial<TestimonialsConfig> | null>(
      projectId,
      "testimonials-config",
      null
    );

    if (saved) {
      setConfig({
        ...fallback,
        ...saved,
        items:
          Array.isArray(saved.items) && saved.items.length
            ? saved.items.map((item, index) => ({
                ...createTestimonial(index),
                ...item,
              }))
            : fallback.items,
      });
    } else {
      setConfig(fallback);
    }
    setLoaded(true);
  }, [projectId, primaryColor, secondaryColor]);

  useEffect(() => {
    if (!loaded) return;
    saveProjectData(projectId, "testimonials-config", config);
  }, [projectId, config, loaded]);

  function update<K extends keyof TestimonialsConfig>(
    key: K,
    value: TestimonialsConfig[K]
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function updateItem(
    id: string,
    key: keyof Testimonial,
    value: string | number
  ) {
    setConfig((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  }

  function addItem() {
    setConfig((current) => ({
      ...current,
      items: [...current.items, createTestimonial(current.items.length)],
    }));
  }

  function removeItem(id: string) {
    setConfig((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }));
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <header className="min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
          MAXIMUS · SECTION CONFIGURATOR
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
          Testimonials
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Build a clean, professional testimonial section. Use genuine client
          feedback and preview the layout for desktop and mobile.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {loaded ? "Tersimpan otomatis" : "Memuat konfigurasi…"}
        </div>
      </header>

      <Group
        number="01"
        title="Section content"
        description="Judul, pengantar, dan pilihan layout."
        defaultOpen
      >
        <Field
          label="Eyebrow / small heading"
          value={config.eyebrow}
          onChange={(value) => update("eyebrow", value)}
          placeholder="WHAT CLIENTS SAY"
        />
        <Field
          label="Section title"
          value={config.title}
          onChange={(value) => update("title", value)}
          placeholder="Kind words from our clients"
        />
        <Field
          label="Subtitle"
          value={config.subtitle}
          onChange={(value) => update("subtitle", value)}
          multiline
          placeholder="A short introduction to the testimonials."
        />

        <div>
          <p className="mb-2 text-sm font-bold text-slate-800">Desktop layout</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                value: "grid",
                title: "Grid Cards",
                description: "Three cards per row on desktop.",
              },
              {
                value: "carousel",
                title: "Carousel",
                description: "Cards presented as a slide-style layout.",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  update("layout", option.value as TestimonialsConfig["layout"])
                }
                className={`rounded-xl border p-4 text-left transition ${
                  config.layout === option.value
                    ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-100"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <span className="block text-sm font-bold text-slate-900">
                  {option.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Mobile preview always uses one card per view.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Toggle
            label="Show client photos"
            checked={config.showPhotos}
            onChange={(value) => update("showPhotos", value)}
          />
          <Toggle
            label="Show role / company"
            checked={config.showRole}
            onChange={(value) => update("showRole", value)}
          />
          <Toggle
            label="Show star rating"
            checked={config.showRating}
            onChange={(value) => update("showRating", value)}
          />
        </div>
      </Group>

      <Group
        number="02"
        title="Client testimonials"
        description="Tambahkan dan kelola setiap testimoni."
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {config.items.length} testimonial item
            {config.items.length === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
          >
            + Add testimonial
          </button>
        </div>

        {config.items.map((item, index) => (
          <details
            key={item.id}
            open={index === 0}
            className="group overflow-hidden rounded-xl border border-slate-300 bg-slate-50"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="text-sm font-bold text-slate-800">
                {String(index + 1).padStart(2, "0")} ·{" "}
                {item.name.trim() || "New testimonial"}
              </span>
              <span className="text-xs font-semibold text-slate-500 group-open:hidden">
                Open +
              </span>
              <span className="hidden text-xs font-semibold text-slate-500 group-open:inline">
                Close −
              </span>
            </summary>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <Field
                label="Client name"
                value={item.name}
                onChange={(value) => updateItem(item.id, "name", value)}
                placeholder="Client name"
              />
              <Field
                label="Role / company"
                value={item.role}
                onChange={(value) => updateItem(item.id, "role", value)}
                placeholder="Founder, Company"
              />
              <div className="md:col-span-2">
                <Field
                  label="Testimonial quote"
                  value={item.quote}
                  onChange={(value) => updateItem(item.id, "quote", value)}
                  placeholder="Paste the client's genuine feedback."
                  multiline
                />
              </div>
              <Field
                label="Client photo URL (optional)"
                value={item.photoUrl}
                onChange={(value) => updateItem(item.id, "photoUrl", value)}
                placeholder="https://..."
              />
              <label className="block text-sm font-semibold text-slate-700">
                Rating (optional)
                <select
                  value={item.rating}
                  onChange={(event) =>
                    updateItem(item.id, "rating", Number(event.target.value))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} / 5
                    </option>
                  ))}
                </select>
              </label>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                >
                  Remove testimonial
                </button>
              </div>
            </div>
          </details>
        ))}
      </Group>

      <Group
        number="03"
        title="Visual style"
        description="Atur warna agar sesuai dengan tema website."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ColorField
            label="Accent color"
            value={config.accentColor}
            onChange={(value) => update("accentColor", value)}
          />
          <ColorField
            label="Text color"
            value={config.textColor}
            onChange={(value) => update("textColor", value)}
          />
          <ColorField
            label="Section background"
            value={config.backgroundColor}
            onChange={(value) => update("backgroundColor", value)}
          />
          <ColorField
            label="Card background"
            value={config.cardColor}
            onChange={(value) => update("cardColor", value)}
          />
        </div>
      </Group>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Live Preview
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Mobile preview shows one testimonial at a time.
            </p>
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            {(["desktop", "mobile"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDevice(value)}
                className={`rounded-md px-3 py-2 text-xs font-bold capitalize ${
                  device === value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto bg-slate-100 p-3 sm:p-5">
          <Preview config={config} device={device} />
        </div>
      </section>
    </div>
  );
}
