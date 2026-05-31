import type { Lang } from "../types";
import { t, type TKey } from "../i18n";

export type Screen = "home" | "list" | "stats" | "budget" | "settings";

const ITEMS: { screen: Screen; key: TKey; icon: string }[] = [
  { screen: "home", key: "navHome", icon: "M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9" },
  { screen: "list", key: "navList", icon: "M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01" },
  { screen: "stats", key: "navStats", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { screen: "budget", key: "navBudget", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { screen: "settings", key: "navSettings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 2.6 15H2.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9" },
];

export function BottomNav({
  active,
  onChange,
  lang,
}: {
  active: Screen;
  onChange: (s: Screen) => void;
  lang: Lang;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-[env(safe-area-inset-bottom)]">
      <div
        className="m-3 flex w-full max-w-md items-stretch justify-around rounded-2xl border px-1 py-1.5 backdrop-blur-xl"
        style={{
          background: "color-mix(in srgb, var(--surface) 88%, transparent)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow)",
        }}
      >
        {ITEMS.map((item) => {
          const isActive = item.screen === active;
          return (
            <button
              key={item.screen}
              onClick={() => onChange(item.screen)}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors"
              style={{ color: isActive ? "var(--primary)" : "var(--text-muted)" }}
              aria-label={t(item.key, lang)}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={isActive ? 2.4 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={item.icon} />
              </svg>
              <span className="text-[10px]" style={{ fontWeight: isActive ? 700 : 500 }}>
                {t(item.key, lang)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
