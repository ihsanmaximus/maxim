"use client";

import { useEffect, useMemo, useState } from "react";
import {
  deleteProject,
  getProjects,
  type StoredProject,
} from "@/lib/projects/projectStorage";

type ProjectsPageProps = {
  onOpenProject: (project: StoredProject) => void;
  onCreateProject: () => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function Thumbnail({ project }: { project: StoredProject }) {
  const palettes: Record<string, string> = {
    Modern: "from-indigo-100 via-white to-violet-200",
    Minimal: "from-stone-100 via-white to-slate-200",
    Elegant: "from-amber-100 via-white to-rose-100",
    Premium: "from-slate-800 via-slate-700 to-indigo-950",
    Natural: "from-emerald-100 via-white to-lime-100",
  };

  const vibe = project.vibe || "Modern";
  const palette =
    palettes[vibe] || "from-indigo-100 via-white to-slate-200";

  return (
    <div
      className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${palette}`}
    >
      <div className="absolute left-4 right-4 top-3 flex items-center justify-between">
        <span className="max-w-[65%] truncate text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
          {project.businessName || project.projectName}
        </span>
        <span className="h-1.5 w-8 rounded-full bg-indigo-400/70" />
      </div>

      <div className="relative z-10 w-[72%] text-center">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-indigo-400/70" />
        <div className="text-xl font-extrabold tracking-tight text-slate-800">
          {project.projectName}
        </div>
        <p className="mt-2 text-[10px] text-slate-500">
          {project.businessType || "Website Preview"}
        </p>
        <div className="mx-auto mt-4 h-5 w-16 rounded-md bg-indigo-500/80" />
      </div>

      <div className="absolute -bottom-12 -right-6 h-32 w-32 rounded-full border-[18px] border-white/40" />

      <span className="absolute bottom-3 left-3 rounded-md bg-white/80 px-2 py-1 text-[9px] font-bold text-slate-500">
        PREVIEW
      </span>
    </div>
  );
}

export default function ProjectsPage({
  onOpenProject,
  onCreateProject,
}: ProjectsPageProps) {
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  function refreshProjects() {
    setProjects(getProjects());
  }

  useEffect(() => {
    refreshProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return projects;

    return projects.filter((project) =>
      [
        project.projectName,
        project.businessName,
        project.businessType,
        project.vibe,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [projects, query]);

  function handleDelete(project: StoredProject) {
    const confirmed = window.confirm(
      `Delete "${project.projectName}"?\n\nThis will remove the project and its project-specific saved settings from this browser.`,
    );

    if (!confirmed) return;

    try {
      const deleted = deleteProject(project.id);

      if (deleted) {
        refreshProjects();
      } else {
        window.alert("Project could not be deleted. Please refresh and try again.");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      window.alert("An error occurred while deleting the project.");
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600">
            Workspace Library
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Your Projects
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage your website projects and continue where you left off.
          </p>
          <p className="mt-3 text-xs font-semibold text-slate-400">
            {projects.length} project{projects.length === 1 ? "" : "s"} saved
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateProject}
          className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          + Create Project
        </button>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:max-w-md">
          <span className="text-lg text-slate-400">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects or businesses..."
            aria-label="Search projects"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              view === "grid"
                ? "bg-indigo-600 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            ▦ Grid
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              view === "list"
                ? "bg-indigo-600 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            ☰ List
          </button>
        </div>
      </section>

      {filteredProjects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
            {query ? "⌕" : "▧"}
          </div>
          <h3 className="mt-4 font-bold text-slate-900">
            {query ? "No matching projects" : "No projects yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {query
              ? "Try another project name or business keyword."
              : "Create your first project to start building a website."}
          </p>
          {!query && (
            <button
              type="button"
              onClick={onCreateProject}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            >
              + Create Project
            </button>
          )}
        </section>
      ) : view === "grid" ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenProject(project)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenProject(project);
                }
              }}
              className="cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Thumbnail project={project} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-extrabold text-slate-900">
                      {project.projectName}
                    </h3>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {project.businessName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); handleDelete(project); }}
                    aria-label={`Delete ${project.projectName}`}
                    title="Delete project"
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    🗑
                  </button>
                </div>

                <p className="mt-3 truncate text-xs text-slate-500">
                  {project.businessType} · {project.vibe}
                </p>

                <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                  <p>Created: {formatDate(project.createdAt)}</p>
                  <p>Updated: {formatDate(project.updatedAt)}</p>
                </div>

              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="space-y-3">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="w-full shrink-0 overflow-hidden rounded-xl sm:w-40">
                <Thumbnail project={project} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-extrabold text-slate-900">
                  {project.projectName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {project.businessName}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {project.businessType} · {project.vibe}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  Created: {formatDate(project.createdAt)} · Updated:{" "}
                  {formatDate(project.updatedAt)}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onOpenProject(project)}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700 sm:flex-none"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project)}
                  aria-label={`Delete ${project.projectName}`}
                  title="Delete project"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  🗑
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
