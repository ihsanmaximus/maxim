"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import SettingsPage from "@/components/settings/SettingsPage";
import Dashboard from "@/components/dashboard/Dashboard";
import ProjectsPage from "@/components/projects/ProjectsPage";
import WebsiteStructure from "@/components/structure/WebsiteStructure";
import ImageLibrary from "@/components/images/ImageLibrary";
import NavbarConfigurator from "@/components/configuration/NavbarConfigurator";
import ContactConfigurator from "@/components/configuration/ContactConfigurator";
import FooterConfigurator from "@/components/configuration/FooterConfigurator";
import HeroConfigurator from "@/components/configuration/HeroConfigurator";
import ConfigurationHome from "@/components/configuration/ConfigurationHome";
import ServicesConfigurator from "@/components/configuration/ServicesConfigurator";
import PortfolioConfigurator from "@/components/configuration/PortfolioConfigurator";
import FAQConfigurator from "@/components/configuration/FAQConfigurator";
import TestimonialsConfigurator from "@/components/configuration/TestimonialsConfigurator";
import AboutMeConfigurator from "@/components/configuration/AboutMeConfigurator";
import WebsitePreview from "@/components/preview/WebsitePreview";
import ExportPage from "@/components/export/ExportPage";
import ProjectSetup, {
  type ProjectFormData,
} from "@/components/project/ProjectSetup";
import {
  createProject,
  getProject,
  getActiveProjectId,
  setActiveProjectId,
  type StoredProject,
} from "@/lib/projects/projectStorage";

