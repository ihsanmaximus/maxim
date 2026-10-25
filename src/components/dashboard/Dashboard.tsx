"use client";

import { useEffect, useState } from "react";
import {
  getProjects,
  type StoredProject,
} from "@/lib/projects/projectStorage";

type DashboardProps = {
  onCreateProject: () => void;
  onViewProjects: () => void;
  onOpenProject?: (project: StoredProject) => void;
};

export default function Dashboard({
  onCreateProject,
  onViewProjects,
  onOpenProject,
}: DashboardProps) {
  const [projects, setProjects] = useState<StoredProject[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-6 sm:p-9">
        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600">
            Website Creation Workspace
          </p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Build websites.
            <br />
            One section at a time.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
            Create client projects, configure visual styles, assemble website
            sections, and prepare your work for delivery.
          </p>
          <button
            type="button"
            onClick={onCreateProject}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            + Create Project
          </button>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 hidden h-64 w-64 rounded-full border-[35px] border-indigo-100 sm:block" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <p className="text-sm font-medium text-slate-500">Total Projects</p>
          <p className="mt-5 text-3xl font-extrabold text-slate-900">
            {projects.length}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Saved projects in this browser.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <p className="text-sm font-medium text-slate-500">Website Workflow</p>
          <p className="mt-5 text-xl font-extrabold text-slate-900">
            Modular Builder
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Each module is developed and tested separately.
          </p>
        </article>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              Recent Projects
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Pick up a website project and keep building.
            </p>
          </div>
          <button
            type="button"
            onClick={onViewProjects}
            className="rounded-lg px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50 sm:text-sm"
          >
            View All Projects →
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <h4 className="text-sm font-bold text-slate-800">No projects yet</h4>
            <p className="mt-2 text-xs text-slate-500">
              Create a project to start building your website.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
            {projects.slice(0, 4).map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onOpenProject?.(project)}
                disabled={!onOpenProject}
                className="group relative aspect-[3/4] min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-200 via-indigo-100 to-slate-300 text-left transition hover:shadow-lg disabled:cursor-not-allowed"
                aria-label={`Open project ${project.projectName}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-3 text-center">
                    <span className="text-3xl font-black text-slate-500/30 sm:text-5xl">
                      {(project.businessName || project.projectName).slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 flex min-h-[35%] flex-col justify-end bg-gradient-to-t from-black/80 via-black/65 to-transparent p-3 pt-8 sm:p-4 sm:pt-10">
                  <p className="line-clamp-2 text-sm font-extrabold leading-snug text-white sm:text-base">
                    {project.businessName || project.projectName}
                  </p>
                  <p className="mt-1 line-clamp-1 text-[10px] text-white/80 sm:text-xs">
                    {project.businessType || "Website"} · {project.vibe || "Custom"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
