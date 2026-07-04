"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Sun, Moon, Laptop } from "lucide-react";

export default function TopHeader({ filename }: { filename?: string }) {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {filename && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Dataset:</span>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-md text-sm border border-indigo-100">
              {filename}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search dashboards, metrics..." 
            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 dark:text-gray-200 transition-all w-64"
          />
        </div>
        
        <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-700 pl-6 relative">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ThemeIcon size={20} />
            </button>
            
            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={() => { setTheme("light"); setThemeDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${theme === "light" ? "text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  <Sun size={16} /> Light
                </button>
                <button
                  onClick={() => { setTheme("dark"); setThemeDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${theme === "dark" ? "text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  <Moon size={16} /> Dark
                </button>
                <button
                  onClick={() => { setTheme("system"); setThemeDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${theme === "system" ? "text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  <Laptop size={16} /> System
                </button>
              </div>
            )}
          </div>
          
          <button className="relative text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
