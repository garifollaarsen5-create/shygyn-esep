import { useState } from "react";
import { useStore } from "../store";
import { t } from "../i18n";
import { CURRENCIES, CURRENCY_CODES } from "../lib/currency";
import type { CurrencyCode, Lang, Theme } from "../types";

const EMOJI_CHOICES = ["🍽️", "🚌", "🏠", "🎉", "💊", "🛍️", "☕", "📚", "✈️", "🎁", "💡", "📱", "👕", "🐾", "💰", "📦"];

export function Settings() {
  const {
    settings,
    categories,
    updateSettings,
    addCategory,
    deleteCategory,
    transactions,
    budget,
    clearAll,
  } = useStore();
  const lang = settings.lang;

  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState(EMOJI_CHOICES[0]);
  const [adding, setAdding] = useState(false);

  function handleAddCategory() {
    const name = newCatName.trim();
    if (!name) return;
    const palette = ["#F97316", "#3B82F6", "#10B981", "#A855F7", "#EF4444", "#EC4899", "#14B8A6", "#F59E0B"];
    addCategory({
      nameKk: name,
      nameRu: name,
      icon: newCatIcon,
      color: palette[categories.length % palette.length],
    });
    setNewCatName("");
    setAdding(false);
  }

  function exportData() {
    const blob = new Blob(
      [JSON.stringify({ transactions, categories, budget, settings }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shygyn-esep-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <header className="rise pt-1">
        <h1 className="font-display text-2xl font-extrabold">{t("navSettings", lang)}</h1>
      </header>

      {/* Тіл */}
      <section className="card rise p-5">
        <h2 className="mb-3 font-display text-base font-bold">{t("language", lang)}</h2>
        <Segmented
          value={lang}
          onChange={(v) => updateSettings({ lang: v as Lang })}
          options={[
            { value: "kk", label: "Қазақша" },
            { value: "ru", label: "Русский" },
          ]}
        />
      </section>

      {/* Тақырып */}
      <section className="card rise p-5" style={{ animationDelay: "40ms" }}>
        <h2 className="mb-3 font-display text-base font-bold">{t("theme", lang)}</h2>
        <Segmented
          value={settings.theme}
          onChange={(v) => updateSettings({ theme: v as Theme })}
          options={[
            { value: "dark", label: `🌙 ${t("themeDark", lang)}` },
            { value: "light", label: `☀️ ${t("themeLight", lang)}` },
          ]}
        />
      </section>

      {/* Негізгі валюта */}
      <section className="card rise p-5" style={{ animationDelay: "80ms" }}>
        <h2 className="mb-3 font-display text-base font-bold">{t("mainCurrency", lang)}</h2>
        <div className="grid grid-cols-4 gap-2">
          {CURRENCY_CODES.map((c) => {
            const sel = settings.currency === c;
            return (
              <button
                key={c}
                onClick={() => updateSettings({ currency: c as CurrencyCode })}
                className="flex flex-col items-center gap-0.5 rounded-xl py-3 transition-all"
                style={{
                  background: sel ? "color-mix(in srgb, var(--primary) 18%, var(--surface-2))" : "var(--surface-2)",
                  border: `1.5px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                <span className="text-xl font-bold">{CURRENCIES[c].symbol}</span>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>{c}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Категориялар */}
      <section className="card rise p-5" style={{ animationDelay: "120ms" }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-bold">{t("categories", lang)}</h2>
          <button onClick={() => setAdding((a) => !a)} className="text-sm font-bold" style={{ color: "var(--primary)" }}>
            + {t("addCategory", lang)}
          </button>
        </div>

        {adding && (
          <div className="mb-4 rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
            <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
              {EMOJI_CHOICES.map((e) => (
                <button
                  key={e}
                  onClick={() => setNewCatIcon(e)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg"
                  style={{ background: newCatIcon === e ? "var(--primary)" : "var(--surface)", border: "1px solid var(--border)" }}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder={t("categoryName", lang)}
                className="flex-1 rounded-lg px-3 py-2 outline-none"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <button
                onClick={handleAddCategory}
                className="rounded-lg px-4 font-bold"
                style={{ background: "var(--primary)", color: "var(--on-primary)" }}
              >
                {t("save", lang)}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg text-lg" style={{ background: `color-mix(in srgb, ${c.color} 22%, transparent)` }}>
                {c.icon}
              </span>
              <span className="flex-1 font-semibold">{lang === "kk" ? c.nameKk : c.nameRu}</span>
              {categories.length > 1 && (
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="rounded-lg px-2 py-1 text-sm"
                  style={{ color: "var(--text-muted)" }}
                  aria-label={t("delete", lang)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Деректер */}
      <section className="card rise p-5" style={{ animationDelay: "160ms" }}>
        <h2 className="mb-3 font-display text-base font-bold">{t("dataManagement", lang)}</h2>
        <button
          onClick={exportData}
          className="mb-2 w-full rounded-xl py-3 text-left font-semibold"
          style={{ background: "var(--surface-2)" }}
        >
          <span className="px-3">⬇ {t("exportData", lang)}</span>
        </button>
        <button
          onClick={() => {
            if (confirm(t("confirmClear", lang))) clearAll();
          }}
          className="w-full rounded-xl py-3 text-left font-semibold"
          style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}
        >
          <span className="px-3">🗑 {t("clearData", lang)}</span>
        </button>
        <p className="mt-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          🔒 {t("about", lang)}
        </p>
      </section>
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-xl p-1" style={{ background: "var(--surface-2)" }}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="flex-1 rounded-lg py-2 text-sm font-bold transition-all"
            style={{
              background: sel ? "var(--surface)" : "transparent",
              color: sel ? "var(--primary)" : "var(--text-muted)",
              boxShadow: sel ? "var(--shadow)" : "none",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
