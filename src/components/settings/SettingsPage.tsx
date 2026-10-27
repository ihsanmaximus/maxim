"use client";

import { useEffect, useState } from "react";

type Preferences = {
  theme: string;
  accent: string;
  language: string;
  defaultLanguage: string;
  defaultColorMode: string;
  defaultPreview: string;
};

const initialPreferences: Preferences = {
  theme: "dark",
  accent: "blue",
  language: "id",
  defaultLanguage: "id",
  defaultColorMode: "light",
  defaultPreview: "desktop",
};

const themes = [
  { id: "blue", name: "Midnight Blue", color: "#3867ff", surface: "#07152f" },
  { id: "orange", name: "Dark Orange", color: "#f59e0b", surface: "#18181b" },
  { id: "emerald", name: "Dark Emerald", color: "#10b981", surface: "#08251f" },
  { id: "violet", name: "Dark Violet", color: "#8b5cf6", surface: "#1b1233" },
  { id: "lightblue", name: "Light Blue", color: "#3867ff", surface: "#f1f5f9" },
  { id: "lightemerald", name: "Light Emerald", color: "#059669", surface: "#f0fdf4" },
];

const futureItems = [
  { name: "Profile", description: "Manage your personal information." },
  { name: "Workspace", description: "Manage workspace identity and preferences." },
  { name: "Integrations", description: "Connect external services." },
  { name: "Notifications", description: "Manage application notifications." },
  { name: "Security", description: "Manage account security and access." },
  { name: "Team", description: "Manage team members and collaboration." },
];

