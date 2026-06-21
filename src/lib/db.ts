import { openDB, IDBPDatabase } from 'idb';
import { Pelanggan } from './types';

const DB_NAME = 'cilok_db';
const DB_VERSION = 1;
const STORE_NAME = 'pelanggan';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('nomor_wa', 'nomor_wa', { unique: false });
          store.createIndex('nama', 'nama', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllPelanggan(): Promise<Pelanggan[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.sort((a, b) => b.id - a.id);
}

export async function getPelangganById(id: number): Promise<Pelanggan | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function getPelangganByWA(nomorWA: string): Promise<Pelanggan | undefined> {
  const db = await getDB();
  const index = db.transaction(STORE_NAME).store.index('nomor_wa');
  return index.get(nomorWA);
}

export async function addPelanggan(nama: string, nomorWA: string): Promise<Pelanggan> {
  const db = await getDB();
  const now = new Date().toISOString();
  const pelanggan: Omit<Pelanggan, 'id'> = {
    nama,
    nomor_wa: nomorWA,
    total_beli: 1,
    stempel_aktif: 1,
    reward_claimed: 0,
    tanggal_daftar: now,
    riwayat_beli: [now],
  };
  const id = await db.add(STORE_NAME, pelanggan);
  return { ...pelanggan, id: id as number };
}

export async function catatPembelian(id: number): Promise<{
  pelanggan: Pelanggan;
  dapatReward: boolean;
}> {
  const db = await getDB();
  const pelanggan = await db.get(STORE_NAME, id);
  if (!pelanggan) throw new Error('Pelanggan tidak ditemukan');

  const now = new Date().toISOString();
  const stempelBaru = pelanggan.stempel_aktif + 1;
  const dapatReward = stempelBaru >= 10;

  const updated: Pelanggan = {
    ...pelanggan,
    total_beli: pelanggan.total_beli + 1,
    stempel_aktif: dapatReward ? 10 : stempelBaru,
    riwayat_beli: [...pelanggan.riwayat_beli, now],
  };

  await db.put(STORE_NAME, updated);
  return { pelanggan: updated, dapatReward };
}

export async function batalkanPembelianTerakhir(id: number): Promise<Pelanggan> {
  const db = await getDB();
  const pelanggan = await db.get(STORE_NAME, id);
  if (!pelanggan) throw new Error('Pelanggan tidak ditemukan');
  if (pelanggan.riwayat_beli.length === 0) throw new Error('Tidak ada pembelian');

  const updated: Pelanggan = {
    ...pelanggan,
    total_beli: Math.max(0, pelanggan.total_beli - 1),
    stempel_aktif: Math.max(0, pelanggan.stempel_aktif - 1),
    riwayat_beli: pelanggan.riwayat_beli.slice(0, -1),
  };

  await db.put(STORE_NAME, updated);
  return updated;
}

export async function tukarReward(id: number): Promise<Pelanggan> {
  const db = await getDB();
  const pelanggan = await db.get(STORE_NAME, id);
  if (!pelanggan) throw new Error('Pelanggan tidak ditemukan');
  if (pelanggan.stempel_aktif < 10) throw new Error('Belum cukup stempel');

  const updated: Pelanggan = {
    ...pelanggan,
    stempel_aktif: 0,
    reward_claimed: pelanggan.reward_claimed + 1,
  };

  await db.put(STORE_NAME, updated);
  return updated;
}

export async function exportCSV(): Promise<string> {
  const db = await getDB();
  const semua = await db.getAll(STORE_NAME);

  const header = 'Nama,Nomor WA,Total Beli,Stempel Aktif,Reward Claimed,Tanggal Daftar';
  const rows = semua.map((p) =>
    [
      p.nama,
      p.nomor_wa,
      p.total_beli,
      p.stempel_aktif,
      p.reward_claimed,
      p.tanggal_daftar,
    ].join(',')
  );

  return [header, ...rows].join('\n');
}

export async function deletePelanggan(id: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
