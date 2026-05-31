import { useMemo } from "react";
import { useCategoryMap, useStore } from "../store";
import { t } from "../i18n";
import { formatMoney } from "../lib/currency";
import { formatMonthShort } from "../lib/date";
import {
  currentMonthKey,
  monthlyTotals,
  sumAmount,
  sumByCategory,
  transactionsInMonth,
} from "../lib/calc";
import { BarChart, DonutChart } from "../components/Charts";

export function Stats() {
  const { transactions, settings } = useStore();
  const lang = settings.lang;
  const cur = settings.currency;
  const catMap = useCategoryMap();
  const month = currentMonthKey();

  const monthTx = useMemo(() => transactionsInMonth(transactions, month), [transactions, month]);
  const byCat = useMemo(() => sumByCategory(monthTx), [monthTx]);
  const monthSpent = sumAmount(monthTx);

  const months = useMemo(() => monthlyTotals(transactions, 6), [transactions]);
  const barData = months.map((m, i) => ({
    label: formatMonthShort(m.month, lang),
    value: m.total,
    highlight: i === months.length - 1,
  }));

  const segments = byCat.map((b) => ({
    label: catMap[b.categoryId]?.nameKk ?? "",
    value: b.total,
    color: catMap[b.categoryId]?.color ?? "#64748B",
  }));

  const hasData = transactions.length > 0;

  return (
    <div className="space-y-4">
      <header className="rise pt-1">
        <h1 className="font-display text-2xl font-extrabold">{t("navStats", lang)}</h1>
      </header>

      {!hasData ? (
        <div className="card py-14 text-center">
          <p className="text-4xl">📊</p>
          <p className="mt-2 font-semibold">{t("noData", lang)}</p>
        </div>
      ) : (
        <>
          {/* Категория бойынша donut */}
          <section className="card rise p-5">
            <h2 className="mb-4 font-display text-lg font-bold">{t("byCategory", lang)}</h2>
            {segments.length === 0 ? (
              <p className="py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>{t("noData", lang)}</p>
            ) : (
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <DonutChart
                  segments={segments}
                  size={170}
                  thickness={26}
                  center={
                    <div>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("total", lang)}</p>
                      <p className="font-display tnum text-base font-extrabold">{formatMoney(monthSpent, cur)}</p>
                    </div>
                  }
                />
                <div className="w-full flex-1 space-y-2">
                  {byCat.map((b) => {
                    const cat = catMap[b.categoryId];
                    const pct = monthSpent > 0 ? Math.round((b.total / monthSpent) * 100) : 0;
                    return (
                      <div key={b.categoryId} className="flex items-center gap-2 text-sm">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: cat?.color }} />
                        <span className="flex-1 truncate font-semibold">{lang === "kk" ? cat?.nameKk : cat?.nameRu}</span>
                        <span className="tnum" style={{ color: "var(--text-muted)" }}>{pct}%</span>
                        <span className="tnum w-24 text-right font-semibold">{formatMoney(b.total, cur)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Айлар бойынша bar */}
          <section className="card rise p-5" style={{ animationDelay: "80ms" }}>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold">{t("byMonth", lang)}</h2>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t("last6Months", lang)}</span>
            </div>
            <BarChart data={barData} />
          </section>
        </>
      )}
    </div>
  );
}
