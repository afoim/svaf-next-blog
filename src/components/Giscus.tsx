'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { siteConfig } from '@/lib/config/site';

const STORAGE_KEY = 'cookie-consent-preferences';
const CONSENT_VERSION = '2.0';

const GISCUS_CONFIG = {
  src: 'https://giscus.app/client.js',
  'data-repo': siteConfig.giscus.repo,
  'data-repo-id': siteConfig.giscus.repoId,
  'data-category': siteConfig.giscus.category,
  'data-category-id': siteConfig.giscus.categoryId,
  'data-mapping': 'og:title',
  'data-strict': '1',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'top',
  'data-lang': 'zh-CN',
  'data-loading': 'lazy',
  crossorigin: 'anonymous',
};

function checkFunctionalConsent(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.version === CONSENT_VERSION && data.preferences?.functional) {
        return true;
      }
    }
  } catch {}
  return false;
}

export function Giscus() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const scriptInjected = useRef(false);

  const loadGiscus = useCallback(() => {
    if (!containerRef.current || scriptInjected.current) return;
    scriptInjected.current = true;

    const container = containerRef.current;
    container.innerHTML = '';

    const script = document.createElement('script');
    for (const [attr, value] of Object.entries(GISCUS_CONFIG)) {
      script.setAttribute(attr, value);
    }
    script.setAttribute(
      'data-theme',
      theme === 'dark' ? 'dark_protanopia' : 'light_protanopia',
    );
    script.async = true;
    container.appendChild(script);
    setLoaded(true);
  }, [theme]);

  // Initial mount: check existing consent
  useEffect(() => {
    if (checkFunctionalConsent()) {
      loadGiscus();
    }

    const handleConsentUpdate = (e: CustomEvent) => {
      const preferences = e.detail;
      if (preferences.functional && !scriptInjected.current) {
        loadGiscus();
      }
    };

    window.addEventListener(
      'cookie-consent-updated',
      handleConsentUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        'cookie-consent-updated',
        handleConsentUpdate as EventListener,
      );
    };
  }, [loadGiscus]);

  // Sync theme after loaded
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          giscus: {
            setConfig: {
              theme: theme === 'dark' ? 'dark_protanopia' : 'light_protanopia',
            },
          },
        },
        'https://giscus.app',
      );
    }
  }, [theme]);

  return (
    <div className="mt-12 border-t pt-8">
      {!loaded && (
        <div className="flex items-start gap-3 rounded-lg border p-4 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
          >
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <div>
            <p className="font-medium">评论功能需要启用功能性 Cookie</p>
            <p className="text-muted-foreground mt-1">
              请在{' '}
              <a
                href="#"
                id="open_preferences_center"
                className="text-primary underline"
              >
                Cookie 设置
              </a>{' '}
              中启用
            </p>
          </div>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
