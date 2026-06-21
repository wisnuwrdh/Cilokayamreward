export interface Pelanggan {
  id: number;
  nama: string;
  nomor_wa: string;
  total_beli: number;
  stempel_aktif: number;
  reward_claimed: number;
  tanggal_daftar: string;
  riwayat_beli: string[];
}
