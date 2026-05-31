import type { CurrencyCode } from "../types";

export const CURRENCIES: Record<
  CurrencyCode,
  { symbol: string; nameKk: string; nameRu: string }
> = {
  KZT: { symbol: "₸", nameKk: "Теңге", nameRu: "Тенге" },
  RUB: { symbol: "₽", nameKk: "Рубль", nameRu: "Рубль" },
  USD: { symbol: "$", nameKk: "Доллар", nameRu: "Доллар" },
  EUR: { symbol: "€", nameKk: "Евро", nameRu: "Евро" },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

/**
 * Соманы әдемі пішімдейді: 12500 → "12 500 ₸"
 * Бөлшек бөлігі болса ғана көрсетіледі.
 */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  const { symbol } = CURRENCIES[currency];
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(amount)
    // Intl әртүрлі бос орын таңбаларын қолданады (NBSP, narrow NBSP) —
    // болжамды болуы үшін қарапайым бос орынға айналдырамыз.
    .replace(/[  \s]/g, " ");
  return `${formatted} ${symbol}`;
}

/** Тек символ */
export function currencySymbol(currency: CurrencyCode): string {
  return CURRENCIES[currency].symbol;
}
