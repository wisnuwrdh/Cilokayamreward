"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getQRIS } from "@/lib/db";

export default function QrisPage() {
  const router = useRouter();
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQRIS().then((data) => {
      setSrc(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
      <button
        onClick={() => router.back()}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-black/10 rounded-full text-stone-700 hover:bg-black/20 active:scale-90 transition-all duration-150 z-10"
        aria-label="Tutup QRIS"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {loading ? (
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      ) : src ? (
        <>
          <p className="text-base font-bold text-stone-700 mb-4">
            Scan QRIS untuk bayar
          </p>
          <div className="w-full max-w-sm aspect-square bg-white rounded-2xl overflow-hidden border-2 border-stone-200">
            <img
              src={src}
              alt="QRIS"
              className="w-full h-full object-contain p-4"
            />
          </div>
        </>
      ) : (
        <div className="text-center px-6">
          <div className="text-5xl mb-3">⊞</div>
          <p className="text-base font-bold text-stone-700 mb-1">
            QRIS belum diupload
          </p>
          <p className="text-sm text-stone-400 mb-4">
            Upload gambar QRIS di halaman Pengaturan
          </p>
          <button
            onClick={() => router.push("/pengaturan")}
            className="px-6 py-3 bg-red-600 text-white font-bold text-base rounded-xl hover:bg-red-700 active:scale-95 transition-all duration-150"
          >
            Ke Pengaturan
          </button>
        </div>
      )}
    </div>
  );
}
