import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a currency string
 * @param value - Number to format
 * @param currency - Currency symbol (default: $)
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatCurrency(
  value: number | string,
  currency = "$",
  decimals = 2
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return `${currency}0.00`;
  
  // For large numbers (millions)
  if (numValue >= 1000000) {
    return `${currency}${(numValue / 1000000).toFixed(1)}M`;
  }
  
  // For regular numbers
  return `${currency}${numValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Formats a crypto value with appropriate decimals
 * @param value - Number to format
 * @param symbol - Crypto symbol (e.g., ETH, BTC)
 * @param maxDecimals - Maximum number of decimal places
 */
export function formatCryptoValue(
  value: number | string,
  symbol: string,
  maxDecimals = 6
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return `0 ${symbol}`;
  
  // Different precision for different assets
  let decimals = maxDecimals;
  if (symbol === "BTC" || symbol === "WBTC") {
    decimals = 8;
  } else if (symbol === "ETH" || symbol === "PLS") {
    decimals = 6;
  } else if (symbol === "USDC" || symbol === "USDT") {
    decimals = 2;
  }
  
  // Remove trailing zeros
  const formattedValue = parseFloat(numValue.toFixed(decimals)).toString();
  
  return `${formattedValue} ${symbol}`;
}

/**
 * Calculates the bridge fee
 * @param amount - Amount to bridge
 * @param feePercentage - Fee percentage (0.03 = 3%)
 */
export function calculateBridgeFee(
  amount: number | string,
  feePercentage = 0.03
): number {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 0;
  return numAmount * feePercentage;
}

/**
 * Truncates a string to a specified length and adds ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}

/**
 * Checks if an object is empty
 * @param obj - Object to check
 */
export function isEmptyObject(obj: any): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Debounces a function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
