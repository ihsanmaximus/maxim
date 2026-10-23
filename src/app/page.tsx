"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import WebsiteStructure from "@/components/structure/WebsiteStructure";
import ProjectSetup, {
  type ProjectFormData,
} from "@/components/project/ProjectSetup";

export default function Home() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData | null>(null);

  function navigate(section: string) {
    setActiveSection(section);
    setSidebarOpen(false);
  }

  function handleProjectSubmit(data: ProjectFormData) {
    setFormData(data);
    setActiveSection("Website Structure");
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
        </header>

        <div className="mx-auto max-w-[1450px] p-4 sm:p-8 lg:p-10">
          {activeSection === "Dashboard" && (
            <Dashboard
              onCreateProject={() => navigate("Project Setup")}
              onViewProjects={() => navigate("Projects")}
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
              projectName={formData?.projectName || "New Project"}
              onContinue={() => navigate("Configuration")}
            />
          )}

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

              <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                The form works, but project saving has not been implemented
                yet. The submitted information currently remains in memory
                while this page is open.
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
