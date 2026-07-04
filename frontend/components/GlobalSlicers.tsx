"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown } from "lucide-react";

interface GlobalSlicersProps {
  categories: string[];
  onFilterChange: (filters: any) => void;
}

export default function GlobalSlicers({ categories, onFilterChange }: GlobalSlicersProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  
  const slicersConfig = [
    { label: "Date", key: "date", options: ["All Time", "This Year", "Q3 2026", "Last 30 Days"] },
    { label: "Region", key: "region", options: ["All Regions", "North America", "EMEA", "APAC"] },
    { label: "Country", key: "country", options: ["All Countries", "United States", "UK", "India"] },
    { label: "Category", key: "category", options: ["All Categories", ...categories] },
    { label: "Segment", key: "segment", options: ["All Segments", "Premium", "Standard"] },
    { label: "Department", key: "department", options: ["All Depts", "Sales", "Marketing", "IT"] }
  ];

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    slicersConfig.reduce((acc, slicer) => ({ ...acc, [slicer.key]: slicer.options[0] }), {})
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (key: string, option: string) => {
    const newValues = { ...selectedValues, [key]: option };
    setSelectedValues(newValues);
    setOpenDropdown(null);
    onFilterChange(newValues);
  };

  return (
    <div className="w-full flex items-center gap-4" ref={containerRef}>
      <div className="flex items-center gap-2 text-indigo-400 font-semibold border-r border-[#334155] pr-4 py-2">
        <Filter size={16} />
        <span className="text-sm">Filters</span>
      </div>

      <div className="flex-1 flex items-center justify-between">
        {slicersConfig.map((slicer, idx) => (
          <div key={idx} className="relative">
            <div 
              className="flex items-center gap-2 bg-[#1E293B] border border-[#334155] hover:border-indigo-500 transition-colors px-4 py-1.5 rounded-md cursor-pointer"
              onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
            >
              <span className="text-xs text-gray-400 font-medium">{slicer.label}:</span>
              <span className="text-sm text-white font-semibold truncate max-w-[100px]">{selectedValues[slicer.key]}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${openDropdown === idx ? 'rotate-180' : ''}`} />
            </div>
            
            {openDropdown === idx && (
              <div className="absolute top-full left-0 mt-1 w-full min-w-[150px] bg-[#1E293B] border border-[#334155] rounded-md shadow-lg shadow-black/50 z-50 py-1">
                {slicer.options.map((option, optIdx) => (
                  <div 
                    key={optIdx} 
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-600/20 hover:text-indigo-400 ${
                      selectedValues[slicer.key] === option ? 'text-indigo-400 bg-indigo-600/10' : 'text-gray-300'
                    }`}
                    onClick={() => handleSelect(slicer.key, option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
