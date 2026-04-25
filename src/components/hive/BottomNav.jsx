import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* Primary nav — always visible, 5 slots */
const PRIMARY = [
  { path: '/',        icon: '⬡',  label: 'HIVE'    },
  { path: '/brains',  icon: '◈',  label: 'BRAINS'  },
  { path: '/signals', icon: '◎',  label: 'SIGNALS' },
  { path: '/perf',    icon: '▲',  label: 'PERF'    },
  { path: '__more',   icon: '⊞',  label: 'MORE'    },
];

/* Secondary nav — shown in the MORE drawer */
const SECONDARY = [
  { path: '/trades',       icon: '⊡',  label: 'TRADES'  },
  { path: '/heatmap',      icon: '🔥', label: 'HEAT'    },
  { path: '/alpha',        icon: '⚡', label: 'ALPHA'   },
  { path: '/analytics',    icon: '◑',  label: 'INTEL'   },
  { path: '/algorithms',   icon: '⧬',  label: 'ALGOS'   },
  { path: '/library',      icon: '⨳',  label: 'LIBRARY' },
  { path: '/correlations', icon: '◇',  label: 'RISK'    },
  { path: '/neural',       icon: '◉',  label: 'NEURAL'  },
  { path: '/chat',         icon: '⦿',  label: 'CHAT'    },
];

const SECONDARY_PATHS = new Set(SECONDARY.map(s => s.path));

export default function BottomNav() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const isSecondaryActive = SECONDARY_PATHS.has(location.pathname);

  const isActive = (path) => {
    if (path === '__more') return isSecondaryActive;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="hive-nav-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MORE drawer */}
      {drawerOpen && (
        <div
          className="hive-nav-drawer"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-8 h-0.5 rounded-full" style={{ background: 'var(--hive-border-2)' }} />
          </div>

          <div className="px-5 pb-3 pt-2 flex items-center justify-between">
            <span className="hive-label" style={{ color: 'var(--hive-text-3)' }}>MORE MODULES</span>
            <div className="hive-live">
              <div className="hive-live-dot" />
              <span className="hive-live-text">LIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-4 px-2 pb-3">
            {SECONDARY.map(item => {
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-all active:scale-95"
                    style={{ background: active ? 'var(--hive-gold-ghost)' : 'transparent' }}
                  >
                    <span
                      className="text-xl leading-none"
                      style={{ color: active ? 'var(--hive-gold)' : 'var(--hive-text-3)' }}
                    >
                      {item.icon}
                    </span>
                    <span
                      className="text-[7px] font-bold tracking-widest leading-none"
                      style={{ color: active ? 'var(--hive-gold)' : 'var(--hive-text-4)' }}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div
            className="mx-5 border-t"
            style={{ borderColor: 'var(--hive-border-1)' }}
          />

          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-black text-black"
                style={{ background: 'linear-gradient(135deg, #FFB81C, #ef4444, #a855f7, #22c55e, #3b82f6, #f59e0b)' }}
              >
                H
              </div>
              <span className="text-[8px] font-black tracking-widest" style={{ color: 'var(--hive-gold)' }}>
                THE HIVE
              </span>
            </div>
            <span className="hive-label" style={{ color: 'var(--hive-text-4)' }}>6 BRAINS ACTIVE</span>
          </div>
        </div>
      )}

      {/* Primary nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--hive-base)',
          borderTop: '1px solid var(--hive-border-1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Gold indicator line */}
        <div className="relative h-px w-full" style={{ background: 'var(--hive-border-1)' }}>
          {PRIMARY.map((item, i) => {
            if (!isActive(item.path)) return null;
            return (
              <div
                key={item.path}
                className="absolute top-0 h-px transition-all duration-300"
                style={{
                  background: 'var(--hive-gold)',
                  left: `${(i / PRIMARY.length) * 100}%`,
                  width: `${100 / PRIMARY.length}%`,
                  boxShadow: '0 0 8px var(--hive-gold-glow)',
                }}
              />
            );
          })}
        </div>

        <div className="flex items-stretch">
          {PRIMARY.map((item) => {
            const active = isActive(item.path);
            const isMore = item.path === '__more';

            const tabContent = (
              <div
                className="flex flex-col items-center gap-0.5 px-1 py-2.5 rounded-lg transition-all w-full"
                style={{ background: active ? 'var(--hive-gold-ghost)' : 'transparent' }}
              >
                <span
                  className="text-base leading-none"
                  style={{ color: active ? 'var(--hive-gold)' : 'var(--hive-text-3)' }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[7px] font-bold tracking-widest leading-none mt-0.5"
                  style={{ color: active ? 'var(--hive-gold)' : 'var(--hive-text-4)' }}
                >
                  {item.label}
                </span>
              </div>
            );

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setDrawerOpen(v => !v)}
                  className="relative flex-1 flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="More navigation options"
                  aria-expanded={drawerOpen}
                >
                  {/* Dot when a secondary page is active */}
                  {isSecondaryActive && !drawerOpen && (
                    <div
                      className="absolute top-2.5 right-[calc(50%-14px)] w-1 h-1 rounded-full"
                      style={{ background: 'var(--hive-gold)' }}
                    />
                  )}
                  {tabContent}
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex-1 flex items-center justify-center active:scale-95 transition-transform"
              >
                {tabContent}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
