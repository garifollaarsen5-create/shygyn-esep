import type { Transaction } from "../types";

/** YYYY-MM түрінде ай кілтін қайтарады */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** Бүгінгі ай кілті */
export function currentMonthKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Берілген айдағы транзакцияларды сүзеді */
export function transactionsInMonth(
  transactions: Transaction[],
  month: string
): Transaction[] {
  return transactions.filter((t) => monthKey(t.date) === month);
}

/** Жалпы сома */
export function sumAmount(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => acc + t.amount, 0);
}

/** Категория бойынша топтап, сома бойынша кему ретімен қайтарады */
export function sumByCategory(
  transactions: Transaction[]
): { categoryId: string; total: number }[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
}

/** Соңғы N айдың әрқайсысы бойынша жалпы сома (ескіден жаңаға) */
export function monthlyTotals(
  transactions: Transaction[],
  months: number,
  now: Date = new Date()
): { month: string; total: number }[] {
  const result: { month: string; total: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = currentMonthKey(d);
    const total = sumAmount(transactionsInMonth(transactions, key));
    result.push({ month: key, total });
  }
  return result;
}

export interface BudgetStatus {
  limit: number;
  spent: number;
  remaining: number;
  /** 0..1+ аралығы (1-ден асса лимиттен асқан) */
  ratio: number;
  exceeded: boolean;
  hasLimit: boolean;
}

/** Бюджет жағдайын есептейді */
export function budgetStatus(spent: number, limit: number): BudgetStatus {
  const hasLimit = limit > 0;
  const remaining = limit - spent;
  const ratio = hasLimit ? spent / limit : 0;
  return {
    limit,
    spent,
    remaining,
    ratio,
    exceeded: hasLimit && spent > limit,
    hasLimit,
  };
}
