import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Borne une valeur dans [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Formate un pourcentage : 42.7 -> "43%". */
export function formatPct(value: number): string {
  return `${Math.round(value)}%`
}

/** Formate une température : 71.4 -> "71°C". */
export function formatTemp(celsius: number): string {
  return `${Math.round(celsius)}°C`
}

/** Formate une puissance : 612.5 -> "613 W". */
export function formatWatts(watts: number): string {
  return `${Math.round(watts)} W`
}

/** Formate une quantité de mémoire : 154.2 -> "154 GB". */
export function formatGb(gb: number): string {
  return `${Math.round(gb)} GB`
}
