import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for PWA compliance & caching
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('PWA ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA ServiceWorker registration failed:', err);
          });
      });
    }

    // 2. Check if already running in standalone mode (installed)
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
      if (isStandalone) {
        setCanInstall(false);
      }
    };

    checkInstalled();

    // 3. Listen for Chromium/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // 4. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. iOS Safari detection (where beforeinstallprompt is not supported)
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    if (isIOS && isSafari && !window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show iOS / manual browser instructions
      setShowIOSPrompt(true);
    }
  }, [deferredPrompt]);

  return {
    canInstall: canInstall && !isInstalled,
    isInstalled,
    installApp,
    showIOSPrompt,
    setShowIOSPrompt
  };
}
