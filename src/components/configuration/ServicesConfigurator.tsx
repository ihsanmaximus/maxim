"use client";

import { useEffect, useState } from "react";
import {
  getProjectData,
  saveProjectData,
} from "@/lib/projects/projectStorage";

type ServiceItem = {
  id: string;
  image: string;
  title: string;
  description: string;
};

type ServicesConfig = {
  eyebrow: string;
  title: string;
  description: string;
  items: ServiceItem[];
  desktopColumns: 2 | 3 | 4;
  mobileColumns: 1 | 2;
  visualType: "image" | "icon";
  imageRatio: "landscape" | "square";
  sectionBackground: string;
  cardBackground: string;
  titleColor: string;
  descriptionColor: string;
  accentColor: string;
  ribbonEnabled: boolean;
  ribbonTitle: string;
  ribbonDescription: string;
  ribbonButton: string;
  ribbonBackground: string;
  ribbonImage: string;
  paddingTop: number;
  paddingBottom: number;
  cardGap: number;
};

type Props = {
  projectId: string;
  primaryColor?: string;
  secondaryColor?: string;
};

const defaultItems: ServiceItem[] = [
  {
    id: "service-1",
    image: "",
    title: "Desain Rumah",
    description: "Desain rumah modern, minimalis, dan fungsional.",
  },
  {
    id: "service-2",
    image: "",
    title: "Desain Interior",
    description: "Interior yang nyaman dan estetis.",
  },
  {
    id: "service-3",
    image: "",
    title: "Bangun & Renovasi",
    description: "Pembangunan dan renovasi rumah terpercaya.",
  },
];

const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

