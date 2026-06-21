"use client";

import { memo } from "react";

interface PelangganCardProps {
  id: number;
  nama: string;
  nomor_wa: string;
  total_beli: number;
  stempel_aktif: number;
}

const PelangganCard = memo(function PelangganCard({
  id,
  nama,
  nomor_wa,
  total_beli,
  stempel_aktif,
}: PelangganCardProps) {
  return (
    <a
      href={`/pelanggan/${id}`}
      className="block bg-white rounded-xl p-4 border-2 border-red-200 hover:border-red-500 hover:shadow-md active:scale-[0.98] transition-all duration-150"
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-stone-800 truncate">{nama}</h3>
          <p className="text-sm text-stone-400 mt-0.5">{nomor_wa}</p>
        </div>
        <div className="flex items-center gap-3 ml-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">
              {stempel_aktif}
            </div>
            <div className="text-xs text-stone-400">/10 stempel</div>
          </div>
          <svg
            className="w-5 h-5 text-stone-300 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
      <div className="mt-2 text-xs text-stone-400">
        Total beli: {total_beli}x
      </div>
    </a>
  );
});

export default PelangganCard;
