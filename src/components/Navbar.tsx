"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Beranda", icon: "☰" },
  { href: "/pelanggan/baru", label: "Tambah", icon: "+" },
  { href: "/qris", label: "QRIS", icon: "⊞" },
  { href: "/pengaturan", label: "Atur", icon: "⚙" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-red-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold transition-colors duration-150 ${
                isActive
                  ? "text-red-600"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <span className="text-xl leading-none mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
