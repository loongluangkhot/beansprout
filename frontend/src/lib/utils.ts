/**
 * Utility Functions
 * Shared utility functions for the application
 */

import { type ClassValue, clsx } from "clsx";

/**
 * Combines class names with proper handling of conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
