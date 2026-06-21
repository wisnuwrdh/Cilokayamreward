"use client";

import { useEffect, useState, useCallback } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleBeforeInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (!dismissed) setShowPrompt(true);
  }, []);

  const handleAppInstalled = useCallback(() => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  }, []);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [handleBeforeInstallPrompt, handleAppInstalled]);

  if (!showPrompt) return null;

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 bg-red-600 text-white rounded-xl p-4 shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base">Install aplikasi ini</p>
        <p className="text-red-100 text-sm">Akses cepat seperti aplikasi biasa</p>
      </div>
      <button
        onClick={install}
        className="px-4 py-2 bg-white text-red-600 font-bold text-sm rounded-lg hover:bg-red-50 active:scale-95 transition-all duration-150 flex-shrink-0"
      >
        Install
      </button>
      <button
        onClick={dismiss}
        className="text-red-200 hover:text-white flex-shrink-0"
        aria-label="Tutup"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