function makeDefaults(
  primaryColor = "#14532D",
  secondaryColor = "#A16207",
): ServicesConfig {
  return {
    eyebrow: "LAYANAN KAMI",
    title: "Solusi Lengkap untuk Hunian Anda",
    description:
      "Kami menyediakan berbagai layanan profesional untuk mewujudkan rumah impian Anda, dari desain hingga pembangunan.",
    items: defaultItems.map((item) => ({ ...item })),
    desktopColumns: 3,
    mobileColumns: 1,
    visualType: "image",
    imageRatio: "landscape",
    sectionBackground: "#F8F7F0",
    cardBackground: "#FFFFFF",
    titleColor: primaryColor,
    descriptionColor: "#475569",
    accentColor: secondaryColor,
    ribbonEnabled: true,
    ribbonTitle: "Siap Memulai Proyek Rumah Impian Anda?",
    ribbonDescription:
      "Konsultasikan kebutuhan Anda dengan tim kami hari ini.",
    ribbonButton: "Hubungi Kami",
    ribbonBackground: primaryColor,
    ribbonImage: "",
    paddingTop: 80,
    paddingBottom: 80,
    cardGap: 24,
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>
      {multiline ? (
        <textarea
          className={`${inputClass} min-h-20 resize-y`}
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
    </div>
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
    <label className="block min-w-0">
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
        <input
          type="color"
          aria-label={label}
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="truncate text-xs text-slate-500">{value}</span>
      </div>
    </label>
  );
}

function Accordion({
  number,
  title,
  children,
  defaultOpen = false,
}: {
  number: string;
  title: string;
  children: import("react").ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
        <span>{number} · {title}</span>
        <span className="text-xs font-normal text-slate-400 group-open:hidden">
          Buka
        </span>
        <span className="hidden text-xs font-normal text-slate-400 group-open:inline">
          Tutup
        </span>
      </summary>
      <div className="space-y-4 border-t border-slate-100 p-4">
        {children}
      </div>
    </details>
  );
}

type ServiceCardProps = {
  item: ServiceItem;
  index: number;
  config: ServicesConfig;
};

function ServiceCard({ item, index, config }: ServiceCardProps) {
  return (
    <article
      className="min-w-0 overflow-hidden rounded-xl"
      style={{
        backgroundColor: config.cardBackground,
        color: config.descriptionColor,
      }}
    >
      {config.visualType === "image" && item.image && (
        <img
          src={item.image}
          alt={item.title}
          className={`w-full object-cover ${
            config.imageRatio === "square" ? "aspect-square" : "aspect-[16/9]"
          }`}
        />
      )}

      <div className="p-4 sm:p-5">
        {config.visualType === "icon" && (
          <div
            className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold"
            style={{
              backgroundColor: `${config.accentColor}18`,
              color: config.accentColor,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
        )}

        {config.visualType === "image" && !item.image && (
          <div
            className={`mb-4 flex w-full items-center justify-center rounded-lg text-xs ${
              config.imageRatio === "square" ? "aspect-square" : "aspect-[16/9]"
            }`}
            style={{
              backgroundColor: `${config.accentColor}12`,
              color: config.accentColor,
            }}
          >
            Gambar layanan {index + 1}
          </div>
        )}

        <h3 className="text-base font-bold" style={{ color: config.titleColor }}>
          {item.title || `Layanan ${index + 1}`}
        </h3>
        {item.description && (
          <p className="mt-2 text-sm leading-6">{item.description}</p>
        )}
      </div>
    </article>
  );
}

function DesktopServicesGrid({ config }: { config: ServicesConfig }) {
  const columnsClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[config.desktopColumns];

  return (
    <div
      className={`mt-8 grid ${columnsClass}`}
      style={{ gap: `${config.cardGap}px` }}
    >
      {config.items.map((item, index) => (
        <ServiceCard key={item.id} item={item} index={index} config={config} />
      ))}
    </div>
  );
}

function MobileServicesSlider({ config }: { config: ServicesConfig }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const columns = config.mobileColumns;
  const slides: { item: ServiceItem; index: number }[][] = [];

  for (let start = 0; start < config.items.length; start += columns) {
    slides.push(
      config.items.slice(start, start + columns).map((item, offset) => ({
        item,
        index: start + offset,
      })),
    );
  }

  const slideCount = slides.length;

  useEffect(() => {
    setActiveSlide((current) => (slideCount === 0 ? 0 : current % slideCount));
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slideCount);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [slideCount]);

  function changeSlideBySwipe(deltaX: number) {
    if (Math.abs(deltaX) < 45 || slideCount <= 1) return;
    setActiveSlide((current) =>
      deltaX < 0
        ? (current + 1) % slideCount
        : (current - 1 + slideCount) % slideCount,
    );
  }

  return (
    <div className="mt-8">
      <div
        className="overflow-hidden"
        onTouchStart={(event) => {
          event.currentTarget.dataset.startX = String(event.touches[0].clientX);
        }}
        onTouchEnd={(event) => {
          const startX = Number(event.currentTarget.dataset.startX);
          const endX = event.changedTouches[0]?.clientX ?? startX;
          changeSlideBySwipe(endX - startX);
        }}
      >
        <div
          className="flex items-stretch transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            <div key={`slide-${slideIndex}`} className="w-full shrink-0">
              <div
                className={`grid ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}
                style={{ gap: `${config.cardGap}px` }}
              >
                {slide.map(({ item, index }) => (
                  <div
                    key={item.id}
                    className={columns === 2 && slide.length === 1 ? "col-span-2" : "min-w-0"}
                  >
                    <ServiceCard item={item} index={index} config={config} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {slideCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              aria-label={`Buka slide ${index + 1}`}
              aria-current={activeSlide === index ? "true" : undefined}
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all ${
                activeSlide === index ? "w-6" : "w-2 bg-slate-300"
              }`}
              style={
                activeSlide === index
                  ? { backgroundColor: config.accentColor }
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ServicesConfigurator({
  projectId,
  primaryColor = "#14532D",
  secondaryColor = "#A16207",
}: Props) {
  const [config, setConfig] = useState<ServicesConfig>(() =>
    makeDefaults(primaryColor, secondaryColor),
  );
  const [loaded, setLoaded] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("Memuat konfigurasi...");

  useEffect(() => {
    const fallback = makeDefaults(primaryColor, secondaryColor);

    try {
      const saved = getProjectData<ServicesConfig | null>(
        projectId,
        "services-config",
        null,
      );

      setConfig(saved ? { ...fallback, ...saved } : fallback);
    } catch (error) {
      console.error("Gagal memuat Services Configurator:", error);
      setConfig(fallback);
    } finally {
      setLoaded(true);
    }
  }, [projectId, primaryColor, secondaryColor]);

  useEffect(() => {
    if (!loaded) return;

    try {
      saveProjectData(projectId, "services-config", config);
      setSaveStatus("Tersimpan");
    } catch (error) {
      console.error("Gagal menyimpan Services Configurator:", error);
      setSaveStatus("Gagal menyimpan");
    }
  }, [config, loaded, projectId]);

  function updateConfig<K extends keyof ServicesConfig>(
    key: K,
    value: ServicesConfig[K],
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function updateItem(
    id: string,
    key: keyof ServiceItem,
    value: string,
  ) {
    setConfig((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function addItem() {
    const id = `service-${Date.now()}`;

    setConfig((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id,
          image: "",
          title: `Layanan ${current.items.length + 1}`,
          description: "",
        },
      ],
    }));

    setEditingId(id);
  }

  function removeItem(id: string) {
    setConfig((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }));

    if (editingId === id) setEditingId(null);
  }

  const previewWidth =
    previewDevice === "mobile" ? "max-w-[390px]" : "max-w-full";


  return (
    <div className="space-y-6 text-slate-800">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            MAXIMUS · SECTION CONFIGURATOR
          </p>
          <h2 className="mt-2 text-2xl font-bold">Services Section</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Atur layanan, layout, warna, dan ribbon CTA website Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              saveStatus === "Tersimpan"
                ? "bg-emerald-500"
                : saveStatus === "Gagal menyimpan"
                  ? "bg-red-500"
                  : "bg-amber-400"
            }`}
          />
          {saveStatus}
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <Accordion number="01" title="Konten Section" defaultOpen>
            <Field
              label="Label kecil"
              value={config.eyebrow}
              onChange={(value) => updateConfig("eyebrow", value)}
              placeholder="LAYANAN KAMI"
            />

            <Field
              label="Judul section"
              value={config.title}
              onChange={(value) => updateConfig("title", value)}
              placeholder="Solusi Lengkap untuk Hunian Anda"
            />

            <Field
              label="Deskripsi section"
              value={config.description}
              onChange={(value) => updateConfig("description", value)}
              placeholder="Jelaskan layanan yang ditawarkan..."
              multiline
            />
          </Accordion>

          <Accordion number="02" title="Daftar Layanan">
            <p className="text-xs leading-5 text-slate-500">
              Tambahkan layanan, ubah deskripsi, dan masukkan URL gambar jika
              diperlukan.
            </p>

            <div className="space-y-3">
              {config.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 ${
                    editingId === item.id
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() =>
                        setEditingId(editingId === item.id ? null : item.id)
                      }
                    >
                      <span className="block truncate text-sm font-semibold">
                        {item.title || `Layanan ${index + 1}`}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {item.description || "Belum ada deskripsi"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>

                  {editingId === item.id && (
                    <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                      <Field
                        label="Nama layanan"
                        value={item.title}
                        onChange={(value) =>
                          updateItem(item.id, "title", value)
                        }
                        placeholder="Contoh: Desain Rumah"
                      />

                      <Field
                        label="Deskripsi layanan"
                        value={item.description}
                        onChange={(value) =>
                          updateItem(item.id, "description", value)
                        }
                        placeholder="Jelaskan manfaat layanan..."
                        multiline
                      />

                      <Field
                        label="URL gambar"
                        value={item.image}
                        onChange={(value) =>
                          updateItem(item.id, "image", value)
                        }
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="w-full rounded-xl border border-dashed border-emerald-400 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              + Tambah Layanan
            </button>
          </Accordion>

          <Accordion number="03" title="Layout & Gambar">
            <div>
              <label className={labelClass}>Kolom desktop</label>
              <div className="grid grid-cols-3 gap-2">
                {([2, 3, 4] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateConfig("desktopColumns", value)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${
                      config.desktopColumns === value
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-slate-200"
                    }`}
                  >
                    {value} kolom
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Kolom mobile</label>
              <div className="grid grid-cols-2 gap-2">
                {([1, 2] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateConfig("mobileColumns", value)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${
                      config.mobileColumns === value
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-slate-200"
                    }`}
                  >
                    {value} kolom
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Visual layanan</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "image", label: "Gambar" },
                  { value: "icon", label: "Ikon / nomor" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateConfig("visualType", option.value as "image" | "icon")
                    }
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${
                      config.visualType === option.value
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Rasio gambar</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "landscape", label: "Landscape" },
                  { value: "square", label: "Square" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateConfig(
                        "imageRatio",
                        option.value as "landscape" | "square",
                      )
                    }
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${
                      config.imageRatio === option.value
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </Accordion>

          <Accordion number="04" title="Warna & Jarak">
            <ColorField
              label="Latar section"
              value={config.sectionBackground}
              onChange={(value) => updateConfig("sectionBackground", value)}
            />

            <ColorField
              label="Latar kartu"
              value={config.cardBackground}
              onChange={(value) => updateConfig("cardBackground", value)}
            />

            <ColorField
              label="Warna judul"
              value={config.titleColor}
              onChange={(value) => updateConfig("titleColor", value)}
            />

            <ColorField
              label="Warna deskripsi"
              value={config.descriptionColor}
              onChange={(value) => updateConfig("descriptionColor", value)}
            />

            <ColorField
              label="Warna aksen"
              value={config.accentColor}
              onChange={(value) => updateConfig("accentColor", value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Padding atas (px)"
                value={String(config.paddingTop)}
                onChange={(value) =>
                  updateConfig("paddingTop", Math.max(0, Number(value) || 0))
                }
              />

              <Field
                label="Padding bawah (px)"
                value={String(config.paddingBottom)}
                onChange={(value) =>
                  updateConfig("paddingBottom", Math.max(0, Number(value) || 0))
                }
              />

              <Field
                label="Jarak kartu (px)"
                value={String(config.cardGap)}
                onChange={(value) =>
                  updateConfig("cardGap", Math.max(0, Number(value) || 0))
                }
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setConfig((current) => ({
                  ...current,
                  titleColor: primaryColor,
                  accentColor: secondaryColor,
                  ribbonBackground: primaryColor,
                }))
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Reset warna ke palet website
            </button>
          </Accordion>

          <Accordion number="05" title="Ribbon CTA">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <span>
                <span className="block text-sm font-semibold">
                  Aktifkan ribbon CTA
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Tampilkan ajakan menghubungi bisnis di bawah layanan.
                </span>
              </span>
              <input
                type="checkbox"
                checked={config.ribbonEnabled}
                onChange={(event) =>
                  updateConfig("ribbonEnabled", event.target.checked)
                }
                className="h-4 w-4 accent-emerald-700"
              />
            </label>

            <Field
              label="Judul ribbon"
              value={config.ribbonTitle}
              onChange={(value) => updateConfig("ribbonTitle", value)}
              placeholder="Siap Memulai Proyek Anda?"
            />

            <Field
              label="Deskripsi ribbon"
              value={config.ribbonDescription}
              onChange={(value) =>
                updateConfig("ribbonDescription", value)
              }
              placeholder="Ceritakan kebutuhan Anda..."
              multiline
            />

            <Field
              label="Teks tombol"
              value={config.ribbonButton}
              onChange={(value) => updateConfig("ribbonButton", value)}
              placeholder="Hubungi Kami"
            />

            <ColorField
              label="Warna latar ribbon"
              value={config.ribbonBackground}
              onChange={(value) =>
                updateConfig("ribbonBackground", value)
              }
            />

            <Field
              label="URL gambar ribbon (opsional)"
              value={config.ribbonImage}
              onChange={(value) => updateConfig("ribbonImage", value)}
              placeholder="https://..."
            />
          </Accordion>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Live Preview</h3>
              <p className="mt-1 text-xs text-slate-500">
                Perubahan ditampilkan langsung.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  previewDevice === "desktop"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  previewDevice === "mobile"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-5">
            <div
              className={`mx-auto overflow-hidden rounded-xl shadow-sm ${previewWidth}`}
              style={{ backgroundColor: config.sectionBackground }}
            >
              <section
                style={{
                  backgroundColor: config.sectionBackground,
                  paddingTop: `${config.paddingTop}px`,
                  paddingBottom: `${config.paddingBottom}px`,
                }}
                className="px-5 sm:px-8"
              >
                <div className="mx-auto max-w-5xl">
                  {config.eyebrow && (
                    <p
                      className="mb-3 text-center text-xs font-bold uppercase tracking-[0.18em]"
                      style={{ color: config.accentColor }}
                    >
                      {config.eyebrow}
                    </p>
                  )}

                  <h2
                    className="text-center text-2xl font-bold leading-tight sm:text-4xl"
                    style={{ color: config.titleColor }}
                  >
                    {config.title || "Layanan Kami"}
                  </h2>

                  {config.description && (
                    <p
                      className="mx-auto mt-4 max-w-2xl text-center text-sm leading-6 sm:text-base"
                      style={{ color: config.descriptionColor }}
                    >
                      {config.description}
                    </p>
                  )}

                  {previewDevice === "mobile" ? (
                    <MobileServicesSlider config={config} />
                  ) : (
                    <DesktopServicesGrid config={config} />
                  )}

                  {config.ribbonEnabled && (
                    <div
                      className="relative mt-10 overflow-hidden rounded-2xl p-6 text-white sm:p-8"
                      style={{
                        backgroundColor: config.ribbonBackground,
                      }}
                    >
                      {config.ribbonImage && (
                        <img
                          src={config.ribbonImage}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}

                      {config.ribbonImage && (
                        <div className="absolute inset-0 bg-black/45" />
                      )}

                      <div className="relative z-10">
                        <h3 className="text-xl font-bold leading-tight sm:text-2xl">
                          {config.ribbonTitle}
                        </h3>

                        {config.ribbonDescription && (
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
                            {config.ribbonDescription}
                          </p>
                        )}

                        {config.ribbonButton && (
                          <button
                            type="button"
                            className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:bg-slate-100"
                            style={{ color: config.ribbonBackground }}
                          >
                            {config.ribbonButton}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold">Ringkasan konfigurasi</h4>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
              <li>• Jumlah layanan: {config.items.length}</li>
              <li>
                • Kolom desktop: {config.desktopColumns} · Mobile:{" "}
                {config.mobileColumns}
              </li>
              <li>• Visual: {config.visualType}</li>
              <li>• Rasio gambar: {config.imageRatio}</li>
              <li>• Jarak kartu: {config.cardGap}px</li>
              <li>
                • Ribbon CTA: {config.ribbonEnabled ? "Aktif" : "Nonaktif"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
