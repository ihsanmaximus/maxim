"use client";

import { useEffect, useRef, useState } from "react";
import {
  getProjectData,
  saveProjectData,
} from "@/lib/projects/projectStorage";
import {
  getProjectImages,
  type StoredImage,
} from "@/lib/projects/imageStorage";

type NavigationMode = "responsive" | "full" | "hamburger";
type LinkType = "section" | "page" | "url" | "email" | "phone";

type NavLink = {
  id: string;
  label: string;
  type: LinkType;
  target: string;
  enabled: boolean;
};

type ImageItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  createdAt: string;
};

type NavbarConfig = {
  version: 1;
  position: "static" | "fixed" | "auto-hide" | "floating";
  navigation: NavigationMode;
  breakpoint: number;
  logo: "image" | "text" | "both";
  logoText: string;
  logoImage: string;
  appearance: "solid" | "transparent";
  colorMode: "light" | "dark";
  links: NavLink[];
  ctaEnabled: boolean;
  ctaLabel: string;
  ctaTarget: string;
};

const LEGACY_STORAGE_KEY = "maximus-navbar-config";

function getStorageKey(projectId: string) {
  return `maximus-project:${projectId}:navbar-config`;
}

const initialConfig: NavbarConfig = {
  version: 1,
  position: "static",
  navigation: "responsive",
  breakpoint: 768,
  logo: "text",
  logoText: "Brand Name",
  logoImage: "",
  appearance: "solid",
  colorMode: "light",
  links: [
    { id: "link-home", label: "Home", type: "section", target: "#home", enabled: true },
    { id: "link-about", label: "About", type: "section", target: "#about", enabled: true },
    { id: "link-services", label: "Services", type: "section", target: "#services", enabled: true },
  ],
  ctaEnabled: true,
  ctaLabel: "Contact Us",
  ctaTarget: "#contact",
};

const selectClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500";

const buttonClass =
  "rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {children}
    </label>
  );
}

function loadConfig(projectId: string): NavbarConfig {
  if (typeof window === "undefined") return initialConfig;

  try {
    const saved =
      localStorage.getItem(getStorageKey(projectId)) ??
      localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!saved) return initialConfig;

    const parsed = JSON.parse(saved) as Partial<NavbarConfig>;

    return {
      ...initialConfig,
      ...parsed,
      links: Array.isArray(parsed.links) ? parsed.links : initialConfig.links,
    };
  } catch {
    return initialConfig;
  }
}

type NavbarConfiguratorProps = {
  projectId: string;
};

