import { useMemo } from "react";
import { useCategoryMap, useStore } from "../store";
import { t } from "../i18n";
import { formatMoney } from "../lib/currency";
import { formatMonthLong } from "../lib/date";
import {
  budgetStatus,
  currentMonthKey,
  sumAmount,
  sumByCategory,
  transactionsInMonth,
} from "../lib/calc";
import { DonutChart } from "../components/Charts";
import { TransactionRow } from "../components/TransactionRow";
import type { Transaction } from "../types";
import type { Screen } from "../components/BottomNav";

export function Dashboard({
  onEdit,
  onNavigate,
}: {
  onEdit: (tx: Transaction) => void;
  onNavigate: (s: Screen) => void;
}) {
  const { transactions, budget, settings } = useStore();
  const lang = settings.lang;
  const cur = settings.currency;
  const catMap = useCategoryMap();
  const month = currentMonthKey();

  const monthTx = useMemo(
    () => transactionsInMonth(transactions, month),
    [transactions, month]
  );
  const spent = sumAmount(monthTx);
  const status = budgetStatus(spent, budget.monthlyLimit);
  const byCat = useMemo(() => sumByCategory(monthTx).slice(0, 5), [monthTx]);
  const recent = transactions.slice(0, 4);

  const segments = byCat.map((b) => ({
    label: catMap[b.categoryId]?.nameKk ?? "",
    value: b.total,
    color: catMap[b.categoryId]?.color ?? "#64748B",
  }));

  return (
    <div className="space-y-4">
      {/* Тақырып */}
      <header className="rise flex items-end justify-between pt-1">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            {formatMonthLong(month, lang)}
          </p>
          <h1 className="font-display text-2xl font-extrabold">{t("appName", lang)}</h1>
        </div>
      </header>

      {/* Негізгі карта: осы айдағы шығын + donut */}
      <section className="card rise p-5" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              {t("thisMonth", lang)}
            </p>
            <p className="font-display tnum mt-1 text-3xl font-extrabold leading-tight">
              {formatMoney(spent, cur)}
            </p>
            {status.hasLimit ? (
              <p
                className="tnum mt-2 text-sm font-semibold"
                style={{ color: status.exceeded ? "var(--danger)" : "var(--text-muted)" }}
              >
                {status.exceeded ? "⚠ " : ""}
                {t("budgetLeft", lang)}: {formatMoney(status.remaining, cur)}
              </p>
            ) : (
              <button
                onClick={() => onNavigate("budget")}
                className="mt-2 text-sm font-semibold"
                style={{ color: "var(--primary)" }}
              >
                + {t("monthlyBudget", lang)}
              </button>
            )}
          </div>
          {segments.length > 0 && (
            <DonutChart
              segments={segments}
              size={104}
              thickness={14}
              center={
                <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                  {monthTx.length}
                </span>
              }
            />
          )}
        </div>

        {/* Бюджет жолағы */}
        {status.hasLimit && (
          <div className="mt-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(status.ratio * 100, 100)}%`,
                  background: status.exceeded ? "var(--danger)" : "var(--primary)",
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Негізгі категориялар */}
      {byCat.length > 0 && (
        <section className="card rise p-5" style={{ animationDelay: "120ms" }}>
          <h2 className="mb-3 font-display text-lg font-bold">{t("topCategories", lang)}</h2>
          <div className="space-y-3">
            {byCat.map((b) => {
              const cat = catMap[b.categoryId];
              const pct = spent > 0 ? (b.total / spent) * 100 : 0;
              return (
                <div key={b.categoryId} className="flex items-center gap-3">
                  <span className="text-lg">{cat?.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold">{lang === "kk" ? cat?.nameKk : cat?.nameRu}</span>
                      <span className="tnum" style={{ color: "var(--text-muted)" }}>
                        {formatMoney(b.total, cur)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cat?.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Соңғы шығындар */}
      <section className="card rise p-4" style={{ animationDelay: "180ms" }}>
        <div className="mb-1 flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-bold">{t("recentTx", lang)}</h2>
          {transactions.length > 0 && (
            <button onClick={() => onNavigate("list")} className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              {t("seeAll", lang)}
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-4xl">🪙</p>
            <p className="mt-2 font-semibold">{t("noTx", lang)}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("noTxHint", lang)}</p>
          </div>
        ) : (
          <div>
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onClick={() => onEdit(tx)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
