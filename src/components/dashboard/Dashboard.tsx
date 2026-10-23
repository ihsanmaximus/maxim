type DashboardProps = {
  onCreateProject: () => void;
  onViewProjects: () => void;
};

export default function Dashboard({
  onCreateProject,
  onViewProjects,
}: DashboardProps) {
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
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Projects
            </p>
            <span className="text-xl text-indigo-600">▦</span>
          </div>

          <p className="mt-5 text-3xl font-extrabold text-slate-900">—</p>

          <p className="mt-2 text-xs text-slate-400">
            Project tracking will be connected later.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Website Workflow
            </p>
            <span className="text-xl text-indigo-600">◇</span>
          </div>

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
              Continue working on your website projects.
            </p>
          </div>

          <button
            type="button"
            onClick={onViewProjects}
            className="rounded-lg px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50 sm:text-sm"
          >
            View Projects →
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center sm:py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl text-indigo-600">
            +
          </div>

          <h4 className="mt-4 text-sm font-bold text-slate-800">
            No projects displayed
          </h4>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500 sm:text-sm">
            Your recent website projects will appear here after project
            management is implemented.
          </p>

          <button
            type="button"
            onClick={onCreateProject}
            className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Create your first project
          </button>
        </div>
      </section>
    </div>
  );
}
