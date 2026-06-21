"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { exportCSV } from "@/lib/db";

export default function PengaturanPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleExport = async () => {
    setExporting(true);
    setFeedback("");
    try {
      const csv = await exportCSV();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const tanggal = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `pelanggan_${tanggal}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedback("Data berhasil di-export!");
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback("Gagal export data. Coba lagi.");
      setTimeout(() => setFeedback(""), 3000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-stone-500 hover:text-stone-800 active:scale-90 transition-all duration-150"
          aria-label="Kembali"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-stone-800">Pengaturan</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-red-100">
          <h2 className="text-base font-bold text-stone-700 mb-1">
            Export Data Pelanggan
          </h2>
          <p className="text-sm text-stone-400 mb-4">
            Backup data ke file CSV. Disarankan rutin untuk menghindari
            kehilangan data.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-3 bg-red-600 text-white font-bold text-base rounded-xl hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all duration-150 flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengexport...
              </>
            ) : (
              "Export Data (CSV)"
            )}
          </button>
          {feedback && (
            <p className="mt-3 text-sm font-medium text-green-600 text-center animate-in fade-in">
              {feedback}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-red-100">
          <h2 className="text-base font-bold text-stone-700 mb-1">
            Tentang Aplikasi
          </h2>
          <p className="text-sm text-stone-400">
            Cilok Bapak v1.0 — Aplikasi loyalitas pelanggan untuk pedagang
            cilok. Data disimpan lokal di HP, tidak dikirim ke server mana pun.
          </p>
        </div>

        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
          <h2 className="text-base font-bold text-amber-700 mb-1">
            Backup Rutin!
          </h2>
          <p className="text-sm text-amber-600">
            Kalau HP di-reset atau cache browser dibersihkan, data bisa hilang.
            Export CSV secara rutin untuk backup aman.
          </p>
        </div>
      </div>
    </div>
  );
}
