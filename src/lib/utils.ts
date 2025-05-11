import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatuje datę i czas według podanego formatu
 */
export function formatDateTime(isoString: string, options: Intl.DateTimeFormatOptions = {}): string {
  try {
    return new Date(isoString).toLocaleDateString("pl-PL", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoString;
  }
}

/**
 * Oblicza czas trwania w minutach między dwiema datami
 */
export function calculateDurationMinutes(startIsoString: string, endIsoString: string): number {
  try {
    const start = new Date(startIsoString);
    const end = new Date(endIsoString);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / 60000);
  } catch (error) {
    console.error("Error calculating duration:", error);
    return 0;
  }
}

// Sprawdza, czy wartość jest nullem lub undefind
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}