export default function NavbarConfigurator({
  projectId,
}: NavbarConfiguratorProps) {
  const [config, setConfig] = useState<NavbarConfig>(() =>
    loadConfig(projectId),
  );
  const [notice, setNotice] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [previewViewport, setPreviewViewport] =
    useState<"mobile" | "tablet" | "desktop">("desktop");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autoHideOpen, setAutoHideOpen] = useState(true);
  const [autoHideActivity, setAutoHideActivity] = useState(0);
  const [autoHideInteracting, setAutoHideInteracting] = useState(false);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    if (
      !fullPreviewOpen ||
      config.position !== "auto-hide" ||
      !autoHideOpen ||
      autoHideInteracting
    ) {
      return;
    }

    autoHideTimerRef.current = setTimeout(() => {
      setAutoHideOpen(false);
    }, 3000);

    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
    };
  }, [
    fullPreviewOpen,
    config.position,
    autoHideOpen,
    autoHideActivity,
    autoHideInteracting,
  ]);

  useEffect(() => {
    let cancelled = false;

    setConfig(loadConfig(projectId));
    setImages([]);
    setNotice("");

    async function loadImages() {
      try {
        const savedImages: StoredImage[] =
          await getProjectImages(projectId);

        if (!cancelled) {
          setImages(savedImages);
        }
      } catch (error) {
        console.error("Navbar image library load failed:", error);
        if (!cancelled) {
          setImages([]);
          setNotice("Galeri gagal dimuat. Coba buka pemilih logo lagi.");
        }
      }
    }

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  function update<K extends keyof NavbarConfig>(
    key: K,
    value: NavbarConfig[K],
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function updateLink(id: string, patch: Partial<NavLink>) {
    setConfig((current) => ({
      ...current,
      links: current.links.map((link) =>
        link.id === id ? { ...link, ...patch } : link,
      ),
    }));
    setNotice("");
  }

  function addLink() {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `link-${Date.now()}`;

    update("links", [
      ...config.links,
      {
        id,
        label: "New Link",
        type: "section",
        target: "#section",
        enabled: true,
      },
    ]);
  }

  function moveLink(index: number, direction: -1 | 1) {
    const next = [...config.links];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= next.length) return;

    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    update("links", next);
  }

  function saveConfig() {
    try {
      saveProjectData(projectId, "navbar-config", config);
      setNotice("Konfigurasi Navbar berhasil disimpan.");
    } catch {
      setNotice("Konfigurasi gagal disimpan.");
    }
  }

  const selectedImage = images.find(
    (image) => image.dataUrl === config.logoImage,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Maximus / Section Configuration
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
          Navbar Configuration
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Atur navigasi, branding, tautan, dan tombol CTA.
        </p>
      </header>

      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-7">
        <Field label="Navbar Position">
          <select
            className={selectClass}
            value={config.position}
            onChange={(e) =>
              update("position", e.target.value as NavbarConfig["position"])
            }
          >
            <option value="static">Static</option>
            <option value="fixed">Fixed</option>
            <option value="auto-hide">Auto-hide</option>
            <option value="floating">Floating</option>
          </select>
        </Field>

        <Field label="Navigation Behavior">
          <select
            className={selectClass}
            value={config.navigation}
            onChange={(e) =>
              update("navigation", e.target.value as NavigationMode)
            }
          >
            <option value="responsive">Auto Responsive (Recommended)</option>
            <option value="full">Always Full Navigation</option>
            <option value="hamburger">Always Hamburger</option>
          </select>
        </Field>

        <Field label="Responsive Breakpoint (px)">
          <select
            className={selectClass}
            value={config.breakpoint}
            onChange={(e) => update("breakpoint", Number(e.target.value))}
          >
            {[640, 768, 1024, 1280].map((size) => (
              <option key={size} value={size}>
                {size} px
              </option>
            ))}
          </select>
        </Field>

        <Field label="Logo Type">
          <select
            className={selectClass}
            value={config.logo}
            onChange={(e) =>
              update("logo", e.target.value as NavbarConfig["logo"])
            }
          >
            <option value="image">Image</option>
            <option value="text">Text</option>
            <option value="both">Image + Text</option>
          </select>
        </Field>

        {(config.logo === "text" || config.logo === "both") && (
          <Field label="Brand Text">
            <input
              className={selectClass}
              value={config.logoText}
              onChange={(e) => update("logoText", e.target.value)}
              placeholder="Brand Name"
            />
          </Field>
        )}

        {(config.logo === "image" || config.logo === "both") && (
          <div className="sm:col-span-2">
            <div className="text-sm font-semibold text-slate-700">
              Logo Image
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 p-4">
              {config.logoImage ? (
                <img
                  src={config.logoImage}
                  alt="Selected navbar logo"
                  className="h-16 w-24 rounded-lg border border-slate-200 bg-slate-50 object-contain p-2"
                />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-slate-300 text-2xl text-slate-400">
                  ◈
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-slate-800">
                  {selectedImage?.name ??
                    (config.logoImage
                      ? "Logo tersimpan dari URL atau sumber sebelumnya"
                      : "Belum ada logo dipilih")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Pilih gambar yang sudah diunggah ke Image Library proyek ini.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                    onClick={async () => {
                      try {
                        const savedImages = await getProjectImages(projectId);
                        setImages(savedImages);
                        setPickerOpen(true);
                      } catch (error) {
                        console.error("Navbar image picker failed:", error);
                        setNotice("Gagal memuat Image Library.");
                      }
                    }}
                  >
                    Pilih dari Image Library
                  </button>

                  {config.logoImage && (
                    <button
                      type="button"
                      className={buttonClass}
                      onClick={() => update("logoImage", "")}
                    >
                      Hapus pilihan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Field label="Appearance">
          <select
            className={selectClass}
            value={config.appearance}
            onChange={(e) =>
              update("appearance", e.target.value as NavbarConfig["appearance"])
            }
          >
            <option value="solid">Solid</option>
            <option value="transparent">Transparent</option>
          </select>
        </Field>

        <Field label="Color Mode">
          <select
            className={selectClass}
            value={config.colorMode}
            onChange={(e) =>
              update("colorMode", e.target.value as NavbarConfig["colorMode"])
            }
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Field>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">Navigation Links</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Tambah, edit, aktifkan, nonaktifkan, hapus, atau urutkan tautan.
            </p>
          </div>
          <button type="button" className={buttonClass} onClick={addLink}>
            + Add Link
          </button>
        </div>

        {config.links.map((link, index) => (
          <div
            key={link.id}
            className="space-y-3 rounded-xl border border-slate-200 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500">
                LINK {index + 1}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => moveLink(index, -1)}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => moveLink(index, 1)}
                  disabled={index === config.links.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                  onClick={() =>
                    update(
                      "links",
                      config.links.filter((item) => item.id !== link.id),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Label">
                <input
                  className={selectClass}
                  value={link.label}
                  onChange={(e) =>
                    updateLink(link.id, { label: e.target.value })
                  }
                />
              </Field>

              <Field label="Link Type">
                <select
                  className={selectClass}
                  value={link.type}
                  onChange={(e) => {
                    const type = e.target.value as LinkType;
                    const defaultTargets: Record<LinkType, string> = {
                      section: "#section",
                      page: "/page",
                      url: "https://",
                      email: "mailto:",
                      phone: "tel:",
                    };
                    updateLink(link.id, {
                      type,
                      target: defaultTargets[type],
                    });
                  }}
                >
                  <option value="section">Page Section</option>
                  <option value="page">Internal Page</option>
                  <option value="url">External URL</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </Field>

              <Field label="Target">
                <input
                  className={selectClass}
                  value={link.target}
                  onChange={(e) =>
                    updateLink(link.id, { target: e.target.value })
                  }
                  placeholder="Target destination"
                />
              </Field>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                Enabled
                <input
                  type="checkbox"
                  checked={link.enabled}
                  onChange={(e) =>
                    updateLink(link.id, { enabled: e.target.checked })
                  }
                  className="h-5 w-5 accent-indigo-600"
                />
              </label>
            </div>
          </div>
        ))}

        {config.links.length === 0 && (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Belum ada tautan. Gunakan Add Link untuk menambahkannya.
          </p>
        )}
      </section>

      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-7">
        <Field label="CTA Label">
          <input
            className={selectClass}
            value={config.ctaLabel}
            onChange={(e) => update("ctaLabel", e.target.value)}
            placeholder="Contact Us"
          />
        </Field>

        <Field label="CTA Target">
          <input
            className={selectClass}
            value={config.ctaTarget}
            onChange={(e) => update("ctaTarget", e.target.value)}
            placeholder="#contact, /contact, or URL"
          />
        </Field>

        <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 sm:col-span-2">
          Enable CTA Button
          <input
            type="checkbox"
            checked={config.ctaEnabled}
            onChange={(e) => update("ctaEnabled", e.target.checked)}
            className="h-5 w-5 accent-indigo-600"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">Configuration Preview</h3>
            <p className="mt-1 text-xs text-slate-500">
              Preview konfigurasi navbar saat ini.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPreviewViewport("desktop");
              setMobileMenuOpen(false);
              setAutoHideOpen(true);
              setAutoHideActivity((value) => value + 1);
              setFullPreviewOpen(true);
            }}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Preview Full Page ↗
          </button>
        </div>

        <div
          className={`mt-5 flex min-h-20 flex-wrap items-center justify-between gap-4 rounded-xl border p-4 ${
            config.colorMode === "dark"
              ? "border-slate-700 bg-slate-900 text-white"
              : "border-slate-200 bg-slate-50 text-slate-900"
          }`}
        >
          <strong className="flex items-center gap-2">
            {(config.logo === "image" || config.logo === "both") &&
              (config.logoImage ? (
                <img
                  src={config.logoImage}
                  alt="Brand logo"
                  className="h-8 max-w-24 object-contain"
                />
              ) : (
                <span>◈</span>
              ))}
            {config.logo !== "image" ? config.logoText || "Brand Name" : ""}
          </strong>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {config.links
              .filter((link) => link.enabled)
              .map((link) => (
                <span key={link.id}>{link.label}</span>
              ))}
          </nav>

          {config.ctaEnabled && (
            <span className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
              {config.ctaLabel || "CTA Button"}
            </span>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setConfig(initialConfig);
            setNotice("");
          }}
          className={buttonClass}
        >
          Reset Defaults
        </button>

        <button
          type="button"
          onClick={saveConfig}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Save Configuration
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
        >
          {notice}
        </p>
      )}

      {fullPreviewOpen && (
        <div className="fixed inset-0 z-[600] flex flex-col bg-slate-950">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 px-4 py-3 text-white">
            <div>
              <h2 className="font-bold">Full-Page Preview</h2>
              <p className="text-xs text-slate-400">
                Simulasi website berdasarkan konfigurasi navbar.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(["mobile", "tablet", "desktop"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPreviewViewport(size);
                    setMobileMenuOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${
                    previewViewport === size
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {size}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setFullPreviewOpen(false)}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900"
              >
                Kembali ke Konfigurasi ✕
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-slate-800 p-2 sm:p-5">
            <div
              style={{ containerType: "inline-size" }}
              className={`min-h-full overflow-x-hidden bg-white shadow-2xl ${
                previewViewport === "mobile"
                  ? "w-[390px] max-w-full"
                  : previewViewport === "tablet"
                    ? "w-[768px] max-w-full"
                    : "w-full"
              }`}
            >
              {(() => {
                const viewportWidth =
                  previewViewport === "mobile"
                    ? 390
                    : previewViewport === "tablet"
                      ? 768
                      : 1280;

                const links = config.links.filter((link) => link.enabled);

                const hamburger =
                  config.navigation === "hamburger" ||
                  (config.navigation === "responsive" &&
                    viewportWidth < config.breakpoint);

                const dark = config.colorMode === "dark";

                const navBackground =
                  config.appearance === "transparent"
                    ? "bg-transparent"
                    : dark
                      ? "bg-slate-950"
                      : "bg-white";

                const navText =
                  dark && config.appearance !== "transparent"
                    ? "text-white"
                    : "text-slate-900";

                const positionClass =
                  config.position === "fixed" ? "sticky top-0" : "";

                const getHref = (link: (typeof links)[number]) => {
                  const target = link.target?.trim() || "#home";

                  if (
                    link.type === "section" &&
                    !target.startsWith("#")
                  ) {
                    return `#${target}`;
                  }

                  return target;
                };

                return (
                  <div className="min-h-full bg-white text-slate-900">
                    {config.position === "auto-hide" && (
                      <div className="sticky top-0 z-50 h-0 overflow-visible">
                        <aside
                          id="maximus-auto-hide-sidebar"
                          onPointerEnter={() => setAutoHideInteracting(true)}
                          onPointerLeave={() => {
                            setAutoHideInteracting(false);
                            setAutoHideActivity((value) => value + 1);
                          }}
                          onFocusCapture={() => setAutoHideInteracting(true)}
                          onBlurCapture={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                              setAutoHideInteracting(false);
                              setAutoHideActivity((value) => value + 1);
                            }
                          }}
                          className={`pointer-events-auto absolute left-0 top-20 w-56 max-w-[80%] rounded-r-2xl border border-l-0 border-slate-200 bg-white text-slate-800 shadow-xl transition-transform duration-300 ease-out ${
                            autoHideOpen ? "translate-x-0" : "-translate-x-[calc(100%-28px)]"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                              Menu
                            </span>
                            <button
                              type="button"
                              aria-label={autoHideOpen ? "Sembunyikan menu" : "Buka menu"}
                              onClick={() => {
                                setAutoHideOpen((open) => !open);
                                setAutoHideInteracting(false);
                                setAutoHideActivity((value) => value + 1);
                              }}
                              className="rounded-lg px-2 py-1 text-lg font-bold hover:bg-emerald-50"
                            >
                              {autoHideOpen ? "‹" : "⋮"}
                            </button>
                          </div>
                          <nav aria-label="Menu sidebar" className="flex flex-col gap-1 p-2">
                            {links.map((link, index) => (
                              <a
                                key={link.id}
                                href={getHref(link)}
                                onClick={() => {
                                  setAutoHideOpen(false);
                                  setAutoHideInteracting(false);
                                  setAutoHideActivity((value) => value + 1);
                                }}
                                className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-800"
                              >
                                {link.label}
                              </a>
                            ))}
                            {config.ctaEnabled && (
                              <a
                                href={config.ctaTarget || "#contact"}
                                onClick={() => {
                                  setAutoHideOpen(false);
                                  setAutoHideInteracting(false);
                                  setAutoHideActivity((value) => value + 1);
                                }}
                                className="mt-1 rounded-lg bg-emerald-700 px-3 py-3 text-center text-sm font-semibold text-white"
                              >
                                {config.ctaLabel || "Hubungi Kami"}
                              </a>
                            )}
                          </nav>
                        </aside>
                      </div>
                    )}
                    <nav
                      className={`${config.position === "auto-hide" ? "hidden" : positionClass} z-20 ${navBackground} ${navText} ${
                        config.position === "floating"
                          ? "mx-3 mt-3 rounded-2xl shadow-lg"
                          : "border-b border-slate-200 shadow-sm"
                      }`}
                    >
                      <div className="flex min-h-[72px] items-center justify-between gap-4 px-5 py-3">
                        <a
                          href="#home"
                          className="flex min-w-0 items-center gap-3"
                        >
                          {(config.logo === "image" ||
                            config.logo === "both") &&
                            config.logoImage && (
                              <img
                                src={config.logoImage}
                                alt="Logo"
                                className="h-10 max-w-[120px] object-contain"
                              />
                            )}

                          {(config.logo === "text" ||
                            config.logo === "both") && (
                              <span className="truncate text-lg font-bold">
                                {config.logoText || "Brand"}
                              </span>
                            )}
                        </a>

                        {!hamburger && (
                          <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
                            {links.map((link, index) => (
                              <a
                                key={index}
                                href={getHref(link)}
                                className="text-sm font-medium hover:text-emerald-600"
                              >
                                {link.label}
                              </a>
                            ))}

                            {config.ctaEnabled && (
                              <a
                                href={config.ctaTarget || "#contact"}
                                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                              >
                                {config.ctaLabel || "Hubungi Kami"}
                              </a>
                            )}
                          </div>
                        )}

                        {hamburger && (
                          <button
                            type="button"
                            aria-label="Toggle navigation"
                            aria-expanded={mobileMenuOpen}
                            onClick={() =>
                              setMobileMenuOpen((open) => !open)
                            }
                            className="rounded-lg border border-current/20 px-3 py-2 text-xl"
                          >
                            {mobileMenuOpen ? "✕" : "☰"}
                          </button>
                        )}
                      </div>

                      {hamburger && mobileMenuOpen && (
                        <div className="border-t border-slate-200 px-5 py-3">
                          <div className="flex flex-col gap-1">
                            {links.map((link, index) => (
                              <a
                                key={index}
                                href={getHref(link)}
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-800"
                              >
                                {link.label}
                              </a>
                            ))}

                            {config.ctaEnabled && (
                              <a
                                href={config.ctaTarget || "#contact"}
                                onClick={() => setMobileMenuOpen(false)}
                                className="mt-2 rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white"
                              >
                                {config.ctaLabel || "Hubungi Kami"}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </nav>

                    <main>
                      <section
                        id="home"
                        className="flex min-h-[clamp(360px,65vh,680px)] scroll-mt-24 flex-col justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-[clamp(1.25rem,5%,4rem)] py-[clamp(3rem,8vh,6rem)]"
                      >
                        <p className="mb-4 text-[clamp(0.7rem,1.2vw,0.9rem)] font-bold uppercase tracking-[0.2em] text-emerald-700">
                          Website Preview
                        </p>
                        <h1 className="max-w-[14ch] text-[clamp(2rem,5.2cqw,4.5rem)] font-bold leading-[1.08] tracking-tight [overflow-wrap:anywhere]">
                          {config.logoText || "Nama Bisnis Anda"}
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                          Ini contoh tampilan website untuk menguji navbar,
                          navigasi, dan responsivitas sebelum website dirender.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                          <a
                            href="#services"
                            className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white"
                          >
                            Jelajahi Layanan
                          </a>
                          <a
                            href="#about"
                            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold"
                          >
                            Tentang Kami
                          </a>
                        </div>
                      </section>

                      <section
                        id="about"
                        className="scroll-mt-24 px-7 py-16 sm:px-12"
                      >
                        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                          Tentang Kami
                        </p>
                        <h2 className="mt-3 text-3xl font-bold">
                          Cerita dan nilai bisnis Anda
                        </h2>
                        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                          Bagian ini merupakan konten contoh untuk menguji
                          navigasi dari menu navbar menuju section yang dituju.
                        </p>
                      </section>

                      <section
                        id="services"
                        className="scroll-mt-24 bg-slate-50 px-7 py-16 sm:px-12"
                      >
                        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                          Layanan
                        </p>
                        <h2 className="mt-3 text-3xl font-bold">
                          Apa yang kami tawarkan
                        </h2>
                        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {["Layanan Pertama", "Layanan Kedua", "Layanan Ketiga"].map(
                            (item) => (
                              <article
                                key={item}
                                className="rounded-2xl border border-slate-200 bg-white p-6"
                              >
                                <div className="mb-4 h-10 w-10 rounded-xl bg-emerald-100" />
                                <h3 className="font-bold">{item}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                  Konten contoh untuk melihat susunan layout
                                  ketika lebar layar berubah.
                                </p>
                              </article>
                            )
                          )}
                        </div>
                      </section>

                      <section
                        id="contact"
                        className="scroll-mt-24 px-7 py-16 text-center sm:px-12"
                      >
                        <h2 className="text-3xl font-bold">
                          Mari terhubung
                        </h2>
                        <p className="mt-3 text-slate-600">
                          Uji tombol CTA dan navigasi kontak di sini.
                        </p>
                        <a
                          href={config.ctaTarget || "#home"}
                          className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white"
                        >
                          {config.ctaLabel || "Hubungi Kami"}
                        </a>
                      </section>
                    </main>

                    <footer className="bg-slate-950 px-7 py-8 text-sm text-white">
                      {config.logoText || "Brand"} · Footer contoh
                    </footer>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {pickerOpen && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => setPickerOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="navbar-image-picker-title"
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3
                  id="navbar-image-picker-title"
                  className="text-lg font-extrabold text-slate-900"
                >
                  Pilih Logo dari Image Library
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Gambar hanya diambil dari proyek aktif.
                </p>
              </div>

              <button
                type="button"
                className={buttonClass}
                onClick={() => setPickerOpen(false)}
              >
                Tutup
              </button>
            </div>

            {images.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <p className="font-semibold text-slate-700">
                  Image Library masih kosong.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Unggah gambar di Image Library terlebih dahulu, kemudian buka
                  pemilih ini kembali.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image) => (
                  <button
                    type="button"
                    key={image.id}
                    onClick={() => {
                      update("logoImage", image.dataUrl);
                      setPickerOpen(false);
                    }}
                    className={`overflow-hidden rounded-xl border text-left transition hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 ${
                      config.logoImage === image.dataUrl
                        ? "border-indigo-600 ring-2 ring-indigo-200"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex h-28 items-center justify-center bg-slate-50 p-2">
                      <img
                        src={image.dataUrl}
                        alt={image.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="truncate p-3 text-xs font-semibold text-slate-700">
                      {image.name}
                    </div>
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