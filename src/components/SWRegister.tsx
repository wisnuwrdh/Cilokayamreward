"use client";

import { useEffect, useState } from "react";

export default function SWRegister() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateReady(true);
          }
        });
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  if (!updateReady) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 bg-red-600 text-white rounded-xl p-4 shadow-lg animate-in slide-in-from-bottom duration-300">
      <p className="font-bold text-base mb-2">Pembaruan tersedia</p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            setUpdateReady(false);
            navigator.serviceWorker.getRegistration().then((reg) => {
              reg?.waiting?.postMessage("skip-waiting");
            });
          }}
          className="flex-1 py-2 px-4 bg-white text-red-600 font-bold text-sm rounded-lg hover:bg-red-50 active:scale-95 transition-all duration-150"
        >
          Segarkan
        </button>
        <button
          onClick={() => setUpdateReady(false)}
          className="text-red-200 hover:text-white text-sm"
        >
          Nanti
        </button>
      </div>
    </div>
  );
}
