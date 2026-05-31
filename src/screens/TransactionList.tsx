import { useMemo, useState } from "react";
import { useStore } from "../store";
import { t } from "../i18n";
import { formatMoney } from "../lib/currency";
import { formatMonthLong } from "../lib/date";
import { monthKey, sumAmount } from "../lib/calc";
import { TransactionRow } from "../components/TransactionRow";
import type { Transaction } from "../types";

export function TransactionList({ onEdit }: { onEdit: (tx: Transaction) => void }) {
  const { transactions, categories, settings } = useStore();
  const lang = settings.lang;
  const cur = settings.currency;
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (filter === "all" ? transactions : transactions.filter((t) => t.categoryId === filter)),
    [transactions, filter]
  );

  // Ай бойынша топтау
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const key = monthKey(tx.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const total = sumAmount(filtered);

  return (
    <div className="space-y-4">
      <header className="rise pt-1">
        <h1 className="font-display text-2xl font-extrabold">{t("navList", lang)}</h1>
        <p className="tnum text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
          {t("total", lang)}: {formatMoney(total, cur)}
        </p>
      </header>

      {/* Категория сүзгісі */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={t("allCategories", lang)} />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
            label={`${c.icon} ${lang === "kk" ? c.nameKk : c.nameRu}`}
          />
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="card py-14 text-center">
          <p className="text-4xl">🪙</p>
          <p className="mt-2 font-semibold">{t("noTx", lang)}</p>
        </div>
      ) : (
        groups.map(([key, items], gi) => (
          <section key={key} className="card rise p-4" style={{ animationDelay: `${gi * 40}ms` }}>
            <div className="mb-1 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-bold">{formatMonthLong(key, lang)}</h2>
              <span className="tnum text-sm" style={{ color: "var(--text-muted)" }}>
                {formatMoney(sumAmount(items), cur)}
              </span>
            </div>
            {items.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onClick={() => onEdit(tx)} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all"
      style={{
        background: active ? "var(--primary)" : "var(--surface)",
        color: active ? "var(--on-primary)" : "var(--text-muted)",
        border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
      }}
    >
      {label}
    </button>
  );
}
