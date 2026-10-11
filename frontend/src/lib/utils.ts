import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Henter en lesbar feilmelding fra en ukjent feil (f.eks. i en catch-blokk)
export function getErrorMessage(err: unknown, fallback = "Ukjent feil"): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
