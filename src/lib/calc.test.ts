import { describe, it, expect } from "vitest";
import {
  budgetStatus,
  monthKey,
  monthlyTotals,
  sumAmount,
  sumByCategory,
  transactionsInMonth,
} from "./calc";
import { formatMoney } from "./currency";
import type { Transaction } from "../types";

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: Math.random().toString(),
    amount: 100,
    currency: "KZT",
    categoryId: "food",
    date: "2026-05-15",
    note: "",
    createdAt: 0,
    ...partial,
  };
}

describe("monthKey", () => {
  it("ISO күннен YYYY-MM бөлігін алады", () => {
    expect(monthKey("2026-05-31")).toBe("2026-05");
  });
});

describe("sumAmount", () => {
  it("сомаларды қосады", () => {
    expect(sumAmount([tx({ amount: 100 }), tx({ amount: 250 })])).toBe(350);
  });
  it("бос тізімде 0 қайтарады", () => {
    expect(sumAmount([])).toBe(0);
  });
});

describe("transactionsInMonth", () => {
  it("тек берілген айдағыларды сүзеді", () => {
    const list = [
      tx({ date: "2026-05-01" }),
      tx({ date: "2026-05-20" }),
      tx({ date: "2026-04-30" }),
    ];
    expect(transactionsInMonth(list, "2026-05")).toHaveLength(2);
  });
});

describe("sumByCategory", () => {
  it("категория бойынша топтап, кему ретімен сұрыптайды", () => {
    const list = [
      tx({ categoryId: "food", amount: 100 }),
      tx({ categoryId: "transport", amount: 300 }),
      tx({ categoryId: "food", amount: 50 }),
    ];
    const result = sumByCategory(list);
    expect(result[0]).toEqual({ categoryId: "transport", total: 300 });
    expect(result[1]).toEqual({ categoryId: "food", total: 150 });
  });
});

describe("budgetStatus", () => {
  it("лимит болмаса hasLimit=false", () => {
    const s = budgetStatus(500, 0);
    expect(s.hasLimit).toBe(false);
    expect(s.exceeded).toBe(false);
  });
  it("лимит аясында дұрыс есептейді", () => {
    const s = budgetStatus(300, 1000);
    expect(s.remaining).toBe(700);
    expect(s.ratio).toBeCloseTo(0.3);
    expect(s.exceeded).toBe(false);
  });
  it("лимиттен асқанда exceeded=true", () => {
    const s = budgetStatus(1200, 1000);
    expect(s.exceeded).toBe(true);
    expect(s.remaining).toBe(-200);
  });
});

describe("monthlyTotals", () => {
  it("соңғы N айды ескіден жаңаға қайтарады", () => {
    const now = new Date(2026, 4, 15); // мамыр 2026
    const list = [tx({ date: "2026-05-10", amount: 500 }), tx({ date: "2026-03-10", amount: 200 })];
    const result = monthlyTotals(list, 3, now);
    expect(result).toHaveLength(3);
    expect(result[0].month).toBe("2026-03");
    expect(result[0].total).toBe(200);
    expect(result[2].month).toBe("2026-05");
    expect(result[2].total).toBe(500);
  });
});

describe("formatMoney", () => {
  it("теңгені бөлгішпен пішімдейді", () => {
    expect(formatMoney(12500, "KZT")).toBe("12 500 ₸");
  });
  it("бөлшексіз бүтін санды бөлшексіз көрсетеді", () => {
    expect(formatMoney(1000, "USD")).toBe("1 000 $");
  });
  it("бөлшек бөлігін көрсетеді", () => {
    expect(formatMoney(99.5, "EUR")).toBe("99,5 €");
  });
});
