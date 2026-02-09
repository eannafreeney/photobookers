import { CreatorClaim } from "../db/schema";

/**
 * Generates a unique verification code (6-8 alphanumeric characters)
 */
export function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes confusing chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Sets expiration date for verification code (default: 7 days)
 */
export function getCodeExpiration(days: number = 7): Date {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + days);
  return expiration;
}

/**
 * Normalizes URL to ensure consistent format
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();

  // Add https:// if no protocol
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, "");

  return normalized;
}

/**
 * Verifies that a website contains the verification code
 */
export async function verifyWebsite(
  url: string,
  code: string,
): Promise<{ verified: boolean; error?: string }> {
  try {
    const normalizedUrl = normalizeUrl(url);

    // Fetch the website
    const response = await fetch(normalizedUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; IndiePhotoBooks/1.0; +https://yourdomain.com/bot)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return {
        verified: false,
        error: `Website returned status ${response.status}`,
      };
    }

    const html = await response.text();

    // Check in visible text (case-insensitive)
    const codeInText = html.toLowerCase().includes(code.toLowerCase());

    // Check in meta tags
    const metaTagMatch = html.match(
      /<meta\s+name=["']verification-code["']\s+content=["']([^"']+)["']/i,
    );
    const codeInMeta = metaTagMatch?.[1]?.toLowerCase() === code.toLowerCase();

    if (!codeInText && !codeInMeta) {
      return {
        verified: false,
        error: "Verification code not found on website",
      };
    }

    return { verified: true };
  } catch (error: any) {
    // Handle different error types
    if (error.name === "AbortError") {
      return {
        verified: false,
        error: "Request timed out. Please check your website is accessible.",
      };
    }

    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return {
        verified: false,
        error: "Could not connect to website. Please check the URL is correct.",
      };
    }

    return {
      verified: false,
      error: `Verification failed: ${error.message}`,
    };
  }
}

/**
 * Checks if verification code has expired
 */
export function isCodeExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

export function getHostname(url: string): string {
  const normalized = normalizeUrl(url);
  try {
    const u = new URL(normalized);
    let host = u.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    return host;
  } catch {
    return "";
  }
}

export function isSameDomain(urlA: string, urlB: string): boolean {
  return getHostname(urlA) === getHostname(urlB);
}
