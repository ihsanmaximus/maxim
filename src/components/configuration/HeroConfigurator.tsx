"use client";

import { useEffect, useState } from "react";
import {
  getProjectData,
  saveProjectData,
} from "@/lib/projects/projectStorage";
import {
  getProjectImages,
  type StoredImage,
} from "@/lib/projects/imageStorage";

type HeroLayout = "text-only" | "text-image" | "background-image" | "split-full-bleed";
type HeroImagePosition = "left" | "right" | "top" | "background";
type HeroAlignment = "left" | "center" | "right";
type HeroHeight = "compact" | "medium" | "large";
type HeroGradientTheme = "dark" | "light";
type HeroGradientPosition = "left" | "right";

type HeroConfig = {
  version: 1;
  layout: HeroLayout;
  eyebrow: string;
  headline: string;
  subheadline: string;
  eyebrowColor: string;
  headlineColor: string;
  descriptionColor: string;
  primaryCtaEnabled: boolean;
  primaryCtaLabel: string;
  primaryCtaTarget: string;
  secondaryCtaEnabled: boolean;
  secondaryCtaLabel: string;
  secondaryCtaTarget: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: HeroImagePosition;
  alignment: HeroAlignment;
  height: HeroHeight;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  gradientEnabled: boolean;
  gradientTheme: HeroGradientTheme;
  gradientPosition: HeroGradientPosition;
};

type HeroConfiguratorProps = {
  projectId: string;
  primaryColor?: string;
  secondaryColor?: string;
};

const createDefaultConfig = (
  primaryColor: string,
  secondaryColor: string,
): HeroConfig => ({
  version: 1,
  layout: "text-image",
  eyebrow: "",
  headline: "Bangun Sesuatu yang Luar Biasa",
  eyebrowColor: primaryColor || secondaryColor || "#047857",
  headlineColor: "#172033",
  descriptionColor: "#172033",
  subheadline:
    "Perkenalkan bisnis Anda dengan pesan yang jelas, menarik, dan mudah diingat.",
  primaryCtaEnabled: true,
  primaryCtaLabel: "Hubungi Kami",
  primaryCtaTarget: "#contact",
  secondaryCtaEnabled: false,
  secondaryCtaLabel: "Pelajari Lebih Lanjut",
  secondaryCtaTarget: "#about",
  imageUrl: "",
  imageAlt: "Gambar utama website",
  imagePosition: "right",
  alignment: "left",
  height: "large",
  backgroundColor: "#FFFFFF",
  textColor: "#172033",
  accentColor: primaryColor || secondaryColor || "#047857",
  gradientEnabled: true,
  gradientTheme: "dark",
  gradientPosition: "left",
});

