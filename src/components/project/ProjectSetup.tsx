"use client";

import { useState } from "react";

export type ProjectFormData = {
  projectName: string;
  businessName: string;
  businessType: string;
  country: string;
  language: string;
  primaryColor: string;
  secondaryColor: string;
  vibe: string;
};

type ProjectSetupProps = {
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
};

const initialForm: ProjectFormData = {
  projectName: "",
  businessName: "",
  businessType: "Construction & Real Estate",
  country: "United States",
  language: "English",
  primaryColor: "#7187ff",
  secondaryColor: "#172033",
  vibe: "Modern",
};

const palettes = [
  { name: "Ocean Blue", primary: "#2563EB", secondary: "#172554", colors: ["#2563EB", "#38BDF8", "#FFFFFF", "#EFF6FF", "#172554"] },
  { name: "Warm Earth", primary: "#B85C38", secondary: "#49352A", colors: ["#B85C38", "#D9B99B", "#F5EBDD", "#FFF9F2", "#49352A"] },
  { name: "Sage & Ivory", primary: "#718575", secondary: "#34463A", colors: ["#718575", "#C7D2C0", "#F7F5ED", "#FFFFFF", "#34463A"] },
  { name: "Luxury Gold", primary: "#B99A54", secondary: "#292722", colors: ["#B99A54", "#292722", "#E9DFC6", "#F8F5EE", "#292722"] },
  { name: "Clean Slate", primary: "#475569", secondary: "#1E293B", colors: ["#475569", "#94A3B8", "#E2E8F0", "#F8FAFC", "#1E293B"] },
  { name: "Creative Pop", primary: "#7C3AED", secondary: "#312E81", colors: ["#7C3AED", "#F472B6", "#FDE047", "#FAF5FF", "#312E81"] },
  { name: "Forest Green", primary: "#276749", secondary: "#183B2B", colors: ["#276749", "#68A77D", "#DCEBDD", "#F3F8F2", "#183B2B"] },
  { name: "Rose & Sand", primary: "#B76E79", secondary: "#543B40", colors: ["#B76E79", "#E8C9C0", "#F7EBE7", "#FFFAF8", "#543B40"] },
];

const vibes = [
  {
    name: "Modern",
    description: "Clean & contemporary",
    image: "/images/vibes/modern.png",
  },
  {
    name: "Elegant",
    description: "Refined & sophisticated",
    image: "/images/vibes/elegant.png",
  },
  {
    name: "Minimal",
    description: "Simple & focused",
    image: "/images/vibes/minimalis.png",
  },
  {
    name: "Corporate",
    description: "Professional & trusted",
    image: "/images/vibes/corporate.png",
  },
  {
    name: "Creative",
    description: "Bold & expressive",
    image: "/images/vibes/creative.png",
  },
  {
    name: "Personal / CV",
    description: "Professional personal branding",
    image: "/images/vibes/personal.png",
  },
];

