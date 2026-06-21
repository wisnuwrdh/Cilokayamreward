"use client";

import { useEffect } from "react";

export default function ContextMenuBlocker() {
  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", handler);
    document.addEventListener("selectstart", handler);
    return () => {
      document.removeEventListener("contextmenu", handler);
      document.removeEventListener("selectstart", handler);
    };
  }, []);

  return null;
}
