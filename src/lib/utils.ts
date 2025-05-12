import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoString: string, options: Intl.DateTimeFormatOptions = {}): string {
  try {
    return new Date(isoString).toLocaleDateString("pl-PL", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoString;
  }
}

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

export function formatDateRange(start: Date, end: Date): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (startDate.toDateString() === endDate.toDateString()) {
    return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`;
  }

  return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()} - ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`;
}

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