export default function HeroConfigurator({
  projectId,
  primaryColor = "#047857",
  secondaryColor = "#172033",
}: HeroConfiguratorProps) {
  const [config, setConfig] = useState<HeroConfig>(() =>
    createDefaultConfig(primaryColor, secondaryColor),
  );
  const [loaded, setLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [libraryImages, setLibraryImages] = useState<StoredImage[]>([]);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);

  useEffect(() => {
    const fallback = createDefaultConfig(primaryColor, secondaryColor);
    const saved = getProjectData<HeroConfig | null>(
      projectId,
      "hero-config",
      null,
    );

    setConfig(saved ? { ...fallback, ...saved } : fallback);
    setLoaded(true);
  }, [projectId, primaryColor, secondaryColor]);

  useEffect(() => {
    if (!loaded) return;

    saveProjectData(projectId, "hero-config", config);
  }, [config, loaded, projectId]);

  function update<K extends keyof HeroConfig>(
    key: K,
    value: HeroConfig[K],
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  async function openImagePicker() {
    setLibraryLoading(true);
    setImagePickerOpen(true);

    try {
      const images = await getProjectImages(projectId);
      setLibraryImages(images);
    } catch (error) {
      console.error("Gagal memuat Image Library:", error);
      setLibraryImages([]);
    } finally {
      setLibraryLoading(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const labelClass = "block text-sm font-medium text-slate-700";

  const previewContent = (() => {
    const isTextOnly = config.layout === "text-only";
    const isBackground = config.layout === "background-image";
    const isSplit = config.layout === "split-full-bleed";
    const hasImage = Boolean(config.imageUrl);

    const heroHeight =
      config.height === "compact"
        ? "min-h-[360px]"
        : config.height === "medium"
          ? "min-h-[480px]"
          : "min-h-[600px]";

    const backgroundHeroHeight =
      config.height === "compact"
        ? "h-[480px] max-h-[480px] min-h-[480px]"
        : config.height === "medium"
          ? "h-[560px] max-h-[560px] min-h-[560px]"
          : "h-[640px] max-h-[640px] min-h-[640px]";

    const textContent = (
      <div
        className={`relative z-10 w-full ${
          isBackground
            ? "max-w-full md:max-w-[40%]"
            : "max-w-2xl"
        } ${
          config.alignment === "center"
            ? "mx-auto text-center"
            : config.alignment === "right"
              ? "ml-auto text-right"
              : "mr-auto text-left"
        }`}
      >
        {config.eyebrow.trim() && (
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-widest"
            style={{ color: config.eyebrowColor }}
          >
            {config.eyebrow}
          </p>
        )}

        <h1
          className="w-full max-w-[18ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-6xl [overflow-wrap:anywhere]"
          style={{ color: config.headlineColor }}
        >
          {config.headline}
        </h1>

        <p
          className="mt-5 w-full max-w-[42ch] text-base leading-relaxed opacity-90 sm:text-lg lg:text-xl"
          style={{ color: config.descriptionColor }}
        >
          {config.subheadline}
        </p>

        {(config.primaryCtaEnabled || config.secondaryCtaEnabled) && (
          <div
            className={`mt-7 flex flex-wrap gap-3 ${
              config.alignment === "center" ? "justify-center" : ""
            }`}
          >
            {config.primaryCtaEnabled && (
              <a
                href={config.primaryCtaTarget || "#contact"}
                onClick={(event) => event.preventDefault()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: config.accentColor }}
              >
                {config.primaryCtaLabel}
              </a>
            )}

            {config.secondaryCtaEnabled && (
              <a
                href={config.secondaryCtaTarget || "#about"}
                onClick={(event) => event.preventDefault()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold"
                style={{
                  borderColor: config.accentColor,
                  color: isBackground ? "#FFFFFF" : config.accentColor,
                }}
              >
                {config.secondaryCtaLabel}
              </a>
            )}
          </div>
        )}
      </div>
    );

    if (isBackground) {
      return (
        <div
          className={`relative isolate flex w-full ${heroHeight} items-center justify-center overflow-hidden`}
          style={{
            backgroundColor: config.backgroundColor,
            color: config.textColor,
          }}
        >
          {hasImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.imageUrl}
                alt={config.imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {config.gradientEnabled && (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 md:inset-y-0 md:w-[45%] ${
                    config.gradientPosition === "left" ? "left-0" : "right-0"
                  }`}
                  style={{
                    background:
                      config.gradientTheme === "dark"
                        ? config.gradientPosition === "left"
                          ? "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.48) 45%, rgba(0,0,0,0.18) 75%, rgba(0,0,0,0) 100%)"
                          : "linear-gradient(to left, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.48) 45%, rgba(0,0,0,0.18) 75%, rgba(0,0,0,0) 100%)"
                        : config.gradientPosition === "left"
                          ? "linear-gradient(to right, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.48) 45%, rgba(255,255,255,0.18) 75%, rgba(255,255,255,0) 100%)"
                          : "linear-gradient(to left, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.48) 45%, rgba(255,255,255,0.18) 75%, rgba(255,255,255,0) 100%)",
                  }}
                />
              )}
            </>
          )}
          <div className="relative z-10 w-full px-5 py-12 sm:px-10 lg:px-16">
            {textContent}
          </div>
        </div>
      );
    }

    if (isSplit) {
      return (
        <div
          className={`grid w-full ${heroHeight} overflow-hidden md:grid-cols-2`}
          style={{
            backgroundColor: config.backgroundColor,
            color: config.textColor,
          }}
        >
          <div
            className={`flex items-center px-6 py-12 sm:px-10 lg:px-14 ${
              config.imagePosition === "left"
                ? "md:order-2"
                : "md:order-1"
            }`}
          >
            {textContent}
          </div>

          <div
            className={`relative min-h-64 w-full overflow-hidden md:min-h-full ${
              config.imagePosition === "left"
                ? "md:order-1"
                : "md:order-2"
            }`}
          >
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.imageUrl}
                alt={config.imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center bg-slate-100 p-6 text-center text-sm text-slate-500">
                Pilih gambar untuk menampilkannya di sini.
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex w-full ${heroHeight} items-center ${
          config.alignment === "center" ? "justify-center text-center" : ""
        }`}
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
        }}
      >
        <div className="w-full px-5 py-12 sm:px-8 lg:px-12">
          {textContent}
          {!isTextOnly && (
            <div className="mt-8 w-full">
              {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.imageUrl}
                  alt={config.imageAlt}
                  className="h-auto max-h-[520px] w-full object-cover"
                />
              ) : (
                <div className="flex min-h-56 items-center justify-center bg-slate-100 p-6 text-center text-sm text-slate-500">
                  Pilih gambar untuk menampilkannya di sini.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  })();

  if (!loaded) {
    return <div className="p-6 text-sm text-slate-500">Memuat konfigurasi Hero...</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Hero Section</h2>
        <p className="mt-1 text-sm text-slate-500">
          Atur pesan utama, tombol, gambar, dan tampilan pembuka website.
          Perubahan disimpan otomatis untuk proyek ini.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <details open className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer list-none font-semibold text-slate-900">01 · Konten Hero<span className="float-right text-xs font-normal text-slate-400">Buka/tutup</span></summary>
            <div className="mt-4 space-y-5">
          <div>
            <label className={labelClass} htmlFor="hero-eyebrow">
              Eyebrow (opsional)
            </label>
            <input
              id="hero-eyebrow"
              value={config.eyebrow}
              onChange={(event) => update("eyebrow", event.target.value)}
              placeholder="Contoh: SOLUSI UNTUK BISNIS ANDA"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="hero-headline">
              Headline
            </label>
            <textarea
              id="hero-headline"
              rows={2}
              value={config.headline}
              onChange={(event) => update("headline", event.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="hero-subheadline">
              Subheadline
            </label>
            <textarea
              id="hero-subheadline"
              rows={3}
              value={config.subheadline}
              onChange={(event) => update("subheadline", event.target.value)}
              className={fieldClass}
            />
          </div>

            </div>
          </details>
          <details open className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer list-none font-semibold text-slate-900">02 · Layout & Gambar<span className="float-right text-xs font-normal text-slate-400">Buka/tutup</span></summary>
            <div className="mt-4 space-y-5">
          <div>
            <label className={labelClass} htmlFor="hero-layout">
              Layout
            </label>
            <select
              id="hero-layout"
              value={config.layout}
              onChange={(event) =>
                update("layout", event.target.value as HeroLayout)
              }
              className={fieldClass}
            >
              <option value="text-only">Text Only</option>
              <option value="text-image">Teks + gambar</option>
              <option value="background-image">Full Background</option>
              <option value="split-full-bleed">Split Full-Bleed</option>
            </select>
          </div>

          {config.layout !== "text-only" && (
            <>
              <div className="space-y-3">
                <label className={labelClass}>Gambar Hero</label>

                {config.imageUrl && (
                  <div className="rounded-xl border border-slate-200 p-3">
                    <img
                      src={config.imageUrl}
                      alt={config.imageAlt}
                      className="max-h-48 w-full rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => update("imageUrl", "")}
                      className="mt-2 text-sm font-semibold text-red-600"
                    >
                      Hapus gambar
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={openImagePicker}
                  className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  Pilih dari Image Library
                </button>

                <details className="rounded-xl border border-slate-200 p-3">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700">
                    Atau masukkan URL gambar
                  </summary>
                  <input
                    id="hero-image-url"
                    type="url"
                    value={config.imageUrl}
                    onChange={(event) => update("imageUrl", event.target.value)}
                    placeholder="https://..."
                    className={fieldClass}
                  />
                </details>
              </div>

              <div>
                <label className={labelClass} htmlFor="hero-image-alt">
                  Deskripsi gambar
                </label>
                <input
                  id="hero-image-alt"
                  value={config.imageAlt}
                  onChange={(event) => update("imageAlt", event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="hero-image-position">
                  Posisi gambar
                </label>
                <select
                  id="hero-image-position"
                  value={config.imagePosition}
                  onChange={(event) =>
                    update(
                      "imagePosition",
                      event.target.value as HeroImagePosition,
                    )
                  }
                  className={fieldClass}
                >
                  <option value="right">Kanan</option>
                  <option value="left">Kiri</option>
                  <option value="top">Atas</option>
                </select>
              </div>
            </>
          )}

            </div>
          </details>
          <details open className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer list-none font-semibold text-slate-900">03 · Gradasi Hero<span className="float-right text-xs font-normal text-slate-400">Buka/tutup</span></summary>
            <div className="mt-4 space-y-5">
          {config.layout === "background-image" && (
            <div className="space-y-4 rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">
                Gradasi Hero
              </h3>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={config.gradientEnabled}
                  onChange={(event) =>
                    update("gradientEnabled", event.target.checked)
                  }
                  className="h-4 w-4 accent-emerald-700"
                />
                Aktifkan gradasi
              </label>

              {config.gradientEnabled && (
                <>
                  <div>
                    <label className={labelClass} htmlFor="hero-gradient-theme">
                      Warna gradasi
                    </label>
                    <select
                      id="hero-gradient-theme"
                      value={config.gradientTheme}
                      onChange={(event) =>
                        update(
                          "gradientTheme",
                          event.target.value as HeroGradientTheme
                        )
                      }
                      className={fieldClass}
                    >
                      <option value="dark">Dark (hitam)</option>
                      <option value="light">Light (putih)</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="hero-gradient-position">
                      Posisi gradasi
                    </label>
                    <select
                      id="hero-gradient-position"
                      value={config.gradientPosition}
                      onChange={(event) =>
                        update(
                          "gradientPosition",
                          event.target.value as HeroGradientPosition
                        )
                      }
                      className={fieldClass}
                    >
                      <option value="left">Kiri</option>
                      <option value="right">Kanan</option>
                    </select>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-500">
                    Lebar gradasi 30% dari Hero. Opasitas 90% di awal,
                    70% pada posisi 70%, lalu transparan di ujung.
                  </p>
                </>
              )}
            </div>
          )}

            </div>
          </details>
          <details open className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer list-none font-semibold text-slate-900">04 · Alignment & Tinggi<span className="float-right text-xs font-normal text-slate-400">Buka/tutup</span></summary>
            <div className="mt-4 space-y-5">
          <div>
            <label className={labelClass} htmlFor="hero-alignment">
              Perataan teks
            </label>
            <select
              id="hero-alignment"
              value={config.alignment}
              onChange={(event) =>
                update("alignment", event.target.value as HeroAlignment)
              }
              className={fieldClass}
            >
              <option value="left">Kiri</option>
              <option value="center">Tengah</option>
              <option value="right">Kanan</option>
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="hero-height">
              Tinggi Hero
            </label>
            <select
              id="hero-height"
              value={config.height}
              onChange={(event) =>
                update("height", event.target.value as HeroHeight)
              }
              className={fieldClass}
            >
              <option value="compact">Compact</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

            </div>
          </details>
          <details open className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer list-none font-semibold text-slate-900">05 · CTA<span className="float-right text-xs font-normal text-slate-400">Buka/tutup</span></summary>
            <div className="mt-4 space-y-5">
          <div className="space-y-4 rounded-xl bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900">CTA utama</h3>

            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={config.primaryCtaEnabled}
                onChange={(event) =>
                  update("primaryCtaEnabled", event.target.checked)
                }
                className="h-4 w-4 accent-emerald-700"
              />
              Aktifkan CTA utama
            </label>

            {config.primaryCtaEnabled && (
              <>
                <input
                  aria-label="Label CTA utama"
                  value={config.primaryCtaLabel}
                  onChange={(event) =>
                    update("primaryCtaLabel", event.target.value)
                  }
                  className={fieldClass}
                  placeholder="Teks tombol"
                />
                <input
                  aria-label="Tujuan CTA utama"
                  value={config.primaryCtaTarget}
                  onChange={(event) =>
                    update("primaryCtaTarget", event.target.value)
                  }
                  className={fieldClass}
                  placeholder="#contact atau URL"
                />
              </>
            )}

            <h3 className="pt-2 font-semibold text-slate-900">CTA sekunder</h3>

            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={config.secondaryCtaEnabled}
                onChange={(event) =>
                  update("secondaryCtaEnabled", event.target.checked)
                }
                className="h-4 w-4 accent-emerald-700"
              />
              Aktifkan CTA sekunder
            </label>

            {config.secondaryCtaEnabled && (
              <>
                <input
                  aria-label="Label CTA sekunder"
                  value={config.secondaryCtaLabel}
                  onChange={(event) =>
                    update("secondaryCtaLabel", event.target.value)
                  }
                  className={fieldClass}
                  placeholder="Teks tombol"
                />
                <input
                  aria-label="Tujuan CTA sekunder"
                  value={config.secondaryCtaTarget}
                  onChange={(event) =>
                    update("secondaryCtaTarget", event.target.value)
                  }
                  className={fieldClass}
                  placeholder="#about atau URL"
                />
              </>
            )}
          </div>

            </div>
          </details>
          <details open className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer list-none font-semibold text-slate-900">06 · Warna Tipografi<span className="float-right text-xs font-normal text-slate-400">Buka/tutup</span></summary>
            <div className="mt-4 space-y-5">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Warna Tipografi
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Atur warna setiap elemen teks secara terpisah.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="text-sm text-slate-700">
                Eyebrow
                <input
                  type="color"
                  value={config.eyebrowColor}
                  onChange={(event) =>
                    update("eyebrowColor", event.target.value)
                  }
                  aria-label="Warna Eyebrow"
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-200"
                />
              </label>

              <label className="text-sm text-slate-700">
                Headline
                <input
                  type="color"
                  value={config.headlineColor}
                  onChange={(event) =>
                    update("headlineColor", event.target.value)
                  }
                  aria-label="Warna Headline"
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-200"
                />
              </label>

              <label className="text-sm text-slate-700">
                Description
                <input
                  type="color"
                  value={config.descriptionColor}
                  onChange={(event) =>
                    update("descriptionColor", event.target.value)
                  }
                  aria-label="Warna Description"
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-200"
                />
              </label>
            </div>
          </div>

            </div>
          </details>
          <details open className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer list-none font-semibold text-slate-900">07 · Warna Hero<span className="float-right text-xs font-normal text-slate-400">Buka/tutup</span></summary>
            <div className="mt-4 space-y-5">
          <div className="space-y-4 rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900">Warna Hero</h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-sm text-slate-700">
                Latar
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(event) =>
                    update("backgroundColor", event.target.value)
                  }
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-200"
                />
              </label>

              <label className="text-sm text-slate-700">
                Teks
                <input
                  type="color"
                  value={config.textColor}
                  onChange={(event) => update("textColor", event.target.value)}
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-200"
                />
              </label>

              <label className="text-sm text-slate-700">
                Aksen / CTA
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(event) =>
                    update("accentColor", event.target.value)
                  }
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-200"
                />
              </label>
            </div>
          </div>
            </div>
          </details>
        </section>

        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900">Live Preview</h3>
            <button
              type="button"
              onClick={() => setShowPreview((value) => !value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              {showPreview ? "Sembunyikan preview" : "Tampilkan preview"}
            </button>
          </div>

          {showPreview && (
            <div
              className={
                config.layout === "background-image" ||
                config.layout === "split-full-bleed"
                  ? "w-full overflow-hidden"
                  : "w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              }
            >
              {previewContent}
            </div>
          )}

          <p className="text-xs leading-relaxed text-slate-500">
            Preview ini menampilkan komposisi Hero secara responsif. Integrasi
            dengan renderer website final dan Image Library dilakukan pada
            tahap integrasi berikutnya.
          </p>
        </section>
      </div>

      {imagePickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pilih gambar Hero"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setImagePickerOpen(false);
            }
          }}
        >
          <section className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Image Library
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pilih gambar untuk Hero proyek ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImagePickerOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Tutup
              </button>
            </div>

            {libraryLoading ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Memuat gambar...
              </p>
            ) : libraryImages.length === 0 ? (
              <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                Belum ada gambar di Image Library proyek ini. Unggah gambar
                melalui halaman Image Library, lalu kembali ke Hero.
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {libraryImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => {
                      update("imageUrl", image.dataUrl);
                      setImagePickerOpen(false);
                    }}
                    className="overflow-hidden rounded-xl border border-slate-200 text-left transition hover:border-emerald-600 hover:ring-2 hover:ring-emerald-100"
                  >
                    <img
                      src={image.dataUrl}
                      alt={image.name}
                      className="h-32 w-full bg-slate-50 object-contain p-2"
                    />
                    <span className="block truncate px-3 py-2 text-xs font-medium text-slate-700">
                      {image.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
