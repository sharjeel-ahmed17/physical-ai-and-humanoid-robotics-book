// Security middleware for authentication module
import { NextRequest, NextResponse } from 'next/server';
import type { NextMiddleware } from 'next/server';

// Security headers to add to all responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; font-src 'self' https: data:; img-src 'self' data: https:; object-src 'none'; script-src 'self'; style-src 'self' https: 'unsafe-inline'",
};

// Rate limiting storage (in a real implementation, this would be in Redis or similar)
interface RateLimitStore {
  count: number;
  timestamp: number;
}

const rateLimitStore = new Map<string, RateLimitStore>();

// Check if request is rate limited
function isRateLimited(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    // First request from this identifier
    rateLimitStore.set(identifier, { count: 1, timestamp: now });
    return false;
  }

  // Check if window has passed
  if (now - record.timestamp > windowMs) {
    // Reset the counter
    rateLimitStore.set(identifier, { count: 1, timestamp: now });
    return false;
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return true;
  }

  // Increment the counter
  rateLimitStore.set(identifier, { count: record.count + 1, timestamp: record.timestamp });
  return false;
}

// Sanitize input function
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Sanitize request body
function sanitizeRequestBody(body: any): any {
  if (typeof body === 'string') {
    return sanitizeInput(body);
  } else if (Array.isArray(body)) {
    return body.map(item => sanitizeRequestBody(item));
  } else if (typeof body === 'object' && body !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(body)) {
      sanitized[key] = sanitizeRequestBody(value);
    }
    return sanitized;
  }
  return body;
}

// Authentication middleware with security protections
export const authMiddleware: NextMiddleware = (request: NextRequest) => {
  const response = NextResponse.next();

  // Add security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Check for potential malicious patterns in headers
  const userAgent = request.headers.get('user-agent');
  if (userAgent && isMaliciousUserAgent(userAgent)) {
    console.warn(`Blocked request from suspicious user agent: ${userAgent}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Rate limiting for authentication endpoints
  const pathname = request.nextUrl.pathname;
  if (pathname.includes('/api/auth')) {
    const clientIP = getClientIP(request);
    const rateLimitKey = `${clientIP}:${pathname}`;

    // Apply different rate limits based on endpoint
    let maxRequests = 10;
    let windowMs = 60 * 1000; // 1 minute

    if (pathname.includes('/signin') || pathname.includes('/signup')) {
      maxRequests = 5; // Lower rate limit for auth attempts
      windowMs = 15 * 60 * 1000; // 15 minutes
    }

    if (isRateLimited(rateLimitKey, maxRequests, windowMs)) {
      console.warn(`Rate limit exceeded for ${clientIP} on ${pathname}`);
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }
  }

  // Sanitize request body for authentication endpoints
  if (request.method === 'POST' && pathname.includes('/api/auth')) {
    // Note: In Next.js middleware, we can't directly modify the request body
    // The sanitization should happen in the API route handlers
    // But we can validate and block requests with obvious malicious content in headers/URL
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      // We can't read the body in middleware, but we can check for obvious malicious patterns in URL
      const queryString = request.nextUrl.search;
      if (isMaliciousContent(queryString)) {
        console.warn(`Blocked request with malicious content in query: ${queryString}`);
        return new NextResponse('Bad Request', { status: 400 });
      }
    }
  }

  return response;
};

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Handle multiple IPs in the header (comma separated)
    const firstIP = forwardedFor.split(',')[0].trim();
    return firstIP || 'unknown';
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // For local development
  return request.ip || 'unknown';
}

// Helper function to detect malicious user agents
function isMaliciousUserAgent(userAgent: string): boolean {
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /nmap/i,
    /dirbuster/i,
    /hydra/i,
    /medusa/i,
    /patator/i,
    /zmap/i,
    /masscan/i,
    /gobuster/i,
    /wfuzz/i,
    /arachni/i,
    /w3af/i,
    /skipfish/i,
    /zap/i,
    /burp/i,
    /netsparker/i,
    /acunetix/i,
    /appscan/i,
    /webinspect/i,
    /nessus/i,
    /openvas/i,
  ];

  return maliciousPatterns.some(pattern => pattern.test(userAgent));
}

// Helper function to detect malicious content
function isMaliciousContent(content: string): boolean {
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /document\.cookie/i,
    /window\.location/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return maliciousPatterns.some(pattern => pattern.test(content));
}

// Middleware to protect specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/api/(auth|auth/.*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};