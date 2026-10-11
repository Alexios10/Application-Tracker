import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Returns a readable message from an unknown error (e.g. in a catch block)
export function getErrorMessage(err: unknown, fallback = "Ukjent feil"): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
