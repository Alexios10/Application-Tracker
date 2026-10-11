export type ApplicationStatus =
  | "Sendt"
  | "Avslag"
  | "Intervju"
  | "Tilbud"
  | "Ghosted";

export interface Application {
  id: number;
  company: string;
  position: string;
  dateSent: string;
  status: ApplicationStatus;
  note?: string;
  jobUrl?: string | null; // link to the job posting
  deadline?: string | null; // "dd.MM.yy", same format as dateSent
}
