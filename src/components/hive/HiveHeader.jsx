import { Link } from 'react-router-dom';

/**
 * Shared page header for The Hive.
 *
 * Props:
 *   title       {string}  — main page title (e.g. "BRAIN GRID")
 *   subtitle    {string}  — descriptor line below title
 *   back        {string}  — path for back-arrow link; omit to hide
 *   backLabel   {string}  — label next to back arrow (default "BACK")
 *   live        {boolean} — show green LIVE indicator (default false)
 *   accent      {string}  — CSS color for title text (default hive-gold)
 *   right       {node}    — optional right-side slot (buttons, badges)
 *   children    {node}    — optional content below the title row (e.g. filter tabs)
 */
export default function HiveHeader({
  title,
  subtitle,
  back,
  backLabel = 'BACK',
  live = false,
  accent,
  right,
  children,
}) {
  const titleColor = accent || 'var(--hive-gold)';

  return (
    <div
      className="sticky top-0 z-10 px-4 pt-4 pb-3"
      style={{
        background: 'var(--hive-base)',
        borderBottom: '1px solid var(--hive-border-1)',
      }}
    >
      {/* Back link */}
      {back && (
        <Link to={back} className="inline-flex items-center gap-1.5 mb-2 group">
          <span
            className="text-xs transition-colors"
            style={{ color: 'var(--hive-text-3)' }}
          >
            ←
          </span>
          <span
            className="hive-label transition-colors group-hover:opacity-80"
            style={{ color: 'var(--hive-text-3)' }}
          >
            {backLabel}
          </span>
        </Link>
      )}

      {/* Main row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1
            className="text-base font-black tracking-widest leading-tight truncate"
            style={{ color: titleColor }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="hive-sublabel mt-0.5" style={{ color: 'var(--hive-text-3)' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          {right}
          {live && (
            <div className="hive-live">
              <div className="hive-live-dot" />
              <span className="hive-live-text">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Optional children (tabs, filters, etc.) */}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
