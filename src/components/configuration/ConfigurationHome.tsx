"use client";

type ConfigurationSection = {
  id: string;
  name: string;
  description: string;
};

type ConfigurationHomeProps = {
  sections: ConfigurationSection[];
  onOpenSection: (sectionId: string) => void;
};

const SECTION_DETAILS: Record<string, { title: string; description: string }> = {
  navbar: {
    title: "Navbar",
    description: "Logo, menu navigasi, warna, gaya, dan sticky behavior.",
  },
  hero: {
    title: "Hero",
    description: "Judul utama, deskripsi, gambar, dan tombol CTA.",
  },
  about: {
    title: "About Us",
    description: "Profil, cerita, gambar, dan keunggulan bisnis.",
  },
  "about-us": {
    title: "About Us",
    description: "Profil, cerita, gambar, dan keunggulan bisnis.",
  },
  services: {
    title: "Services",
    description: "Layanan, fitur utama, dan deskripsi setiap layanan.",
  },
  portfolio: {
    title: "Portfolio",
    description: "Galeri proyek, gambar, deskripsi, dan layout.",
  },
  testimonials: {
    title: "Testimonials",
    description: "Testimoni pelanggan, kutipan, nama, dan foto.",
  },
  contact: {
    title: "Contact",
    description: "Informasi kontak, formulir, lokasi, dan peta.",
  },
  footer: {
    title: "Footer",
    description: "Logo, deskripsi, tautan, media sosial, dan copyright.",
  },
};

function normalizeId(value: string) {
  return value.toLowerCase().trim().replace(/[\s_]+/g, "-");
}

export default function ConfigurationHome({
  sections = [],
  onOpenSection,
}: ConfigurationHomeProps) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Website Builder
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Configuration
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Kelola konfigurasi setiap section yang telah disimpan dalam struktur website Anda.
        </p>
      </header>

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl text-emerald-700">
            +
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Belum ada section tersimpan
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Pilih section di Website Structure, lalu simpan struktur sebelum mulai mengatur tampilannya.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => {
            const key = normalizeId(section.id || section.name);
            const details = SECTION_DETAILS[key] ?? {
              title: section.name,
              description: section.description,
            };

            return (
              <article
                key={section.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:flex-row sm:items-center sm:p-5"
              >
                <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-emerald-800">
                  {details.title.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">
                    {details.title}
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {details.description || "Atur konten dan tampilan section ini."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenSection(section.id)}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Buka Konfigurasi
                  <span aria-hidden="true">›</span>
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
