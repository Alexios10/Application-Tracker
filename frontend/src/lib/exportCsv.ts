import { Application } from "@/types/application";
import { sortNewestFirst } from "@/lib/applications";

const COLUMNS: { header: string; value: (a: Application) => string }[] = [
  { header: "Bedrift", value: (a) => a.company },
  { header: "Stilling", value: (a) => a.position },
  { header: "Sendt", value: (a) => a.dateSent },
  { header: "Status", value: (a) => a.status },
  { header: "Søknadsfrist", value: (a) => a.deadline ?? "" },
  { header: "Lenke", value: (a) => a.jobUrl ?? "" },
  { header: "Notat", value: (a) => a.note ?? "" },
];

// Quotes a value if it contains the separator, quotes or line breaks
function escape(value: string): string {
  return /[;"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// Builds a CSV file that opens correctly in Norwegian Excel:
// semicolon as separator, and a BOM so æ, ø and å are shown correctly
export function toCsv(applications: Application[]): string {
  const rows = [
    COLUMNS.map((c) => c.header),
    ...sortNewestFirst(applications).map((a) =>
      COLUMNS.map((c) => escape(c.value(a))),
    ),
  ];
  return "﻿" + rows.map((row) => row.join(";")).join("\r\n");
}

export function downloadCsv(applications: Application[]) {
  const blob = new Blob([toCsv(applications)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mine-soknader-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
