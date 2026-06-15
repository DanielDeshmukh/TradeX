import { supabase } from './supabase';

// Session refresh handler
let refreshTimer = null;

export function startSessionRefresh(session) {
  if (!session?.expires_at) return;

  const expiresIn = (session.expires_at * 1000) - Date.now();
  const refreshInterval = Math.max(expiresIn - 60000, 30000); // Refresh 1 min before expiry

  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh failed:', error);
      await supabase.auth.signOut();
    }
  }, refreshInterval);
}

export function stopSessionRefresh() {
  clearTimeout(refreshTimer);
}

// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Rate limiting (client-side)
const rateLimitStore = new Map();

export function checkRateLimit(key, maxAttempts = 5, windowMs = 300000) {
  const now = Date.now();
  const attempts = rateLimitStore.get(key) || [];

  // Remove old attempts outside window
  const validAttempts = attempts.filter((t) => now - t < windowMs);

  if (validAttempts.length >= maxAttempts) {
    const oldestAttempt = validAttempts[0];
    const waitMs = windowMs - (now - oldestAttempt);
    return { allowed: false, waitMs, attemptsLeft: 0 };
  }

  validAttempts.push(now);
  rateLimitStore.set(key, validAttempts);

  return {
    allowed: true,
    waitMs: 0,
    attemptsLeft: maxAttempts - validAttempts.length,
  };
}

// Password strength validation
export function validatePasswordStrength(password) {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  return {
    ...checks,
    score: strength,
    label: labels[strength] || 'Very Weak',
    isValid: strength >= 3,
  };
}

// Audit logging
export async function logAuditEvent(eventType, details = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      event_type: eventType,
      details,
      ip_address: 'client-side',
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

// CSRF token generation
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Validate redirect URL (prevent open redirect)
export function validateRedirectUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    // Only allow same-origin or configured domains
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}
