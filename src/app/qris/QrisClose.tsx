"use client";

export default function QrisClose() {
  return (
    <button
      onClick={() => window.history.back()}
      className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-black/10 rounded-full text-stone-700 hover:bg-black/20 active:scale-90 transition-all duration-150 z-10"
      aria-label="Tutup QRIS"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}
