"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Section = {
  id: string;
  name: string;
  enabled: boolean;
  global?: boolean;
};

const defaultSections: Section[] = [
  { id: "navbar", name: "Navbar", enabled: true, global: true },
  { id: "hero", name: "Hero", enabled: true },
  { id: "services", name: "Services", enabled: true },
  { id: "portfolio", name: "Portfolio", enabled: true },
  { id: "about", name: "About Us", enabled: true },
  { id: "testimonials", name: "Testimonials", enabled: true },
  { id: "pricing", name: "Pricing", enabled: true },
  { id: "faq", name: "FAQ", enabled: true },
  { id: "contact", name: "Contact", enabled: true },
  { id: "footer", name: "Footer", enabled: true, global: true },
];

type PageType = "content" | "integration";

type WebsitePage = {
  id: string;
  name: string;
  type: PageType;
  sections: Section[];
  integrations: string[];
  structureOrder: string[];
};

type Props = {
  projectName?: string;
  onContinue: () => void;
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-indigo-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

type SortableStructureItem = {
  id: string;
  name: string;
  kind: "section" | "integration";
  enabled: boolean;
  global?: boolean;
};

function SortableRow({
  item,
  onToggle,
  onRemove,
}: {
  item: SortableStructureItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid min-w-0 grid-cols-[32px_minmax(0,1fr)_auto_32px] items-center gap-2 rounded-xl border bg-white p-3 ${
        isDragging
          ? "z-10 border-indigo-400 shadow-lg"
          : "border-slate-200"
      } ${!item.enabled ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Geser ${item.name}`}
        className="flex h-10 w-8 shrink-0 touch-none flex-col items-center justify-center gap-1 rounded-lg text-slate-400 hover:bg-slate-100"
      >
        <span className="h-0.5 w-4 rounded bg-current" />
        <span className="h-0.5 w-4 rounded bg-current" />
        <span className="h-0.5 w-4 rounded bg-current" />
      </button>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">
          {item.name}
        </p>
        <span
          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide ${
            item.kind === "section"
              ? "bg-indigo-50 text-indigo-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {item.kind === "section" ? "SECTION" : "INTEGRASI"}
        </span>
      </div>

      {item.kind === "section" ? (
        <Toggle
          checked={item.enabled}
          onChange={onToggle}
          label={`Aktifkan ${item.name}`}
        />
      ) : (
        <span className="px-1 text-[10px] font-semibold text-emerald-700">
          Dipilih
        </span>
      )}

      <button
        type="button"
        onClick={item.global ? undefined : onRemove}
        disabled={item.global}
        aria-label={
          item.global
            ? `${item.name} tidak dapat dihapus`
            : `Hapus ${item.name}`
        }
        className={`relative rounded-lg p-2 ${
          item.global
            ? "cursor-not-allowed text-slate-400"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="mx-auto h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"
          />
        </svg>
        {item.global && (
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M3 21 21 3" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function WebsiteStructure({
  projectName = "Your Website",
  onContinue,
}: Props) {
  const [pages, setPages] = useState<WebsitePage[]>([
    {
      id: "home",
      name: "Home",
      type: "content",
      sections: defaultSections.map((section) => ({ ...section })),
      integrations: [],
      structureOrder: defaultSections.map((section) => `section:${section.id}`),
    },
  ]);
  const [activePageId, setActivePageId] = useState("home");
  const [activeTab, setActiveTab] = useState<"section" | "integration">("section");
  const [showAddPage, setShowAddPage] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<WebsitePage | null>(null);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "error">("success");
  const [noticeVisible, setNoticeVisible] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const noticeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function showNotification(
    message: string,
    type: "success" | "error" = "success",
  ) {
    noticeTimers.current.forEach(clearTimeout);
    noticeTimers.current = [];

    setNotice(message);
    setNoticeType(type);
    setNoticeVisible(true);

    noticeTimers.current.push(
      setTimeout(() => setNoticeVisible(false), 3000),
      setTimeout(() => setNotice(""), 3500),
    );
  }

  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];
  const sections = activePage.sections;

  function updateActiveSections(
    updater: (current: Section[]) => Section[],
  ) {
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === activePageId
          ? { ...page, sections: updater(page.sections) }
          : page,
      ),
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function createPage(name: string, type: PageType) {
    const cleanName = name.trim();
    if (!cleanName) {
      showNotification("Nama halaman harus diisi.", "error");
      return;
    }

    const newPage: WebsitePage = {
      id: `page-${Date.now()}`,
      name: cleanName,
      type,
      sections: type === "content"
        ? defaultSections
            .filter((section) => !section.global)
            .map((section) => ({ ...section }))
        : [],
      integrations: [],
      structureOrder:
        type === "content"
          ? defaultSections
              .filter((section) => !section.global)
              .map((section) => `section:${section.id}`)
          : [],
    };

    setPages((current) => [...current, newPage]);
    setActivePageId(newPage.id);
    setShowAddPage(false);
    setShowAvailable(false);
    showNotification(`Halaman ${cleanName} berhasil dibuat.`);
  }

  function removePage(id: string) {
    const page = pages.find((item) => item.id === id);
    if (!page || page.id === "home") return;

    setPageToDelete(page);
  }

  function confirmRemovePage() {
    if (!pageToDelete || pageToDelete.id === "home") return;

    const page = pageToDelete;
    const remainingPages = pages.filter((item) => item.id !== page.id);

    setPages(remainingPages);

    if (activePageId === page.id) {
      const nextPage = remainingPages[0];
      if (nextPage) setActivePageId(nextPage.id);
      setShowAvailable(false);
    }

    setPageToDelete(null);
    showNotification(`Halaman ${page.name} berhasil dihapus.`, "success");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPages((currentPages) =>
      currentPages.map((page) => {
        if (page.id !== activePageId) return page;

        const order = page.structureOrder;
        const oldIndex = order.indexOf(String(active.id));
        const newIndex = order.indexOf(String(over.id));

        if (oldIndex < 0 || newIndex < 0) return page;

        return {
          ...page,
          structureOrder: arrayMove(order, oldIndex, newIndex),
        };
      }),
    );
  }

  function toggleSection(id: string) {
    updateActiveSections((current) =>
      current.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  }

  function removeSection(id: string) {
    const section = sections.find((item) => item.id === id);
    if (!section || section.global) return;

    updateActiveSections((current) =>
      current.filter((item) => item.id !== id),
    );
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === activePageId
          ? {
              ...page,
              structureOrder: page.structureOrder.filter(
                (key) => key !== `section:${id}`,
              ),
            }
          : page,
      ),
    );
    showNotification(`Section ${section.name} berhasil dihapus.`, "error");
  }

  function addSection(id: string) {
    const section = defaultSections.find((item) => item.id === id);
    if (!section || section.global) return;

    const alreadyExists = sections.some((item) => item.id === id);
    if (alreadyExists) return;

    updateActiveSections((current) => [
      ...current.filter((item) => item.id !== "footer"),
      { ...section, enabled: true },
      ...current.filter((item) => item.id === "footer"),
    ]);

    setPages((currentPages) =>
      currentPages.map((page) => {
        if (page.id !== activePageId) return page;

        const order = page.structureOrder.filter(
          (key) => key !== `section:${id}`,
        );
        const footerIndex = order.indexOf("section:footer");

        if (footerIndex < 0) {
          order.push(`section:${id}`);
        } else {
          order.splice(footerIndex, 0, `section:${id}`);
        }

        return { ...page, structureOrder: order };
      }),
    );
  }

  function resetOrder() {
    updateActiveSections((current) => {
      const existingIds = new Set(current.map((item) => item.id));
      return defaultSections
        .filter((item) => existingIds.has(item.id))
        .map((item) => ({
          ...item,
          enabled: current.find((old) => old.id === item.id)?.enabled ?? true,
        }));
    });

    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === activePageId
          ? {
              ...page,
              structureOrder: [
                ...defaultSections
                  .filter((section) =>
                    page.sections.some((item) => item.id === section.id),
                  )
                  .map((section) => `section:${section.id}`),
                ...page.integrations.map((id) => `integration:${id}`),
              ],
            }
          : page,
      ),
    );
  }

  const availableSections = defaultSections.filter(
    (item) => !item.global && !sections.some((section) => section.id === item.id),
  );

  const integrationCatalog = [
    {
      id: "whatsapp",
      name: "WhatsApp Button",
      description: "Tombol kontak langsung melalui WhatsApp.",
      category: "Komunikasi",
      status: "Tersedia",
    },
    {
      id: "contact-form",
      name: "Contact Form",
      description: "Formulir untuk menerima pesan pelanggan.",
      category: "Komunikasi",
      status: "Tersedia",
    },
    {
      id: "maps",
      name: "Google Maps",
      description: "Tampilkan lokasi bisnis pada halaman website.",
      category: "Lokasi",
      status: "Segera Hadir",
    },
    {
      id: "analytics",
      name: "Analytics",
      description: "Rencana integrasi analitik pengunjung website.",
      category: "Analitik",
      status: "Segera Hadir",
    },
  ];

  const contentSections = sections.filter((item) => !item.global);
  const enabledCount = contentSections.filter((item) => item.enabled).length;
  const totalAvailable = defaultSections.filter((item) => !item.global).length;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Website Builder / Step 02
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Website Structure
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {projectName}
        </p>
      </div>

      {pageToDelete && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPageToDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-page-title"
            aria-describedby="delete-page-description"
            className="my-auto w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" />
              </svg>
            </div>

            <h3
              id="delete-page-title"
              className="mt-4 text-lg font-bold text-slate-900"
            >
              Hapus Halaman?
            </h3>

            <p
              id="delete-page-description"
              className="mt-2 break-words text-sm leading-6 text-slate-600"
            >
              Halaman <strong className="text-slate-800">"{pageToDelete.name}"</strong> beserta seluruh Section dan konfigurasi Integrasi di dalamnya akan dihapus.
            </p>

            <p className="mt-2 text-xs leading-5 text-red-600">
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setPageToDelete(null)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={confirmRemovePage}
                className="rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                Hapus Halaman
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pages Manager
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Kelola halaman website secara terpisah.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPage((value) => !value)}
            className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
          >
            + Tambah Page
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <div className="divide-y divide-slate-100">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`grid grid-cols-[minmax(0,1fr)_auto_36px] items-center gap-3 px-3 py-2.5 transition sm:gap-4 sm:px-4 ${
                  page.id === activePageId
                    ? "bg-indigo-50"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActivePageId(page.id);
                    setShowAvailable(false);
                    setNotice("");
                    setActiveTab("section");
                  }}
                  aria-pressed={page.id === activePageId}
                  className={`min-w-0 break-words py-1 text-left text-sm font-bold ${
                    page.id === activePageId
                      ? "text-indigo-700"
                      : "text-slate-700"
                  }`}
                >
                  {page.name}
                </button>

                <span className="whitespace-nowrap text-xs font-normal text-slate-400">
                  {page.type === "content" ? "Content" : "Integration"}
                </span>

                {page.id === "home" ? (
                  <span
                    className="flex h-9 w-9 items-center justify-center text-slate-300"
                    aria-label="Home tidak dapat dihapus"
                    title="Home tidak dapat dihapus"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <rect x="5" y="10" width="14" height="11" rx="2" />
                      <path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => removePage(page.id)}
                    aria-label={`Hapus halaman ${page.name}`}
                    title={`Hapus halaman ${page.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {showAddPage && (
          <form
            className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const data = new FormData(form);
              createPage(
                String(data.get("pageName") || ""),
                data.get("pageType") === "integration" ? "integration" : "content",
              );
              form.reset();
            }}
          >
            <h4 className="text-sm font-bold text-slate-900">
              Buat halaman baru
            </h4>

            <div>
              <label
                htmlFor="pageName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nama halaman
              </label>
              <input
                id="pageName"
                name="pageName"
                type="text"
                required
                maxLength={60}
                placeholder="Contoh: About Us atau Product Catalog"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-700">
                Jenis halaman
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input
                    type="radio"
                    name="pageType"
                    value="content"
                    defaultChecked
                    className="mt-1 accent-indigo-600"
                  />
                  <span>
                    <span className="block text-sm font-bold text-slate-800">
                      Page Content
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Halaman konten dengan section standar.
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input
                    type="radio"
                    name="pageType"
                    value="integration"
                    className="mt-1 accent-indigo-600"
                  />
                  <span>
                    <span className="block text-sm font-bold text-slate-800">
                      Page + Integration
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Untuk rencana integrasi fitur lanjutan. Belum dikembangkan.
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPage(false)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
              >
                Buat Page
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div
          role="tablist"
          aria-label="Pengaturan halaman"
          className={`mb-5 grid rounded-xl bg-slate-100 p-1 ${
            activePage.type === "integration" ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "section"}
            onClick={() => setActiveTab("section")}
            className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
              activeTab === "section"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Section
          </button>

          {activePage.type === "integration" && (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "integration"}
              onClick={() => setActiveTab("integration")}
              className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
                activeTab === "integration"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Integrasi
            </button>
          )}
        </div>

        {activeTab === "section" ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">
                Urutan Section
              </h3>
              <button
                type="button"
                onClick={resetOrder}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>

            <p className="mb-4 text-xs text-slate-500">
              Tahan garis tiga, lalu geser untuk mengubah urutan.
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sections.map((section) => (
                    <SortableRow
                      key={`section:${section.id}`}
                      item={{
                        id: `section:${section.id}`,
                        name: section.name,
                        kind: "section",
                        enabled: section.enabled,
                        global: section.global,
                      }}
                      onToggle={() => toggleSection(section.id)}
                      onRemove={() => removeSection(section.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              type="button"
              onClick={() => setShowAvailable((value) => !value)}
              className="mt-4 w-full rounded-xl border border-dashed border-indigo-300 px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50"
            >
              {showAvailable ? "− Tutup Tambah Section" : "+ Tambah Section"}
            </button>

            {showAvailable && (
              <div className="mt-3 space-y-2">
                {availableSections.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                    Semua section sudah digunakan.
                  </p>
                ) : (
                  availableSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => addSection(section.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      {section.name}
                      <span className="text-lg text-indigo-600">+</span>
                    </button>
                  ))
                )}
              </div>
            )}

            <div className="mt-5 rounded-xl bg-indigo-50 p-4">
              <p className="text-sm font-bold text-indigo-900">Ringkasan</p>
              <p className="mt-1 text-sm text-indigo-800">
                {enabledCount} section aktif dari {totalAvailable} section tersedia.
              </p>
              <p className="mt-1 text-xs text-indigo-700">
                Navbar dan Footer diatur terpisah dari jumlah section konten.
              </p>
            </div>
          </>
        ) : (
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Katalog Integrasi
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Pilih modul yang sesuai kebutuhan website. Katalog ini masih berupa pratinjau; koneksi layanan belum diaktifkan.
              </p>
            </div>

            <div className="space-y-3">
              {integrationCatalog.map((module) => {
                const selected = activePage.integrations.includes(module.id);
                const available = module.status === "Tersedia";

                return (
                  <div
                    key={module.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800">
                          {module.name}
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {module.description}
                        </p>
                        <p className="mt-2 text-[11px] text-slate-400">
                          {module.category}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                          available
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {module.status}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        setPages((currentPages) =>
                          currentPages.map((page) =>
                            page.id === activePageId
                              ? {
                                  ...page,
                                  integrations: selected
                                    ? page.integrations.filter((id) => id !== module.id)
                                    : [...page.integrations, module.id],
                                }
                              : page,
                          ),
                        );
                        showNotification(
                          selected
                            ? `${module.name} dihapus dari pilihan.`
                            : `${module.name} ditambahkan ke pilihan.`,
                          selected ? "error" : "success",
                        );
                      }}
                      className={`mt-3 w-full rounded-lg px-3 py-2.5 text-xs font-bold transition ${
                        !available
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : selected
                            ? "border border-indigo-200 bg-indigo-50 text-indigo-700"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {!available
                        ? "Segera Hadir"
                        : selected
                          ? "✓ Dipilih — Hapus Pilihan"
                          : "+ Pilih Modul"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-600">
                {activePage.integrations.length} modul dipilih
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Pilihan disimpan pada state halaman selama sesi ini. Aktivasi dan koneksi nyata belum tersedia.
              </p>
            </div>
          </div>
        )}

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed right-4 top-40 z-[100] flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur-sm transition-all duration-500 ease-in-out sm:right-6 ${
              noticeType === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
                : "border-red-200 bg-red-50/95 text-red-800"
            } ${
              noticeVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0 pointer-events-none"
            }`}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              noticeType === "success"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                {noticeType === "success" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
                ) : (
                  <path strokeLinecap="round" d="m7 7 10 10M17 7 7 17" />
                )}
              </svg>
            </span>
            <span className="min-w-0 flex-1">{notice}</span>
          </div>
        )}

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            Lanjut ke Configuration →
          </button>
        </div>
      </section>
    </div>
  );
}
