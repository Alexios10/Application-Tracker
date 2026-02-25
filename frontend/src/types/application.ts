export type ApplicationStatus =
  | "Sendt"
  | "Avslag"
  | "Intervju"
  | "Tilbud"
  | "Ghosted";

export interface Application {
  id: string;
  company: string;
  position: string;
  dateSent: string;
  status: ApplicationStatus;
  note?: string;
}
