"use client";

import { useEffect, useState, useCallback, useDeferredValue, memo } from "react";
import { useRouter } from "next/navigation";
import { getAllPelanggan } from "@/lib/db";
import type { Pelanggan } from "@/lib/types";
import PelangganCard from "@/components/PelangganCard";
import SearchBar from "@/components/SearchBar";

const PelangganList = memo(function PelangganList({
  items,
  onEmpty,
}: {
  items: Pelanggan[];
  onEmpty: React.ReactNode;
}) {
  if (items.length === 0) return <>{onEmpty}</>;
  return (
    <div className="flex flex-col gap-2 pb-4">
      {items.map((p) => (
        <PelangganCard
          key={p.id}
          id={p.id}
          nama={p.nama}
          nomor_wa={p.nomor_wa}
          total_beli={p.total_beli}
          stempel_aktif={p.stempel_aktif}
        />
      ))}
    </div>
  );
});

export default function DashboardPage() {
  const router = useRouter();
  const [pelanggans, setPelanggans] = useState<Pelanggan[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getAllPelanggan();
      setPelanggans(data);
    } catch {
      setPelanggans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = pelanggans.filter((p) =>
    p.nama.toLowerCase().includes(deferredSearch.toLowerCase())
  );

  const isStale = search !== deferredSearch;

  return (
    <div className="flex flex-col min-h-dvh">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">
        Cilok Bapak
      </h1>
      <p className="text-stone-500 text-sm mb-4">
        {pelanggans.length} pelanggan terdaftar
      </p>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className={`flex-1 ${isStale ? "opacity-60 transition-opacity" : ""}`}>
          <PelangganList
            items={filtered}
            onEmpty={
              search ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <h2 className="text-lg font-bold text-stone-600 mb-1">
                    Tidak ditemukan
                  </h2>
                  <p className="text-stone-400 text-sm">
                    Tidak ada pelanggan dengan nama &ldquo;{search}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="text-5xl mb-4">🍢</div>
                  <h2 className="text-lg font-bold text-stone-600 mb-1">
                    Belum ada pelanggan
                  </h2>
                  <p className="text-stone-400 text-sm mb-4">
                    Tambahkan pelanggan pertama saat mereka beli cilok
                  </p>
                  <button
                    onClick={() => router.push("/pelanggan/baru")}
                    className="px-6 py-3 bg-red-600 text-white font-bold text-base rounded-xl hover:bg-red-700 active:scale-95 transition-all duration-150"
                  >
                    + Pelanggan Baru
                  </button>
                </div>
              )
            }
          />
        </div>
      )}
    </div>
  );
}
