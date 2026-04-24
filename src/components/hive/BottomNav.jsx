import { Link, useLocation } from 'react-router-dom';

const NAV = [
  { path: "/",            icon: "⬡", label: "HIVE"    },
  { path: "/brains",      icon: "◈", label: "BRAINS"  },
  { path: "/signals",     icon: "◎", label: "SIGNALS" },
  { path: "/trades",      icon: "⊞", label: "TRADES"  },
  { path: "/perf",        icon: "▲", label: "PERF"    },
  { path: "/analytics",   icon: "◑", label: "INTEL"   },
  { path: "/algorithms",  icon: "⧬", label: "ALGOS"   },
  { path: "/library",     icon: "⨳", label: "LIBRARY" },
  { path: "/correlations", icon: "◇", label: "RISK"   },
  { path: "/chat",        icon: "⦿", label: "CHAT"    },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-[#1a1a1a]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {NAV.map(item => {
          const active = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path}>
              <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all"
                style={{ background: active ? "#FFB81C15" : "transparent" }}>
                <span className="text-base" style={{ color: active ? "#FFB81C" : "#6b6860" }}>{item.icon}</span>
                <span className="text-[7px] font-bold tracking-widest" style={{ color: active ? "#FFB81C" : "#4a4a44" }}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}