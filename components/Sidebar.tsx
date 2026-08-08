"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { navItems } from "@/types/nav";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      dir="rtl"
      className="w-60 h-screen fixed bg-[#0B0E14] border-l border-white/5 p-4 flex flex-col gap-1 shrink-0"
    >
      <div className="px-2 py-3 mb-2">
        <p className="text-lg font-bold text-white">لوحة التحكم</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = isItemActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-[#1F5EFF] text-white"
                  : "text-[#8A93A6] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={active ? "text-white" : "text-[#8A93A6]"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8A93A6] hover:bg-white/5 hover:text-[#F04438] transition-colors"
      >
        <LogOut size={18} />
        تسجيل خروج
      </button>
    </aside>
  );
}