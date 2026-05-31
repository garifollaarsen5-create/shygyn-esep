import { useMemo } from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * Жеңіл SVG donut диаграмма (тәуелсіздіксіз).
 * Ортасында жалпы соманы көрсетуге slot бар.
 */
export function DonutChart({
  segments,
  size = 180,
  thickness = 22,
  center,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const arcs = useMemo(() => {
    let offset = 0;
    return segments
      .filter((s) => s.value > 0)
      .map((s) => {
        const fraction = total > 0 ? s.value / total : 0;
        const dash = fraction * circumference;
        const arc = {
          color: s.color,
          dash,
          gap: circumference - dash,
          offset: -offset,
        };
        offset += dash;
        return arc;
      });
  }, [segments, total, circumference]);

  return (
    <div className="relative inline-grid place-items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth={thickness}
          />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={thickness}
              strokeDasharray={`${a.dash} ${a.gap}`}
              strokeDashoffset={a.offset}
              strokeLinecap={arcs.length > 1 ? "butt" : "round"}
            />
          ))}
        </g>
      </svg>
      {center && (
        <div className="absolute inset-0 grid place-items-center text-center">
          {center}
        </div>
      )}
    </div>
  );
}

export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

/** Жеңіл баған (bar) диаграмма */
export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-stretch justify-between gap-2 h-40">
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-[34px] rounded-t-lg transition-all"
                style={{
                  height: `${Math.max(heightPct, d.value > 0 ? 6 : 2)}%`,
                  background: d.highlight
                    ? "var(--primary)"
                    : "color-mix(in srgb, var(--primary) 35%, transparent)",
                }}
              />
            </div>
            <span
              className="text-[11px] tnum"
              style={{
                color: d.highlight ? "var(--text)" : "var(--text-muted)",
                fontWeight: d.highlight ? 700 : 500,
              }}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