export default function ProjectSetup({
  onSubmit,
  onCancel,
}: ProjectSetupProps) {
  const [form, setForm] = useState<ProjectFormData>(initialForm);
  const [error, setError] = useState("");

  function updateField(
    field: keyof ProjectFormData,
    value: string,
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.projectName.trim() || !form.businessName.trim()) {
      setError("Project Name dan Business Name wajib diisi.");
      return;
    }

    onSubmit({
      ...form,
      projectName: form.projectName.trim(),
      businessName: form.businessName.trim(),
    });
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-7">
        <button
          type="button"
          onClick={onCancel}
          className="mb-6 text-sm font-semibold text-slate-500 hover:text-indigo-600"
        >
          ← Back to Projects
        </button>

        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600">
          Project Configuration · Step 01
        </p>

        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          Create a new project
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Start with the essentials. You can refine the website design later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <div className="mb-7 flex items-center gap-4 border-b border-slate-100 pb-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-sm font-extrabold text-indigo-600">
              01
            </span>

            <div>
              <h3 className="font-bold text-slate-900">
                Project Information
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Basic information about this website.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Project Name <b className="text-red-500">*</b>
              </span>
              <input
                value={form.projectName}
                onChange={(event) =>
                  updateField("projectName", event.target.value)
                }
                placeholder="e.g. ABC Construction Website"
                maxLength={100}
                required
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Client / Business Name <b className="text-red-500">*</b>
              </span>
              <input
                value={form.businessName}
                onChange={(event) =>
                  updateField("businessName", event.target.value)
                }
                placeholder="e.g. ABC Construction"
                maxLength={100}
                required
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Business Type
              </span>
              <select
                value={form.businessType}
                onChange={(event) =>
                  updateField("businessType", event.target.value)
                }
                className={fieldClass}
              >
                <option>Construction & Real Estate</option>
                <option>Restaurant & Cafe</option>
                <option>Beauty & Wellness</option>
                <option>Professional Services</option>
                <option>Retail & E-commerce</option>
                <option>Technology</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Target Country
                </span>
                <select
                  value={form.country}
                  onChange={(event) =>
                    updateField("country", event.target.value)
                  }
                  className={fieldClass}
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Netherlands</option>
                  <option>Indonesia</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Website Language
                </span>
                <select
                  value={form.language}
                  onChange={(event) =>
                    updateField("language", event.target.value)
                  }
                  className={fieldClass}
                >
                  <option>English</option>
                  <option>Indonesian</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Spanish</option>
                  <option>Dutch</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <div className="mb-7 flex items-center gap-4 border-b border-slate-100 pb-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-sm font-extrabold text-indigo-600">
              02
            </span>

            <div>
              <h3 className="font-bold text-slate-900">Visual Identity</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Choose the starting point for your website design.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700">Website Vibe</p>
            <p className="mt-1 text-xs text-slate-500">
              Pilih gaya visual yang paling sesuai dengan bisnis Anda.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vibes.map((vibe) => {
                const selected = form.vibe === vibe.name;

                return (
                  <button
                    key={vibe.name}
                    type="button"
                    onClick={() => updateField("vibe", vibe.name)}
                    aria-pressed={selected}
                    className={`overflow-hidden rounded-xl border text-left transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-slate-200 bg-white hover:border-indigo-300"
                    }`}
                  >
                    <img
                      src={vibe.image}
                      alt={`${vibe.name} website design`}
                      className="h-36 w-full object-cover"
                    />
                    <div className="p-3">
                      <span className="block text-sm font-bold text-slate-800">
                        {vibe.name}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {vibe.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">

            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-sm font-extrabold text-indigo-600">03</span>
              <div>
                <h3 className="font-bold text-slate-900">Color Palette</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Choose a color combination that best represents your
                  business and the impression you want your website to convey.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {palettes.map((palette) => {
                const selected =
                  form.primaryColor === palette.primary &&
                  form.secondaryColor === palette.secondary;

                return (
                  <button
                    key={palette.name}
                    type="button"
                    onClick={() => {
                      updateField("primaryColor", palette.primary);
                      updateField("secondaryColor", palette.secondary);
                    }}
                    className={`rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-sm font-bold text-slate-800">
                      {palette.name}
                    </span>
                    <span className="mt-3 flex h-8 overflow-hidden rounded-lg border border-black/5">
                      {palette.colors.map((color, index) => (
                        <span
                          key={`${palette.name}-${index}`}
                          className="min-w-0 flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                    {selected && (
                      <span className="mt-2 block text-xs font-semibold text-indigo-600">
                        ✓ Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>


          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-sm font-bold text-slate-800">Live Preview</h4>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Preview website mengikuti vibe dan palet warna yang Anda pilih.
            </p>

            {(() => {
              const selectedVibe =
                vibes.find((vibe) => vibe.name === form.vibe) ?? vibes[0];

              return (
                <div
                  className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  style={{ color: form.secondaryColor }}
                >
                  <nav
                    className="flex items-center justify-between gap-3 px-4 py-4"
                    style={{
                      backgroundColor: form.secondaryColor,
                      color: "#FFFFFF",
                    }}
                  >
                    <span className="min-w-0 truncate text-sm font-extrabold">
                      {form.businessName || "Your Business"}
                    </span>
                    <span className="shrink-0 text-xs">Home　 About　 Contact</span>
                  </nav>

                  <img
                    key={selectedVibe.image}
                    src={selectedVibe.image}
                    alt={`Referensi desain ${selectedVibe.name}`}
                    className="block h-auto max-h-72 w-full object-cover object-top"
                  />

                  <div className="p-5 sm:p-7">
                    <p
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: form.primaryColor }}
                    >
                      {selectedVibe.name} Design
                    </p>

                    <h5 className="mt-3 text-2xl font-extrabold leading-tight">
                      {form.businessName || "Your Business"}, built around your vision.
                    </h5>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      A website designed to reflect your business, your style,
                      and what matters most to your customers.
                    </p>

                    <button
                      type="button"
                      className="mt-5 rounded-lg px-5 py-3 text-sm font-bold text-white"
                      style={{ backgroundColor: form.primaryColor }}
                    >
                      Discover More →
                    </button>

                    <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                      {["Quality", "Solutions", "Support"].map((item) => (
                        <div key={item} className="text-center">
                          <span
                            className="mx-auto mb-2 block h-1 w-8 rounded-full"
                            style={{ backgroundColor: form.primaryColor }}
                          />
                          <span className="text-xs font-semibold">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Create Project <span className="ml-2">→</span>
          </button>
        </div>
      </form>
    </section>
  );
}
