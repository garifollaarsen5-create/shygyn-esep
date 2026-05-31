// Қосымшаның негізгі деректер түрлері

export type Lang = "kk" | "ru";

export type CurrencyCode = "KZT" | "RUB" | "USD" | "EUR";

export type Theme = "light" | "dark";

export interface Category {
  id: string;
  /** Қазақша атауы */
  nameKk: string;
  /** Орысша атауы */
  nameRu: string;
  /** Emoji иконка */
  icon: string;
  /** HEX түс */
  color: string;
}

export interface Transaction {
  id: string;
  /** Сома (негізгі валютада сақталады) */
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  /** ISO күн: YYYY-MM-DD */
  date: string;
  note: string;
  /** Жасалған уақыт (сұрыптау үшін) */
  createdAt: number;
}

export interface Budget {
  /** Айлық лимит, негізгі валютада. 0 = лимит жоқ */
  monthlyLimit: number;
}

export interface Settings {
  lang: Lang;
  currency: CurrencyCode;
  theme: Theme;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  budget: Budget;
  settings: Settings;
}
