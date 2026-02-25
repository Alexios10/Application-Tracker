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
}