export default function Home() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState<StoredProject | null>(null);
  const [ready, setReady] = useState(false);
  const [activeConfigurationSection, setActiveConfigurationSection] = useState<string | null>(null);

  useEffect(() => {
    const activeId = getActiveProjectId();
    if (activeId) {
      const project = getProject(activeId);
      if (project) setFormData(project);
    }

    const savedSection = localStorage.getItem("maximus-active-section");
    const allowedSections = [
      "Dashboard",
      "Projects",
      "Project Setup",
      "Project Details",
      "Website Structure",
      "Configuration", "Navbar", "Hero", "Services",
      "Image Library",
      "Preview",
    "Export",
    "Settings",
    ];

    if (savedSection && allowedSections.includes(savedSection)) {
      setActiveSection(savedSection);
    }

    setReady(true);
  }, []);

  function navigate(section: string) {
    setSidebarOpen(false);

      setActiveSection(section);

    if (section === "Configuration") {
      setActiveConfigurationSection(null);
    }

    localStorage.setItem("maximus-active-section", section);
  }

  function handleProjectSubmit(data: ProjectFormData) {
    try {
      const project = createProject(data);
      setFormData(project);
      setActiveProjectId(project.id);
      navigate("Website Structure");
    } catch (error) {
      console.error("Failed to save project:", error);
      window.alert("Project could not be saved. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 md:pl-[260px]">
      <Sidebar
        activeSection={activeSection}
        onNavigate={navigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <section className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-[76px] items-center gap-4 border-b border-slate-700 bg-[#343a40] px-4 sm:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/20 text-xl text-white hover:bg-white/10 md:hidden"
          >
            ☰
          </button>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              MAXIM / WORKSPACE
            </p>
            <h1 className="mt-1 text-xl font-bold text-white">
              {activeSection}
            </h1>
          </div>
        
          <div className="ml-auto flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <span className="shrink-0 text-slate-400">Project Aktif:</span>
            <span className="max-w-[180px] truncate font-semibold text-white">
              {formData?.businessName || formData?.projectName || "Belum ada proyek"}
            </span>
          </div>
</header>

        <div className="mx-auto max-w-[1450px] p-4 sm:p-8 lg:p-10">
          {ready && activeSection === "Projects" && (
            <ProjectsPage
              onCreateProject={() => navigate("Project Setup")}
              onOpenProject={(project) => {
                setFormData(project);
                setActiveProjectId(project.id);
                navigate("Website Structure");
              }}
            />
          )}

          {ready && activeSection === "Dashboard" && (
            <Dashboard
              onCreateProject={() => navigate("Project Setup")}
              onViewProjects={() => navigate("Projects")}
              onOpenProject={(project) => {
                setFormData(project);
                setActiveProjectId(project.id);
                navigate("Website Structure");
              }}
            />
          )}

          {activeSection === "Project Setup" && (
            <ProjectSetup
              onSubmit={handleProjectSubmit}
              onCancel={() => navigate("Dashboard")}
            />
          )}

          {activeSection === "Website Structure" && (
            <WebsiteStructure
              key={formData?.id || "test-workspace"}
              projectId={formData?.id}
              projectName={formData?.projectName || "New Project"}
              onContinue={() => navigate("Configuration")}
            />
          )}

          {ready && activeSection === "Configuration" && formData && (
            activeConfigurationSection === null ? (
              <ConfigurationHome
                sections={(() => {
                  const saved = localStorage.getItem(
                    `maximus-project:${formData.id}:website-structure`
                  );
                  if (!saved) return [];
                  try {
                    const parsed = JSON.parse(saved);
                    const pages = Array.isArray(parsed) ? parsed : [];
                    const activePage = pages.find(
                      (page: { id?: string; active?: boolean }) => page.active
                    ) ?? pages[0];
                    if (!activePage) return [];
                    const ids: string[] = Array.isArray(activePage.structureOrder)
                      ? activePage.structureOrder
                      : [];
                    return ids
                      .filter((id) => id.startsWith("section:"))
                      .map((id) => {
                        const sectionId = id.slice("section:".length);
                        const section = (activePage.sections ?? []).find(
                          (item: { id?: string; name?: string; description?: string; enabled?: boolean }) =>
                            item.id === sectionId
                        );
                        if (!section || section.enabled === false) return null;
                        return {
                          id: section.id ?? sectionId,
                          name: section.name ?? sectionId,
                          description: section.description ?? "",
                        };
                      })
                      .filter(Boolean) as {
                        id: string;
                        name: string;
                        description: string;
                      }[];
                  } catch {
                    return [];
                  }
                })()}
                onOpenSection={(sectionId) => setActiveConfigurationSection(sectionId)}
              />

            ) : activeConfigurationSection.toLowerCase().includes("navbar") ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveConfigurationSection(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Kembali ke Configuration
                </button>
                <NavbarConfigurator
                  key={`navbar-${formData.id}`}
                  projectId={formData.id}
                />
              </div>
             ) : activeConfigurationSection.toLowerCase().includes("contact") ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveConfigurationSection(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Kembali ke Configuration
                </button>
                <ContactConfigurator
                  key={`contact-${formData.id}`}
                  projectId={formData.id}
                />
              </div>
            ) : activeConfigurationSection.toLowerCase().includes("footer") ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveConfigurationSection(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Back to Configuration
                </button>
                <FooterConfigurator
                  key={`footer-${formData.id}`}
                  projectId={formData.id}
                  primaryColor={formData.primaryColor}
                  secondaryColor={formData.secondaryColor}
                />
              </div>
            ) : activeConfigurationSection.toLowerCase().includes("hero") ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveConfigurationSection(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Kembali ke Configuration
                </button>
                <HeroConfigurator
                  key={`hero-${formData.id}`}
                  projectId={formData.id}
                  primaryColor={formData.primaryColor}
                  secondaryColor={formData.secondaryColor}
                />
              </div>
            ) : activeConfigurationSection.toLowerCase().includes("services") ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveConfigurationSection(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Kembali ke Configuration
                </button>
                <ServicesConfigurator
                  key={`services-${formData.id}`}
                  projectId={formData.id}
                  primaryColor={formData.primaryColor}
                  secondaryColor={formData.secondaryColor}
                />
              </div>
            ) : activeConfigurationSection.toLowerCase().includes("portfolio") || activeConfigurationSection.toLowerCase().includes("gallery") ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveConfigurationSection(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Kembali ke Configuration
                </button>
                <PortfolioConfigurator
                  key={`portfolio-${formData.id}`}
                  projectId={formData.id}
                  primaryColor={formData.primaryColor}
                  secondaryColor={formData.secondaryColor}
                />
              </div>
            ) : (activeConfigurationSection.toLowerCase().includes("about me") || activeConfigurationSection.toLowerCase() === "about") ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveConfigurationSection(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Kembali ke Configuration
                </button>
                <AboutMeConfigurator
                  key={`about-me-${formData.id}`}
                  projectId={formData.id}
                  primaryColor={formData.primaryColor}
                  secondaryColor={formData.secondaryColor}
                />
              </div>
            ) : activeConfigurationSection.toLowerCase().includes("testimonial") ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveConfigurationSection(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Kembali ke Configuration
                </button>
                <TestimonialsConfigurator
                  key={`testimonials-${formData.id}`}
                  projectId={formData.id}
                  primaryColor={formData.primaryColor}
                  secondaryColor={formData.secondaryColor}
                />
              </div>
            ) : activeConfigurationSection.toLowerCase().includes("faq") ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveConfigurationSection(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Kembali ke Configuration
                </button>
                <FAQConfigurator
                  key={`faq-${formData.id}`}
                  projectId={formData.id}
                  primaryColor={formData.primaryColor}
                  secondaryColor={formData.secondaryColor}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <button
                  type="button"
                  onClick={() => setActiveConfigurationSection(null)}
                  className="mb-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  ← Kembali ke Configuration
                </button>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeConfigurationSection}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Editor section ini akan dihubungkan pada tahap berikutnya.
                </p>
              </div>
            )
          )}

          {ready && activeSection === "Configuration" && !formData && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Select a project first
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Open an existing project from Dashboard or create a new one
                before configuring its website.
              </p>
              <button
                type="button"
                onClick={() => navigate("Dashboard")}
                className="mt-4 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {ready && activeSection === "Image Library" && (
            <ImageLibrary
              key={formData?.id || "no-project"}
              projectId={formData?.id}
              projectName={formData?.projectName || "New Project"}
            />
          )}

          {ready && activeSection === "Configuration" && !formData && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Select a project first
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Open an existing project from Dashboard or create a new one
                before configuring its website.
              </p>
              <button
                type="button"
                onClick={() => navigate("Dashboard")}
                className="mt-4 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {ready && activeSection === "Settings" && (
            <SettingsPage />
          )}

          {ready && activeSection === "Preview" && (
        <WebsitePreview
          key={formData?.id || "no-project"}
          projectId={formData?.id || ""}
          projectName={formData?.projectName || "Website Preview"}
          primaryColor={formData?.primaryColor}
          secondaryColor={formData?.secondaryColor}
          onBack={() => navigate("Website Structure")}
        />
      )}

      {ready && activeSection === "Export" && <ExportPage />}

      {activeSection === "Project Details" && formData && (
            <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Project Setup / Submitted
              </p>

              <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
                {formData.projectName}
              </h2>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500">
                    WEBSITE TYPE
                  </p>
                  <p className="mt-1 text-sm text-slate-800">
                    {formData.businessType}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500">
                    BUSINESS DESCRIPTION
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                    {formData.businessName || "No description provided."}
                  </p>
                </div>
              </div>

              <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                Project information is saved in this browser and can be
                reopened from the Dashboard.
              </p>

              <button
                type="button"
                onClick={() => navigate("Project Setup")}
                className="mt-6 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Back to Project Setup
              </button>
            </section>
          )}


        </div>
      </section>
    </main>
  );
}
