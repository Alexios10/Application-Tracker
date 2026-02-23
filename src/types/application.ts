export type ApplicationStatus = 
  | "Sendt" 
  | "Avslag" 
  | "Mulig avslag" 
  | "Avslag etter test"
  | "Lagt ut på nytt"
  | "Intervju"
  | "Tilbud";

export interface Application {
  id: string;
  company: string;
  position: string;
  dateSent: string;
  status: ApplicationStatus;
  note?: string;
}
