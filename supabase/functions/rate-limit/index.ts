// Supabase Edge Function: rate-limit
// Authentication rate limiting to prevent brute force attacks
// Security: Limits login attempts per IP/email to prevent credential stuffing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient as _createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Rate limit configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5; // Maximum attempts per window
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minute lockout after exceeding

// In-memory store for rate limiting (for edge function)
// Note: In production with multiple instances, use Redis or database table
const attemptStore = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate rate limit key from IP and email
function getRateLimitKey(ip: string, email?: string): string {
  // Use IP as primary key, combine with email if provided for more granular limiting
  const sanitizedEmail = email?.toLowerCase().trim() || 'unknown';
  return `${ip}:${sanitizedEmail}`;
}

// Clean up expired entries periodically
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of attemptStore.entries()) {
    // Remove entries older than the window + lockout duration
    if (now - data.firstAttempt > WINDOW_MS + LOCKOUT_DURATION_MS) {
      attemptStore.delete(key);
    }
  }
}

// Check if request is rate limited
function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number; remainingAttempts?: number } {
  const now = Date.now();
  const data = attemptStore.get(key);

  // No previous attempts
  if (!data) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // Check if currently locked out
  if (data.lockedUntil && now < data.lockedUntil) {
    const retryAfter = Math.ceil((data.lockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Check if window has expired
  if (now - data.firstAttempt > WINDOW_MS) {
    // Reset the window
    attemptStore.delete(key);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // Check attempt count
  if (data.count >= MAX_ATTEMPTS) {
    // Apply lockout
    data.lockedUntil = now + LOCKOUT_DURATION_MS;
    attemptStore.set(key, data);
    const retryAfter = Math.ceil(LOCKOUT_DURATION_MS / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - data.count - 1 };
}

// Record an attempt
function recordAttempt(key: string): void {
  const now = Date.now();
  const data = attemptStore.get(key);

  if (!data || now - data.firstAttempt > WINDOW_MS) {
    attemptStore.set(key, { count: 1, firstAttempt: now });
  } else {
    data.count++;
    attemptStore.set(key, data);
  }
}

// Reset attempts on successful login
function resetAttempts(key: string): void {
  attemptStore.delete(key);
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Cleanup old entries periodically
  cleanupExpiredEntries();

  try {
    // Get client IP from headers (Supabase edge functions)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    const body = await req.json();
    const { action, email } = body;

    // Generate rate limit key
    const rateLimitKey = getRateLimitKey(clientIp, email);

    if (action === 'check') {
      // Check if rate limited before attempting auth
      const result = checkRateLimit(rateLimitKey);

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            allowed: false,
            error: 'Too many login attempts. Please try again later.',
            retryAfter: result.retryAfter,
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': String(result.retryAfter),
            }
          }
        );
      }

      return new Response(
        JSON.stringify({
          allowed: true,
          remainingAttempts: result.remainingAttempts,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'record-failure') {
      // Record a failed login attempt
      recordAttempt(rateLimitKey);
      const result = checkRateLimit(rateLimitKey);

      return new Response(
        JSON.stringify({
          recorded: true,
          remainingAttempts: result.remainingAttempts,
          locked: !result.allowed,
          retryAfter: result.retryAfter,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'record-success') {
      // Reset attempts on successful login
      resetAttempts(rateLimitKey);

      return new Response(
        JSON.stringify({ reset: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: check, record-failure, or record-success' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rate limit error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
