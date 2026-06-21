"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { exportCSV, saveQRIS, getQRIS, deleteQRIS } from "@/lib/db";

export default function PengaturanPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [qrisLoading, setQrisLoading] = useState(true);
  const [qrisUploading, setQrisUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getQRIS().then((data) => {
      setQrisPreview(data);
      setQrisLoading(false);
    });
  }, []);

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

  const handleQRISUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrisUploading(true);
    try {
      await saveQRIS(file);
      const preview = await getQRIS();
      setQrisPreview(preview);
      setFeedback("QRIS berhasil diupload!");
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback("Gagal upload QRIS. Coba lagi.");
      setTimeout(() => setFeedback(""), 3000);
    } finally {
      setQrisUploading(false);
    }
  };

  const handleQRISDelete = async () => {
    const ok = confirm("Hapus QRIS yang tersimpan?");
    if (!ok) return;
    try {
      await deleteQRIS();
      setQrisPreview(null);
      setFeedback("QRIS dihapus.");
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback("Gagal menghapus QRIS.");
      setTimeout(() => setFeedback(""), 3000);
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

      {feedback && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium text-center animate-in fade-in mb-4">
          {feedback}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 border-2 border-red-200">
          <h2 className="text-base font-bold text-stone-700 mb-1">
            QRIS Pembayaran
          </h2>
          <p className="text-sm text-stone-400 mb-4">
            Upload gambar QRIS untuk ditampilkan saat pelanggan mau bayar
            transfer.
          </p>

          {qrisLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
            </div>
          ) : qrisPreview ? (
            <div>
              <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200 mb-3">
                <img
                  src={qrisPreview}
                  alt="QRIS Preview"
                  className="w-full h-full object-contain p-3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={qrisUploading}
                  className="flex-1 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 transition-all duration-150"
                >
                  Ganti QRIS
                </button>
                <button
                  onClick={handleQRISDelete}
                  className="py-3 px-4 border-2 border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 active:scale-[0.98] transition-all duration-150"
                >
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={qrisUploading}
              className="w-full py-4 border-2 border-dashed border-red-300 rounded-xl text-red-500 font-bold text-base hover:border-red-500 hover:bg-red-50 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-2"
            >
              {qrisUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upload QRIS
                </>
              )}
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleQRISUpload}
            className="hidden"
          />
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-red-200">
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
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-red-200">
          <h2 className="text-base font-bold text-stone-700 mb-1">
            Tentang Aplikasi
          </h2>
          <p className="text-sm text-stone-400">
            CilokReward v1.0 — Aplikasi loyalitas pelanggan. Data
            disimpan lokal di HP, tidak dikirim ke server mana pun.
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
