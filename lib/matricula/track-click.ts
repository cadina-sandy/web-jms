'use client';
import { track } from '@vercel/analytics';
import type { EnrollmentClickEvent } from './click-events';

// Independent analytics paths: neither can interrupt or reset the enrollment form.
export function trackEnrollmentClick(event: EnrollmentClickEvent) {
  try { track(event); } catch { /* Analytics may be unavailable or blocked. */ }
  try {
    void fetch('/api/matriculas/eventos/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, id: crypto.randomUUID() }), keepalive: true,
    }).catch(() => undefined);
  } catch { /* Opening the form must work even without telemetry. */ }
}