function readPreferences(): Preferences {
  try {
    const saved = localStorage.getItem("maximus-settings");
    if (saved) return { ...initialPreferences, ...JSON.parse(saved) };
  } catch {
    // Fall back to defaults if stored preferences are invalid.
  }
  return initialPreferences;
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);
  const [savedPreferences, setSavedPreferences] = useState<Preferences>(initialPreferences);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("Appearance");

  useEffect(() => {
    const stored = readPreferences();
    setPreferences(stored);
    setSavedPreferences(stored);
    setLoaded(true);
  }, []);

  // Apply only committed preferences, never unsaved drafts.
  useEffect(() => {
    if (!loaded) return;

    document.documentElement.dataset.maximusTheme = savedPreferences.accent;
    document.documentElement.lang =
      savedPreferences.language === "id" ? "id" : "en";
  }, [savedPreferences, loaded]);

  const hasUnsavedChanges =
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  const update = (key: keyof Preferences, value: string) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const saveChanges = () => {
    try {
      localStorage.setItem("maximus-settings", JSON.stringify(preferences));
      setSavedPreferences({ ...preferences });
    } catch (error) {
      console.error("Failed to save Maximus settings:", error);
      window.alert("Settings could not be saved. Please try again.");
    }
  };

  const cancelChanges = () => {
    setPreferences({ ...savedPreferences });
  };

  const isEnglish = preferences.language === "en";
  const text = (id: string, en: string) => isEnglish ? en : id;

  const tabs = [
    "Appearance",
    "Language",
    "Builder Defaults",
    ...futureItems.map((item) => item.name),
  ];

  const soonTab = futureItems.some((item) => item.name === activeTab);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
          MAXIMUS / PREFERENCES
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {text("Settings", "Settings")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {text(
            "Atur preferensi Maximus dan pengaturan awal website Anda.",
            "Manage your Maximus preferences and website defaults."
          )}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">
        {tabs.map((tab) => {
          const soon = futureItems.some((item) => item.name === tab);
          return (
            <button
              key={tab}
              type="button"
              onClick={() => !soon && setActiveTab(tab)}
              disabled={soon}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-100"
              } ${soon ? "cursor-not-allowed opacity-75" : ""}`}
            >
              {tab}
              {soon && (
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-700">
                  SOON
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "Appearance" && (
        <div className="space-y-5">
          <SettingsCard
            title={text("Mode Tampilan", "Appearance Mode")}
            description={text(
              "Pilih tampilan antarmuka Maximus.",
              "Choose the Maximus interface appearance."
            )}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "light", label: "Light", detail: text("Terang", "Light") },
                { id: "dark", label: "Dark", detail: text("Gelap", "Dark") },
                { id: "system", label: "System", detail: text("Ikuti perangkat", "Follow device") },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => update("theme", mode.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    preferences.theme === mode.id
                      ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-800">{mode.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{mode.detail}</span>
                  {preferences.theme === mode.id && (
                    <span className="mt-3 block text-xs font-semibold text-indigo-600">
                      ✓ {text("Terpilih", "Selected")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </SettingsCard>

          <SettingsCard
            title={text("Kombinasi Warna Maximus", "Maximus Color Theme")}
            description={text(
              "Pilih identitas warna untuk antarmuka Maximus. Warna website proyek diatur secara terpisah.",
              "Choose Maximus interface colors. Project website colors are configured separately."
            )}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => update("accent", theme.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    preferences.accent === theme.id
                      ? "border-indigo-500 ring-2 ring-indigo-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className="flex h-20 items-end justify-between rounded-lg p-3"
                    style={{ backgroundColor: theme.surface }}
                  >
                    <span
                      className="h-3 w-12 rounded-full"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="h-6 w-6 rounded-lg border border-white/20"
                      style={{ backgroundColor: theme.color }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-700">{theme.name}</span>
                    {preferences.accent === theme.id && (
                      <span className="text-xs font-semibold text-indigo-600">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              {text(
                "Pilihan tema tersimpan. Penerapan warna ke seluruh komponen aplikasi akan mengikuti integrasi theme tokens.",
                "Theme preference is saved. Applying colors across every application component requires theme-token integration."
              )}
            </p>
          </SettingsCard>
        </div>
      )}

      {activeTab === "Language" && (
        <SettingsCard
          title={text("Bahasa Antarmuka", "Interface Language")}
          description={text(
            "Pilih bahasa untuk antarmuka Maximus. Ini tidak mengubah konten website proyek.",
            "Choose the Maximus interface language. This does not translate project website content."
          )}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { id: "id", label: "Bahasa Indonesia", sub: "Indonesia" },
              { id: "en", label: "English", sub: "English" },
            ].map((language) => (
              <button
                key={language.id}
                type="button"
                onClick={() => update("language", language.id)}
                className={`rounded-xl border p-4 text-left ${
                  preferences.language === language.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="block text-sm font-semibold text-slate-800">{language.label}</span>
                <span className="mt-1 block text-xs text-slate-500">{language.sub}</span>
                {preferences.language === language.id && (
                  <span className="mt-3 block text-xs font-semibold text-indigo-600">
                    ✓ {text("Bahasa aktif", "Active language")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </SettingsCard>
      )}

      {activeTab === "Builder Defaults" && (
        <SettingsCard
          title={text("Pengaturan Default Website", "Website Builder Defaults")}
          description={text(
            "Nilai ini digunakan sebagai preferensi awal saat membuat proyek baru.",
            "These preferences are intended as starting values for new projects."
          )}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              {text("Bahasa Website", "Website Language")}
              <select
                value={preferences.defaultLanguage}
                onChange={(e) => update("defaultLanguage", e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {text("Mode Warna Website", "Website Color Mode")}
              <select
                value={preferences.defaultColorMode}
                onChange={(e) => update("defaultColorMode", e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              {text("Tampilan Preview Default", "Default Preview")}
              <select
                value={preferences.defaultPreview}
                onChange={(e) => update("defaultPreview", e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
              >
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </label>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">
            {text(
              "Pengaturan ini tersimpan sebagai preferensi. Menghubungkannya otomatis ke pembuatan proyek baru adalah tahap integrasi berikutnya.",
              "These values are saved as preferences. Automatically applying them to newly created projects is a subsequent integration step."
            )}
          </p>
        </SettingsCard>
      )}

      {soonTab && (
        <SettingsCard
          title={activeTab}
          description={futureItems.find((item) => item.name === activeTab)?.description ?? ""}
        >
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <span className="inline-flex rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold tracking-wider text-amber-700">
              COMING SOON
            </span>
            <p className="mt-3 text-sm text-slate-500">
              {text(
                "Bagian ini sudah masuk rencana pengembangan Maximus dan akan diaktifkan pada tahap berikutnya.",
                "This feature is on the Maximus roadmap and will be implemented in a future phase."
              )}
            </p>
          </div>
        </SettingsCard>
      )}

      <div className="sticky bottom-0 z-10 -mx-1 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite">
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {text("Unsaved Changes", "Unsaved Changes")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {text("Semua perubahan tersimpan", "All changes saved")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelChanges}
              disabled={!hasUnsavedChanges}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {text("Cancel", "Cancel")}
            </button>

            <button
              type="button"
              onClick={saveChanges}
              disabled={!hasUnsavedChanges}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {text("Save Changes", "Save Changes")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
