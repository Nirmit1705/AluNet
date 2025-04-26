import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names or class name objects into a single string
 * Merges Tailwind CSS classes properly using twMerge
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}