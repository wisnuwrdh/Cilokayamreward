"use client";

interface RewardModalProps {
  nama: string;
  onTukar: () => void;
  onClose: () => void;
}

export default function RewardModal({ nama, onTukar, onClose }: RewardModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-xl font-bold text-stone-800 mb-2">
          {nama} berhak dapat cilok gratis!
        </h2>
        <p className="text-stone-500 text-sm mb-6">
          Stempel sudah mencapai 10. Konfirmasi penukaran reward secara lisan ke
          pelanggan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-red-200 text-red-600 font-semibold text-base hover:bg-red-50 transition-colors duration-150 active:scale-95"
          >
            Nanti
          </button>
          <button
            onClick={onTukar}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-600 text-white font-semibold text-base hover:bg-amber-700 transition-colors duration-150 active:scale-95"
          >
            Tukar Reward
          </button>
        </div>
      </div>
    </div>
  );
}
