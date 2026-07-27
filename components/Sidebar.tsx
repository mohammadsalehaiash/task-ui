"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/types/nav";

export default function Sidebar() {
  const pathname = usePathname();

  return (
     <div className="w-52 h-screen bg-gray-50 p-3 flex flex-col gap-1">
       {navItems.map((item) => {
         const isActive = pathname === item.href;
         const Icon = item.icon;

         return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              isActive
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <Icon size={18} />
            {item.label}
          </Link>
         );
       })}
     </div>
   );
}