import { useEffect, useState } from "react";
import { useStore } from "../store";
import { t } from "../i18n";
import { CURRENCIES, CURRENCY_CODES } from "../lib/currency";
import type { CurrencyCode, Transaction } from "../types";

function todayIso(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function AddExpenseSheet({
  onClose,
  editing,
}: {
  onClose: () => void;
  editing?: Transaction | null;
}) {
  const { settings, categories, addTransaction, updateTransaction, deleteTransaction } =
    useStore();
  const lang = settings.lang;

  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [currency, setCurrency] = useState<CurrencyCode>(
    editing?.currency ?? settings.currency
  );
  const [categoryId, setCategoryId] = useState(
    editing?.categoryId ?? categories[0]?.id ?? "other"
  );
  const [date, setDate] = useState(editing?.date ?? todayIso());
  const [note, setNote] = useState(editing?.note ?? "");
  const [error, setError] = useState("");

  // Esc пернесімен жабу
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit() {
    const value = parseFloat(amount.replace(",", "."));
    if (!isFinite(value) || value <= 0) {
      setError(t("amountError", lang));
      return;
    }
    const payload = { amount: value, currency, categoryId, date, note: note.trim() };
    if (editing) updateTransaction(editing.id, payload);
    else addTransaction(payload);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="card pop w-full max-w-md max-h-[92vh] overflow-y-auto no-scrollbar rounded-b-none sm:rounded-b-[1.25rem] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full sm:hidden" style={{ background: "var(--border)" }} />
        <h2 className="font-display mb-5 text-xl font-bold">
          {editing ? t("editExpense", lang) : t("addExpense", lang)}
        </h2>

        {/* Сома + валюта */}
        <label className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
          {t("amount", lang)}
        </label>
        <div className="mb-4 flex gap-2">
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            placeholder="0"
            className="tnum min-w-0 flex-1 rounded-xl px-4 py-3 text-2xl font-bold outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="rounded-xl px-3 py-3 text-lg font-bold outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            {CURRENCY_CODES.map((c) => (
              <option key={c} value={c}>
                {CURRENCIES[c].symbol} {c}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="-mt-2 mb-3 text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

        {/* Категория */}
        <label className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
          {t("category", lang)}
        </label>
        <div className="mb-4 grid grid-cols-4 gap-2">
          {categories.map((c) => {
            const sel = c.id === categoryId;
            return (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className="flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold transition-all"
                style={{
                  background: sel ? "color-mix(in srgb, var(--primary) 18%, var(--surface-2))" : "var(--surface-2)",
                  border: `1.5px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                  color: sel ? "var(--text)" : "var(--text-muted)",
                }}
              >
                <span className="text-xl">{c.icon}</span>
                <span className="line-clamp-1">{lang === "kk" ? c.nameKk : c.nameRu}</span>
              </button>
            );
          })}
        </div>

        {/* Күн */}
        <label className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
          {t("date", lang)}
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="tnum mb-4 w-full rounded-xl px-4 py-3 outline-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
        />

        {/* Ескертпе */}
        <label className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
          {t("note", lang)}
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("notePlaceholder", lang)}
          className="mb-5 w-full rounded-xl px-4 py-3 outline-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        />

        <div className="flex gap-3">
          {editing && (
            <button
              onClick={() => {
                deleteTransaction(editing.id);
                onClose();
              }}
              className="rounded-xl px-4 py-3 font-bold transition-transform active:scale-95"
              style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)", color: "var(--danger)" }}
              aria-label={t("delete", lang)}
            >
              🗑
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-xl px-4 py-3 font-bold transition-transform active:scale-95"
            style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
          >
            {t("cancel", lang)}
          </button>
          <button
            onClick={submit}
            className="flex-[2] rounded-xl px-4 py-3 font-bold transition-transform active:scale-95"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            {t("save", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
