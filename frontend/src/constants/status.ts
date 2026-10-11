import { ApplicationStatus } from "@/types/application";

// The order statuses are shown in, from "still waiting" to "finished"
export const STATUSES: ApplicationStatus[] = [
  "Sendt",
  "Intervju",
  "Tilbud",
  "Avslag",
  "Ghosted",
];

// "all" means no status filter
export type StatFilter = "all" | ApplicationStatus;

// Tailwind needs the full class names written out, so they are listed here
// instead of being built from the status name
export const STATUS_DOT: Record<ApplicationStatus, string> = {
  Sendt: "bg-status-Sendt",
  Intervju: "bg-status-Intervju",
  Tilbud: "bg-status-Tilbud",
  Avslag: "bg-status-Avslag",
  Ghosted: "bg-status-Ghosted",
};
