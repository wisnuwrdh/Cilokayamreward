"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPelangganByWA, addPelanggan } from "@/lib/db";

export default function TambahPelangganPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [nomorWA, setNomorWA] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    if (!nama.trim() || nama.trim().length < 2) {
      setError("Nama wajib diisi (minimal 2 karakter)");
      return false;
    }
    if (!/^\d{10,}$/.test(nomorWA.trim())) {
      setError("Nomor WA wajib diisi, hanya angka, minimal 10 digit");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const existing = await getPelangganByWA(nomorWA.trim());
      if (existing) {
        setError("Nomor WA sudah terdaftar untuk " + existing.nama);
        setLoading(false);
        return;
      }

      await addPelanggan(nama.trim(), nomorWA.trim());
      router.push("/");
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-stone-800">Pelanggan Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="nama" className="block text-sm font-semibold text-stone-700 mb-2">
            Nama Panggilan
          </label>
          <input
            id="nama"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Bu RT, Mas Budi"
            className="w-full px-4 py-4 bg-white border border-red-200 rounded-xl text-base text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            autoFocus
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="nomorWA" className="block text-sm font-semibold text-stone-700 mb-2">
            Nomor WhatsApp
          </label>
          <input
            id="nomorWA"
            type="tel"
            inputMode="numeric"
            value={nomorWA}
            onChange={(e) => setNomorWA(e.target.value.replace(/\D/g, ""))}
            placeholder="081234567890"
            className="w-full px-4 py-4 bg-white border border-red-200 rounded-xl text-base text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            autoComplete="off"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-red-600 text-white font-bold text-lg rounded-xl hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all duration-150 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan & Catat Pembelian Pertama"
          )}
        </button>
      </form>
    </div>
  );
}
