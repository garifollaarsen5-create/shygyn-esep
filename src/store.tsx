import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  Budget,
  Category,
  Settings,
  Transaction,
} from "./types";

const STORAGE_KEY = "shygyn-esep-v1";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", nameKk: "Тамақ", nameRu: "Еда", icon: "🍽️", color: "#F97316" },
  { id: "transport", nameKk: "Көлік", nameRu: "Транспорт", icon: "🚌", color: "#3B82F6" },
  { id: "home", nameKk: "Үй", nameRu: "Дом", icon: "🏠", color: "#10B981" },
  { id: "fun", nameKk: "Ойын-сауық", nameRu: "Развлечения", icon: "🎉", color: "#A855F7" },
  { id: "health", nameKk: "Денсаулық", nameRu: "Здоровье", icon: "💊", color: "#EF4444" },
  { id: "shopping", nameKk: "Сатып алу", nameRu: "Покупки", icon: "🛍️", color: "#EC4899" },
  { id: "other", nameKk: "Басқа", nameRu: "Другое", icon: "📦", color: "#64748B" },
];

function defaultState(): AppState {
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    budget: { monthlyLimit: 0 },
    settings: { lang: "kk", currency: "KZT", theme: "dark" },
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = defaultState();
    return {
      transactions: parsed.transactions ?? base.transactions,
      categories: parsed.categories?.length ? parsed.categories : base.categories,
      budget: { ...base.budget, ...parsed.budget },
      settings: { ...base.settings, ...parsed.settings },
    };
  } catch {
    return defaultState();
  }
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface StoreValue extends AppState {
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id" | "createdAt">) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (b: Budget) => void;
  updateSettings: (s: Partial<Settings>) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;
  importState: (s: AppState) => void;
  clearAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  // Кез келген өзгеріс болғанда localStorage-ке сақтау
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Тақырыпты <html> элементіне қолдану
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
  }, [state.settings.theme]);

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id" | "createdAt">) => {
      setState((s) => ({
        ...s,
        transactions: [
          { ...tx, id: uid(), createdAt: Date.now() },
          ...s.transactions,
        ],
      }));
    },
    []
  );

  const updateTransaction = useCallback(
    (id: string, tx: Omit<Transaction, "id" | "createdAt">) => {
      setState((s) => ({
        ...s,
        transactions: s.transactions.map((t) =>
          t.id === id ? { ...t, ...tx } : t
        ),
      }));
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.filter((t) => t.id !== id),
    }));
  }, []);

  const setBudget = useCallback((budget: Budget) => {
    setState((s) => ({ ...s, budget }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const addCategory = useCallback((c: Omit<Category, "id">) => {
    setState((s) => ({
      ...s,
      categories: [...s.categories, { ...c, id: uid() }],
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      categories: s.categories.filter((c) => c.id !== id),
    }));
  }, []);

  const importState = useCallback((next: AppState) => {
    setState(next);
  }, []);

  const clearAll = useCallback(() => {
    setState(defaultState());
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      updateSettings,
      addCategory,
      deleteCategory,
      importState,
      clearAll,
    }),
    [
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      updateSettings,
      addCategory,
      deleteCategory,
      importState,
      clearAll,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore StoreProvider ішінде қолданылуы керек");
  return ctx;
}

/** Категорияны id арқылы табатын көмекші hook */
export function useCategoryMap(): Record<string, Category> {
  const { categories } = useStore();
  return useMemo(() => {
    const map: Record<string, Category> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);
}
