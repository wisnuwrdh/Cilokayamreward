"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  exportCSV,
  saveQRIS,
  getQRIS,
  deleteQRIS,
  saveWAQR,
  getWAQR,
  deleteWAQR,
  saveWANomor,
  getWANomor,
  deleteWANomor,
} from "@/lib/db";

type Tab = "qris" | "wa";

export default function PengaturanPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("qris");
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState("");

  // QRIS state
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [qrisLoading, setQrisLoading] = useState(true);
  const [qrisUploading, setQrisUploading] = useState(false);
  const qrisFileRef = useRef<HTMLInputElement>(null);

  // WA state
  const [waNomor, setWaNomor] = useState("");
  const [waNomorLoaded, setWaNomorLoaded] = useState(false);
  const [waQrPreview, setWaQrPreview] = useState<string | null>(null);
  const [waQrLoading, setWaQrLoading] = useState(true);
  const [waQrUploading, setWaQrUploading] = useState(false);
  const [waNomorSaving, setWaNomorSaving] = useState(false);
  const waFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getQRIS().then((data) => {
      setQrisPreview(data);
      setQrisLoading(false);
    });
  }, []);

  useEffect(() => {
    getWANomor().then((data) => {
      setWaNomor(data || "");
      setWaNomorLoaded(true);
    });
    getWAQR().then((data) => {
      setWaQrPreview(data);
      setWaQrLoading(false);
    });
  }, []);

  const flashFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  };

  // --- QRIS ---
  const handleQRISUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrisUploading(true);
    try {
      await saveQRIS(file);
      setQrisPreview(await getQRIS());
      flashFeedback("QRIS berhasil diupload!");
    } catch {
      flashFeedback("Gagal upload QRIS.");
    } finally {
      setQrisUploading(false);
    }
  };

  const handleQRISDelete = async () => {
    if (!confirm("Hapus QRIS yang tersimpan?")) return;
    try {
      await deleteQRIS();
      setQrisPreview(null);
      flashFeedback("QRIS dihapus.");
    } catch {
      flashFeedback("Gagal menghapus QRIS.");
    }
  };

  // --- WA ---
  const handleWANomorSave = async () => {
    const bersih = waNomor.trim();
    if (!bersih) {
      flashFeedback("Nomor WA tidak boleh kosong.");
      return;
    }
    setWaNomorSaving(true);
    try {
      await saveWANomor(bersih);
      flashFeedback("Nomor WA disimpan!");
    } catch {
      flashFeedback("Gagal menyimpan nomor WA.");
    } finally {
      setWaNomorSaving(false);
    }
  };

  const handleWAQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWaQrUploading(true);
    try {
      await saveWAQR(file);
      setWaQrPreview(await getWAQR());
      flashFeedback("QR WhatsApp berhasil diupload!");
    } catch {
      flashFeedback("Gagal upload QR WA.");
    } finally {
      setWaQrUploading(false);
    }
  };

  const handleWAQRDelete = async () => {
    if (!confirm("Hapus QR WhatsApp yang tersimpan?")) return;
    try {
      await deleteWAQR();
      setWaQrPreview(null);
      flashFeedback("QR WhatsApp dihapus.");
    } catch {
      flashFeedback("Gagal menghapus QR WA.");
    }
  };

  // --- Export ---
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
      flashFeedback("Data berhasil di-export!");
    } catch {
      flashFeedback("Gagal export data.");
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

      {feedback && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium text-center animate-in fade-in mb-4">
          {feedback}
        </div>
      )}

      {/* --- Toggle Tab --- */}
      <div className="flex rounded-xl bg-stone-100 p-1 mb-4">
        <button
          onClick={() => setTab("qris")}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-150 ${
            tab === "qris"
              ? "bg-white text-red-600 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          QRIS Pembayaran
        </button>
        <button
          onClick={() => setTab("wa")}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-150 ${
            tab === "wa"
              ? "bg-white text-green-600 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Info WhatsApp
        </button>
      </div>

      {/* --- QRIS Tab --- */}
      {tab === "qris" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border-2 border-red-200">
            <h2 className="text-base font-bold text-stone-700 mb-1">
              Upload QRIS
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
                    onClick={() => qrisFileRef.current?.click()}
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
                onClick={() => qrisFileRef.current?.click()}
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
              ref={qrisFileRef}
              type="file"
              accept="image/*"
              onChange={handleQRISUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* --- WA Tab --- */}
      {tab === "wa" && (
        <div className="space-y-4">
          {/* Nomor WA */}
          <div className="bg-white rounded-2xl p-5 border-2 border-green-200">
            <h2 className="text-base font-bold text-stone-700 mb-1">
              Nomor WhatsApp Toko
            </h2>
            <p className="text-sm text-stone-400 mb-4">
              Nomor ini akan ditampilkan di halaman Info WA dan bisa langsung
              dihubungi pelanggan.
            </p>
            {waNomorLoaded ? (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  value={waNomor}
                  onChange={(e) => setWaNomor(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl text-stone-800 placeholder:text-stone-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all mb-3"
                />
                <button
                  onClick={handleWANomorSave}
                  disabled={waNomorSaving}
                  className="w-full py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-2"
                >
                  {waNomorSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Nomor"
                  )}
                </button>
              </>
            ) : (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* QR WhatsApp */}
          <div className="bg-white rounded-2xl p-5 border-2 border-green-200">
            <h2 className="text-base font-bold text-stone-700 mb-1">
              QR Code WhatsApp
            </h2>
            <p className="text-sm text-stone-400 mb-4">
              Upload gambar QR code WhatsApp kamu (opsional). QR ini akan
              muncul di halaman Info WA supaya pelanggan bisa scan.
            </p>

            {waQrLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
              </div>
            ) : waQrPreview ? (
              <div>
                <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200 mb-3">
                  <img
                    src={waQrPreview}
                    alt="QR WA Preview"
                    className="w-full h-full object-contain p-3"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => waFileRef.current?.click()}
                    disabled={waQrUploading}
                    className="flex-1 py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 transition-all duration-150"
                  >
                    Ganti QR WA
                  </button>
                  <button
                    onClick={handleWAQRDelete}
                    className="py-3 px-4 border-2 border-green-200 text-green-600 font-bold text-sm rounded-xl hover:bg-green-50 active:scale-[0.98] transition-all duration-150"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => waFileRef.current?.click()}
                disabled={waQrUploading}
                className="w-full py-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 font-bold text-base hover:border-green-400 hover:bg-green-50 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-2"
              >
                {waQrUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload QR WA
                  </>
                )}
              </button>
            )}

            <input
              ref={waFileRef}
              type="file"
              accept="image/*"
              onChange={handleWAQRUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      <div className="mt-4 space-y-4">
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
            CilokReward v1.1 — Aplikasi loyalitas pelanggan. Data
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
