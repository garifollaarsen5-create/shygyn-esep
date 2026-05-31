import type { Lang } from "../types";

const MONTHS_KK = [
  "қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым",
  "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан",
];
const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
// Атау септігі (тақырып үшін: "Июнь 2026")
const MONTHS_RU_NOM = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const MONTHS_KK_SHORT = ["қаң", "ақп", "нау", "сәу", "мам", "мау", "шіл", "там", "қыр", "қаз", "қар", "жел"];
const MONTHS_RU_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

/** "2026-05-31" → "31 мамыр" / "31 мая" */
export function formatDate(iso: string, lang: Lang): string {
  const [, m, d] = iso.split("-").map(Number);
  const day = d;
  const month = lang === "kk" ? MONTHS_KK[m - 1] : MONTHS_RU[m - 1];
  return `${day} ${month}`;
}

/** "2026-05" → "мамыр" / "май" (қысқа) */
export function formatMonthShort(monthKey: string, lang: Lang): string {
  const m = Number(monthKey.split("-")[1]);
  return lang === "kk" ? MONTHS_KK_SHORT[m - 1] : MONTHS_RU_SHORT[m - 1];
}

/** "2026-05" → "Мамыр 2026" / "Май 2026" */
export function formatMonthLong(monthKey: string, lang: Lang): string {
  const [y, m] = monthKey.split("-").map(Number);
  if (lang === "ru") return `${MONTHS_RU_NOM[m - 1]} ${y}`;
  const name = MONTHS_KK[m - 1];
  const cap = name.charAt(0).toUpperCase() + name.slice(1);
  return `${cap} ${y}`;
}
