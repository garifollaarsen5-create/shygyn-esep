import { useMemo, useState } from "react";
import { useStore } from "../store";
import { t } from "../i18n";
import { formatMoney, currencySymbol } from "../lib/currency";
import { formatMonthLong } from "../lib/date";
import { budgetStatus, currentMonthKey, sumAmount, transactionsInMonth } from "../lib/calc";
import { DonutChart } from "../components/Charts";

export function Budget() {
  const { transactions, budget, settings, setBudget } = useStore();
  const lang = settings.lang;
  const cur = settings.currency;
  const month = currentMonthKey();

  const spent = useMemo(
    () => sumAmount(transactionsInMonth(transactions, month)),
    [transactions, month]
  );
  const status = budgetStatus(spent, budget.monthlyLimit);

  const [input, setInput] = useState(budget.monthlyLimit > 0 ? String(budget.monthlyLimit) : "");

  function save() {
    const value = parseFloat(input.replace(",", "."));
    setBudget({ monthlyLimit: isFinite(value) && value > 0 ? value : 0 });
  }

  const ratioPct = Math.min(status.ratio * 100, 100);

  return (
    <div className="space-y-4">
      <header className="rise pt-1">
        <h1 className="font-display text-2xl font-extrabold">{t("monthlyBudget", lang)}</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{formatMonthLong(month, lang)}</p>
      </header>

      {/* Бюджет жағдайы */}
      {status.hasLimit && (
        <section className="card rise flex flex-col items-center p-6">
          <DonutChart
            segments={[
              { label: "spent", value: status.spent, color: status.exceeded ? "var(--danger)" : "var(--primary)" },
              { label: "left", value: Math.max(status.remaining, 0), color: "var(--surface-2)" },
            ]}
            size={190}
            thickness={24}
            center={
              <div className="text-center">
                <p className="font-display tnum text-3xl font-extrabold">{Math.round(ratioPct)}%</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {status.exceeded ? t("budgetExceeded", lang) : t("budgetOk", lang)}
                </p>
              </div>
            }
          />
          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("spent", lang)}</p>
              <p className="tnum font-bold">{formatMoney(status.spent, cur)}</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("budgetLeft", lang)}</p>
              <p className="tnum font-bold" style={{ color: status.exceeded ? "var(--danger)" : "var(--text)" }}>
                {formatMoney(status.remaining, cur)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Лимит енгізу */}
      <section className="card rise p-5" style={{ animationDelay: "60ms" }}>
        <h2 className="font-display text-lg font-bold">{t("limit", lang)}</h2>
        <p className="mb-3 text-sm" style={{ color: "var(--text-muted)" }}>{t("budgetHint", lang)}</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="decimal"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="0"
              className="tnum w-full rounded-xl px-4 py-3 pr-10 text-xl font-bold outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: "var(--text-muted)" }}>
              {currencySymbol(cur)}
            </span>
          </div>
          <button
            onClick={save}
            className="rounded-xl px-6 font-bold transition-transform active:scale-95"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            {t("save", lang)}
          </button>
        </div>
        {status.hasLimit && (
          <button
            onClick={() => {
              setBudget({ monthlyLimit: 0 });
              setInput("");
            }}
            className="mt-3 text-sm font-semibold"
            style={{ color: "var(--danger)" }}
          >
            {t("removeBudget", lang)}
          </button>
        )}
      </section>
    </div>
  );
}
