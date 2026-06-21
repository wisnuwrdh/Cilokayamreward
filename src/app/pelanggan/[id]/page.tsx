"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getPelangganById,
  catatPembelian,
  tukarReward,
  batalkanPembelianTerakhir,
} from "@/lib/db";
import type { Pelanggan } from "@/lib/types";
import StempelProgress from "@/components/StempelProgress";
import RewardModal from "@/components/RewardModal";

export default function DetailPelangganPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pelanggan, setPelanggan] = useState<Pelanggan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [recentBell, setRecentBell] = useState(false);

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
      setProcessing(false);
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

  const handleBatalkan = async () => {
    if (!pelanggan || processing) return;
    if (pelanggan.riwayat_beli.length === 0) return;
    const ok = confirm(
      "Batalkan pembelian terakhir untuk " + pelanggan.nama + "?"
    );
    if (!ok) return;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!pelanggan) return null;

  const riwayatTerbalik = [...pelanggan.riwayat_beli].reverse();

  return (
    <div className="flex flex-col min-h-dvh pb-4">
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
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-stone-800 truncate">{pelanggan.nama}</h1>
          <p className="text-sm text-stone-400">{pelanggan.nomor_wa}</p>
        </div>
      </div>

      <div className="bg-orange-50 rounded-2xl p-5 border border-red-100 mb-4">
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
            <div className="text-2xl font-bold text-stone-500">{pelanggan.riwayat_beli.length}</div>
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

      {pelanggan.riwayat_beli.length > 0 && (
        <button
          onClick={handleBatalkan}
          disabled={processing}
          className="w-full py-3 text-sm text-stone-400 hover:text-red-500 font-medium transition-colors duration-150 mb-3 disabled:opacity-50"
        >
          Batalkan pembelian terakhir
        </button>
      )}

      <div className="bg-orange-50 rounded-2xl p-5 border border-red-100">
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
    </div>
  );
}
