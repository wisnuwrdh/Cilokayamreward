import Image from "next/image";
import QrisClose from "./QrisClose";

export default function QrisPage() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
      <QrisClose />

      <p className="text-base font-bold text-stone-700 mb-4">
        Scan QRIS untuk bayar
      </p>

      <div className="w-full max-w-sm aspect-square bg-stone-100 rounded-2xl flex items-center justify-center border-2 border-stone-200 overflow-hidden">
        <Image
          src="/qris.png"
          alt="QRIS"
          width={400}
          height={400}
          className="object-contain p-4"
          priority
        />
      </div>
    </div>
  );
}
