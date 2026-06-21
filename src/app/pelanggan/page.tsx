"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getPelangganById,
  catatPembelian,
  tukarReward,
  batalkanPembelianTerakhir,
  updatePelangganNama,
  updatePelangganNomor,
  deletePelanggan,
} from "@/lib/db";
import type { Pelanggan } from "@/lib/types";
import StempelProgress from "@/components/StempelProgress";
import RewardModal from "@/components/RewardModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Content />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-dvh">
      <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );
}

function Content() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") ?? "";
  const router = useRouter();
  const [pelanggan, setPelanggan] = useState<Pelanggan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [recentBell, setRecentBell] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [namaBaru, setNamaBaru] = useState("");
  const [showBatalConfirm, setShowBatalConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNomor, setShowNomor] = useState(false);
  const [nomorBaru, setNomorBaru] = useState("");

  const loadData = useCallback(async () => {
    try {
      const data = await getPelangganById(Number(id));
      if (!data) {
        router.push("/");
        return;
      }
      setPelanggan(data);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCatatPembelian = async () => {
    if (!pelanggan || processing) return;

    if (pelanggan.stempel_aktif >= 10) {
      setShowReward(true);
      setProcessing(true);
      setTimeout(() => setProcessing(false), 3000);
      return;
    }

    setProcessing(true);
    setFeedback("");
    try {
      const result = await catatPembelian(pelanggan.id);
      setPelanggan(result.pelanggan);
      setRecentBell(true);
      setTimeout(() => setRecentBell(false), 600);
      if (result.dapatReward) {
        setShowReward(true);
      } else {
        setFeedback("Pembelian tercatat!");
        setTimeout(() => setFeedback(""), 2000);
      }
    } catch {
      setFeedback("Gagal mencatat. Coba lagi.");
      setTimeout(() => setFeedback(""), 2000);
    } finally {
      setTimeout(() => setProcessing(false), 3000);
    }
  };

  const handleTukarReward = async () => {
    if (!pelanggan) return;
    setProcessing(true);
    try {
      const updated = await tukarReward(pelanggan.id);
      setPelanggan(updated);
      setShowReward(false);
      setFeedback("Reward berhasil ditukar!");
      setTimeout(() => setFeedback(""), 2000);
    } catch {
      setFeedback("Gagal menukar reward.");
      setTimeout(() => setFeedback(""), 2000);
    } finally {
      setProcessing(false);
    }
  };

  const lakukanBatalkan = async () => {
    if (!pelanggan || processing) return;
    setShowBatalConfirm(false);
    setProcessing(true);
    try {
      const updated = await batalkanPembelianTerakhir(pelanggan.id);
      setPelanggan(updated);
      setFeedback("Pembelian terakhir dibatalkan.");
      setTimeout(() => setFeedback(""), 2000);
    } catch {
      setFeedback("Gagal membatalkan.");
      setTimeout(() => setFeedback(""), 2000);
    } finally {
      setProcessing(false);
    }
  };

  const handleBatalkan = () => {
    if (!pelanggan || processing) return;
    if (pelanggan.riwayat_beli.length === 0) return;
    setShowBatalConfirm(true);
  };

  const handleBukaRename = () => {
    if (!pelanggan) return;
    setShowSettings(false);
    setNamaBaru(pelanggan.nama);
    setShowRename(true);
  };

  const handleRename = async () => {
    if (!pelanggan || !namaBaru.trim()) return;
    setProcessing(true);
    try {
      const updated = await updatePelangganNama(pelanggan.id, namaBaru.trim());
      setPelanggan(updated);
      setShowRename(false);
      setFeedback("Nama berhasil diubah!");
      setTimeout(() => setFeedback(""), 2000);
    } catch {
      setFeedback("Gagal mengubah nama.");
      setTimeout(() => setFeedback(""), 2000);
    } finally {
      setProcessing(false);
    }
  };

  const handleBukaDelete = () => {
    setShowSettings(false);
    setShowDeleteConfirm(true);
  };

  const handleBukaNomor = () => {
    if (!pelanggan) return;
    setShowSettings(false);
    setNomorBaru(pelanggan.nomor_wa);
    setShowNomor(true);
  };

  const handleNomorSave = async () => {
    if (!pelanggan || !nomorBaru.trim()) return;
    setProcessing(true);
    try {
      const updated = await updatePelangganNomor(pelanggan.id, nomorBaru.trim());
      setPelanggan(updated);
      setShowNomor(false);
      setFeedback("Nomor berhasil diubah!");
      setTimeout(() => setFeedback(""), 2000);
    } catch {
      setFeedback("Gagal mengubah nomor.");
      setTimeout(() => setFeedback(""), 2000);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!pelanggan) return;
    setShowDeleteConfirm(false);
    setProcessing(true);
    try {
      await deletePelanggan(pelanggan.id);
      router.push("/");
    } catch {
      setFeedback("Gagal menghapus pelanggan.");
      setTimeout(() => setFeedback(""), 2000);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!pelanggan) return null;

  const riwayatAman = pelanggan.riwayat_beli ?? [];
  const riwayatTerbalik = [...riwayatAman].reverse();

  return (
    <div className="flex flex-col min-h-dvh pb-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/")}
          className="p-2 -ml-2 text-stone-500 hover:text-stone-800 active:scale-90 transition-all duration-150"
          aria-label="Kembali"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-stone-800 truncate">{pelanggan.nama}</h1>
          <p className="text-sm text-stone-400">{pelanggan.nomor_wa}</p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-stone-400 hover:text-stone-600 active:scale-90 transition-all duration-150"
          aria-label="Pengaturan pelanggan"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border-2 border-red-200 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-stone-700">Stempel Digital</h2>
          <span className="text-sm font-semibold text-stone-400">
            {pelanggan.stempel_aktif}/10
          </span>
        </div>
        <StempelProgress current={pelanggan.stempel_aktif} />

        <div className="grid grid-cols-3 gap-3 mt-5 text-center">
          <div className="bg-red-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-red-600">{pelanggan.total_beli}</div>
            <div className="text-xs text-stone-400 mt-0.5">Total Beli</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-amber-600">{pelanggan.reward_claimed}</div>
            <div className="text-xs text-stone-400 mt-0.5">Reward</div>
          </div>
          <div className="bg-stone-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-stone-500">{riwayatAman.length}</div>
            <div className="text-xs text-stone-400 mt-0.5">Kunjungan</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCatatPembelian}
        disabled={processing}
        className={`w-full py-5 rounded-2xl font-bold text-xl text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 mb-3 flex items-center justify-center gap-2 ${
          recentBell
            ? "bg-green-600 scale-[1.02]"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {processing ? (
          <>
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Catat Pembelian
          </>
        )}
      </button>

      {feedback && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium text-center animate-in fade-in mb-3">
          {feedback}
        </div>
      )}

      {pelanggan.riwayat_beli && pelanggan.riwayat_beli.length > 0 && (
        <button
          onClick={handleBatalkan}
          disabled={processing}
          className="w-full py-3 text-sm text-stone-400 hover:text-red-500 font-medium transition-colors duration-150 mb-3 disabled:opacity-50"
        >
          Batalkan pembelian terakhir
        </button>
      )}

      <div className="bg-white rounded-2xl p-5 border-2 border-red-200">
        <h2 className="text-base font-bold text-stone-700 mb-3">
          Riwayat Pembelian
        </h2>
        {riwayatTerbalik.length === 0 ? (
          <p className="text-sm text-stone-400">Belum ada pembelian</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {riwayatTerbalik.map((waktu, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0"
              >
                <span className="text-sm text-stone-600">
                  Pembelian ke-{pelanggan.riwayat_beli.length - i}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(waktu).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReward && (
        <RewardModal
          nama={pelanggan.nama}
          onTukar={handleTukarReward}
          onClose={() => setShowReward(false)}
        />
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-xl animate-in zoom-in-95 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-800">Pengaturan</h3>
              <p className="text-sm text-stone-400">{pelanggan.nama}</p>
            </div>
            <button
              onClick={handleBukaRename}
              className="w-full px-4 py-3 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-3 active:bg-stone-100 transition-colors"
            >
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Ganti Nama
            </button>
            <button
              onClick={handleBukaNomor}
              className="w-full px-4 py-3 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-3 active:bg-stone-100 transition-colors"
            >
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Ganti Nomor
            </button>
            <button
              onClick={handleBukaDelete}
              className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 active:bg-red-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus
            </button>
          </div>
        </div>
      )}

      {showRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in" onClick={() => setShowRename(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-stone-800 mb-1">Ganti Nama</h3>
            <p className="text-sm text-stone-400 mb-4">Masukkan nama baru</p>
            <input
              type="text"
              value={namaBaru}
              onChange={(e) => setNamaBaru(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-stone-200 text-sm font-medium text-stone-800 placeholder-stone-300 focus:outline-none focus:border-red-400 transition-colors mb-4"
              placeholder="Nama pelanggan"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRename(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all duration-150"
              >
                Batal
              </button>
              <button
                onClick={handleRename}
                disabled={!namaBaru.trim() || processing}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-150 disabled:opacity-50"
              >
                {processing ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNomor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in" onClick={() => setShowNomor(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-stone-800 mb-1">Ganti Nomor WA</h3>
            <p className="text-sm text-stone-400 mb-4">Masukkan nomor WhatsApp baru</p>
            <input
              type="text"
              inputMode="numeric"
              value={nomorBaru}
              onChange={(e) => setNomorBaru(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-stone-200 text-sm font-medium text-stone-800 placeholder-stone-300 focus:outline-none focus:border-red-400 transition-colors mb-4"
              placeholder="Contoh: 08123456789"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNomorSave();
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNomor(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all duration-150"
              >
                Batal
              </button>
              <button
                onClick={handleNomorSave}
                disabled={!nomorBaru.trim() || processing}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-150 disabled:opacity-50"
              >
                {processing ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatalConfirm && (
        <ConfirmModal
          title="Batalkan Pembelian"
          message={`Batalkan pembelian terakhir untuk ${pelanggan.nama}?`}
          confirmLabel="Batalkan"
          cancelLabel="Tutup"
          onConfirm={lakukanBatalkan}
          onCancel={() => setShowBatalConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Hapus Pelanggan"
          message={`Yakin hapus ${pelanggan.nama}? Semua data akan hilang.`}
          confirmLabel="Hapus"
          cancelLabel="Batal"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
