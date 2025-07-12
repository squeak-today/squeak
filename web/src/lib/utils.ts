import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TRANSLATABLE_ATTRIBUTE = 'data-translatable'
export const TRANSLATABLE_SELECTOR = '[data-translatable="true"]'
