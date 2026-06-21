"use client";

import { memo } from "react";

interface StempelProgressProps {
  current: number;
  max?: number;
}

const StempelProgress = memo(function StempelProgress({
  current,
  max = 10,
}: StempelProgressProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-center">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 ${
            i < current
              ? "bg-red-600 border-red-600 text-white scale-100"
              : "border-red-300 text-red-300 bg-red-50"
          }`}
        >
          {i < current ? "✓" : i + 1}
        </div>
      ))}
    </div>
  );
});

export default StempelProgress;
