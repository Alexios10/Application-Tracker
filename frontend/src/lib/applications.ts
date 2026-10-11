import { Application } from "@/types/application";

// Dates are stored as "dd.MM.yy", e.g. "02.10.26"
export function parseDate(value: string): Date {
  const [day, month, year] = value.split(".").map(Number);
  return new Date(2000 + year, month - 1, day);
}

export function sortNewestFirst(applications: Application[]): Application[] {
  return [...applications].sort(
    (a, b) => parseDate(b.dateSent).getTime() - parseDate(a.dateSent).getTime(),
  );
}

// Only http(s) links are shown as links, never e.g. "javascript:..."
export function isSafeUrl(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\//i.test(url);
}
