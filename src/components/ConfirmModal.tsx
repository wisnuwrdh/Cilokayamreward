"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Ya",
  cancelLabel = "Batal",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95">
        <h3 className="text-lg font-bold text-stone-800 mb-2">{title}</h3>
        <p className="text-sm text-stone-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all duration-150"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-all duration-150 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
