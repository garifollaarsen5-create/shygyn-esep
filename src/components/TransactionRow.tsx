import { useCategoryMap, useStore } from "../store";
import { formatMoney } from "../lib/currency";
import { formatDate } from "../lib/date";
import type { Transaction } from "../types";

export function TransactionRow({
  tx,
  onClick,
}: {
  tx: Transaction;
  onClick?: () => void;
}) {
  const { settings } = useStore();
  const lang = settings.lang;
  const catMap = useCategoryMap();
  const cat = catMap[tx.categoryId];

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors active:bg-[var(--surface-2)]"
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
        style={{ background: cat ? `color-mix(in srgb, ${cat.color} 22%, transparent)` : "var(--surface-2)" }}
      >
        {cat?.icon ?? "📦"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {cat ? (lang === "kk" ? cat.nameKk : cat.nameRu) : "—"}
        </p>
        <p className="truncate text-sm" style={{ color: "var(--text-muted)" }}>
          {tx.note ? tx.note : formatDate(tx.date, lang)}
        </p>
      </div>
      <div className="text-right">
        <p className="tnum font-bold whitespace-nowrap">
          −{formatMoney(tx.amount, tx.currency)}
        </p>
        {tx.note && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDate(tx.date, lang)}
          </p>
        )}
      </div>
    </button>
  );
}
