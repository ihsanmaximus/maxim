"use client";

type SidebarProps = {
  activeSection: string;
  onNavigate: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

const menuGroups = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Dashboard", icon: "▦" },
    ],
  },
  {
    title: "WEBSITE BUILDER",
    items: [
      { name: "Project Setup", icon: "01", step: 1 },
      { name: "Website Structure", icon: "02", step: 2 },
      { name: "Configuration", icon: "03", step: 3 },
      { name: "Preview", icon: "04", step: 4 },
      { name: "Export", icon: "05", step: 5 },
    ],
  },
  {
    title: "UTILITIES",
    items: [
      { name: "Image Library", icon: "▧" },
      { name: "Projects", icon: "▤" },
    ],
  },
];

export default function Sidebar({
  activeSection,
  onNavigate,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-slate-950 text-white transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold">
            M
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-extrabold tracking-[0.15em]">
              MAXIM
            </h1>
            <p className="mt-1 text-[10px] text-slate-400">
              WEBSITE WORKSPACE
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-auto rounded-lg px-2 py-1 text-lg text-slate-400 hover:bg-white/10 md:hidden"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-5 overflow-y-auto px-3 pb-4">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {group.title}
              </div>

              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = activeSection === item.name;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        onNavigate(item.name);
                        onClose();
                      }}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                        active
                          ? "bg-indigo-600 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="grid w-7 shrink-0 place-items-center text-sm font-bold">
                        {item.icon}
                      </span>
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 p-5">
          <p className="text-[10px] text-slate-500">INTERNAL WORKSPACE</p>
          <p className="mt-2 text-xs text-slate-400">MAXIM · V1.0</p>
        </div>
      </aside>
    </>
  );
}
