'use client';

import { usePathname } from 'next/navigation';
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';

function isPublicPage(pathname: string) {
  return !/^\/(?:personal|api)(?:\/|$)/i.test(pathname);
}

function beforeSend(event: BeforeSendEvent) {
  if (event.type !== 'pageview') return null;

  let url: URL;
  try {
    url = new URL(event.url);
  } catch {
    return null;
  }

  if (!isPublicPage(url.pathname)) return null;

  url.search = '';
  url.hash = '';
  return { ...event, url: url.href };
}

export default function WebAnalytics() {
  const pathname = usePathname();
  return pathname && isPublicPage(pathname) ? <Analytics beforeSend={beforeSend} /> : null;
}
