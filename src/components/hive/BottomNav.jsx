import { Link, useLocation } from 'react-router-dom';

const NAV = [
  { path: "/",             icon: "⬡", label: "HIVE"    },
  { path: "/brains",       icon: "◈", label: "BRAINS"  },
  { path: "/signals",      icon: "◎", label: "SIGNALS" },
  { path: "/trades",       icon: "⊞", label: "TRADES"  },
  { path: "/perf",         icon: "▲", label: "PERF"    },
  { path: "/heatmap",      icon: "◉", label: "HEAT"    },
  { path: "/alpha",        icon: "⚡", label: "ALPHA"  },
  { path: "/analytics",    icon: "◑", label: "INTEL"   },
  { path: "/algorithms",   icon: "⧬", label: "ALGOS"   },
  { path: "/library",      icon: "⨳", label: "LIBRARY" },
  { path: "/correlations", icon: "◇", label: "RISK"    },
  { path: "/chat",         icon: "⦿", label: "CHAT"    },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(to top, #0B0905 85%, rgba(11,9,5,0.92) 100%)',
        borderTop: '1px solid #2B2216',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Thin gold accent line at top edge */}
      <div style={{
        position: 'absolute',
        top: -1,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(to right, transparent 0%, rgba(200,137,42,0.35) 30%, rgba(200,137,42,0.55) 50%, rgba(200,137,42,0.35) 70%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div className="flex items-center justify-around px-1 py-1.5">
        {NAV.map(item => {
          const active = item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path}>
              <div
                className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition-all duration-200 active:scale-90"
                style={{
                  background: active ? 'rgba(200,137,42,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(200,137,42,0.2)' : '1px solid transparent',
                }}
              >
                <span
                  className="text-base leading-none"
                  style={{ color: active ? '#E8A620' : '#4D4538' }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[6px] font-bold tracking-widest leading-none"
                  style={{ color: active ? '#C8892A' : '#3A2E1F' }}
                >
                  {item.label}
                </span>
                {/* Active indicator dot */}
                {active && (
                  <div
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: '#C8892A',
                      boxShadow: '0 0 5px rgba(200,137,42,0.8)',
                      marginTop: 1,
                    }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
