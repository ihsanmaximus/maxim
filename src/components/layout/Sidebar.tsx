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
    items: [{ name: "Dashboard", icon: "dashboard" }],
  },
  {
    title: "WEBSITE BUILDER",
    items: [
      { name: "Project Setup", icon: "document" },
      { name: "Website Structure", icon: "layers" },
      { name: "Configuration", icon: "sliders" },
      { name: "Preview", icon: "eye" },
      { name: "Export", icon: "export" },
    ],
  },
  {
    title: "UTILITIES",
    items: [
      { name: "Image Library", icon: "image" },
      { name: "Projects", icon: "folder" },
    ],
  },
];

function MenuIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
          <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
          <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
          <rect x="14" y="14" width="6.5" height="6.5" rx="1" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path d="M6 3.5h8l4.5 4.5v12A1.5 1.5 0 0 1 17 21.5H6A1.5 1.5 0 0 1 4.5 20V5A1.5 1.5 0 0 1 6 3.5Z" />
          <path d="M14 3.8V8h4.2M8 12h7M8 16h7" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
        </svg>
      );
    case "sliders":
      return (
        <svg {...common}>
          <path d="M4 6h5m4 0h7M4 12h9m4 0h3M4 18h2m4 0h10" />
          <circle cx="11" cy="6" r="2" />
          <circle cx="15" cy="12" r="2" />
          <circle cx="8" cy="18" r="2" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.3-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.3 6.5-9.5 6.5S2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.7" />
        </svg>
      );
    case "export":
      return (
        <svg {...common}>
          <path d="M12 15V3m-4 4 4-4 4 4" />
          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="3.5" width="18" height="17" rx="2" />
          <circle cx="8.5" cy="9" r="1.5" />
          <path d="m4.5 17 5-5 3.5 3 3-3 3.5 4" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="m19.4 13.5 1.1.9-1.7 3-1.4-.5a7.7 7.7 0 0 1-1.6.9l-.2 1.5h-3.4l-.3-1.5a7.7 7.7 0 0 1-1.6-.9l-1.4.5-1.7-3 1.1-.9a7 7 0 0 1 0-1.8l-1.1-.9 1.7-3 1.4.5a7.7 7.7 0 0 1 1.6-.9l.3-1.5h3.4l.2 1.5a7.7 7.7 0 0 1 1.6.9l1.4-.5 1.7 3-1.1.9a7 7 0 0 1 0 1.8Z" transform="translate(-1 -1) scale(1.08)" />
        </svg>
      );
    case "about":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 7.5h.01" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
          <path d="M13 8l4 4-4 4M7 12h10" />
        </svg>
      );
    default:
      return null;
  }
}

function BrandMark() {
  return (
    <svg
      width="42"
      height="34"
      viewBox="0 0 84 64"
      fill="none"
      aria-label="Maximus logo"
      role="img"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="maximus-blue" x1="8" y1="8" x2="76" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="0.52" stopColor="#1677FF" />
          <stop offset="1" stopColor="#3435F5" />
        </linearGradient>
      </defs>
      <path
        d="M12 51 25 17c1.8-4.7 7.1-5.1 10-.7L43 30l8-13.7c2.8-4.8 8.2-4.4 10 .3L74 51"
        stroke="url(#maximus-blue)"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m32 18 11 18 11-18"
        stroke="#1476FF"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Sidebar({
  activeSection,
  onNavigate,
  isOpen,
  onClose,
}: SidebarProps) {
  const renderMenuItem = (item: { name: string; icon: string }) => {
    const active = activeSection === item.name;

    return (
      <button
        key={item.name}
        type="button"
        onClick={() => {
          onNavigate(item.name);
          onClose();
        }}
        aria-current={active ? "page" : undefined}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors duration-200 ${
          active
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-sm shadow-blue-950/20"
            : "text-slate-300/85 hover:bg-white/[0.06] hover:text-slate-100"
        }`}
      >
        <span className="grid w-6 shrink-0 place-items-center">
          <MenuIcon name={item.icon} />
        </span>
        <span>{item.name}</span>
      </button>
    );
  };

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.06] bg-[#06142f] text-slate-200 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.08] px-5 py-6">
          <BrandMark />
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold tracking-[0.16em] text-slate-100">
              MAXIMUS
            </h1>
            <p className="mt-1 text-[11px] tracking-wide text-slate-400">
              Connect Everyone
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

        {/* Main navigation: scrolls independently when the viewport is short */}
        <nav
          aria-label="Main navigation"
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-4"
        >
          {menuGroups.map((group, index) => (
            <div
              key={group.title}
              className={index === 0 ? "" : "mt-4 border-t border-white/25 pt-4"}
            >
              <div className="px-2 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400/80">
                {group.title}
              </div>
              <div className="flex flex-col gap-1">
                {group.items.map(renderMenuItem)}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom area stays below the main navigation; no divider above Settings */}
        <div className="shrink-0 px-3 pb-4 pt-5">
          <div className="flex flex-col gap-1">
            {renderMenuItem({ name: "Settings", icon: "settings" })}
            {renderMenuItem({ name: "About", icon: "about" })}
          </div>

          <div className="my-4 border-t border-white/20" />

          <div className="flex items-center gap-3 px-2 py-2">
            <img
              src="/images/profile-kang-ihsan.jpg"
              alt="Foto profil"
              className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">
                Kang Ihsan
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                Workspace Owner
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled
            title="Logout belum tersedia"
            className="mt-2 flex w-full cursor-not-allowed items-center gap-3 rounded-xl bg-white/[0.045] px-4 py-3 text-left text-sm text-slate-400/90"
          >
            <span className="grid w-6 shrink-0 place-items-center">
              <MenuIcon name="logout" />
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
