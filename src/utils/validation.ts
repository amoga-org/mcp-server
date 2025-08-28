/**
 * Validation utilities for security and input checking
 */

/**
 * Check if a URL ends with .io domain
 * @param url - The URL to check
 * @returns true if the URL ends with .io
 */
export function isBlockedDomain(url: string | undefined): boolean {
  if (!url) return false;
  
  try {
    // Handle both full URLs and domain-only strings
    let hostname: string;
    
    if (url.includes('://')) {
      // Full URL
      const urlObj = new URL(url);
      hostname = urlObj.hostname.toLowerCase();
    } else {
      // Domain only or path - handle potential port numbers
      hostname = url.toLowerCase();
      // Remove any paths if present
      hostname = hostname.split('/')[0];
      // Remove port if present
      hostname = hostname.split(':')[0];
    }
    
    // Check if hostname ends with .io
    return hostname.endsWith('.io');
  } catch (error) {
    // If URL parsing fails, check the raw string more carefully
    const cleanUrl = url.toLowerCase().split('/')[0].split(':')[0];
    return cleanUrl.endsWith('.io');
  }
}

/**
 * Validates if the baseUrl is allowed
 * @param baseUrl - The base URL to validate
 * @throws Error if the URL is blocked
 */
export function validateBaseUrl(baseUrl: string | undefined): void {
  if (isBlockedDomain(baseUrl)) {
    throw new Error('Access denied: .io domains are blocked for security reasons');
  }
}

/**
 * Error response for blocked domains
 */
export const BLOCKED_DOMAIN_RESPONSE = {
  content: [
    {
      type: "text" as const,
      text: "❌ Access denied: .io domains are blocked for security reasons. Please use a valid domain.",
    },
  ],
};