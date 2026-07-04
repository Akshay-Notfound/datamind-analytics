"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart2, LineChart, Users, DollarSign, Package, 
  Truck, Brain, Sparkles, Settings, FileText, User
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Executive Summary", href: "/dashboard", icon: <BarChart2 size={20} /> },
    { name: "Chart Explorer", href: "/dashboard/explorer", icon: <LineChart size={20} /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen fixed top-0 left-0 overflow-y-auto z-40">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Brain className="text-indigo-500" />
          DataMind AI
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/dashboard");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" 
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div className="text-sm">
            <p className="font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-500">Premium Tier</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
