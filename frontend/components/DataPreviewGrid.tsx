"use client";

import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface DataPreviewGridProps {
  data: any[];
  columnTypes: Record<string, string>;
}

export default function DataPreviewGrid({ data, columnTypes }: DataPreviewGridProps) {
  const columnDefs = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Create columns from keys of the first row
    return Object.keys(data[0]).map((key) => {
      const type = columnTypes[key] || "unknown";
      const isNumber = type.includes("float") || type.includes("int");
      
      return {
        field: key,
        headerName: key,
        sortable: true,
        filter: true,
        resizable: true,
        // Align numbers to right
        type: isNumber ? "numericColumn" : undefined,
      };
    });
  }, [data, columnTypes]);

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 100,
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
        No preview data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-[500px] w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview</h3>
      <div className="ag-theme-alpine w-full h-[400px]">
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
}
