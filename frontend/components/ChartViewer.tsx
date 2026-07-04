"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, AlertTriangle } from "lucide-react";

// Plotly requires client-side rendering because it depends on the window object
const Plot = dynamic(() => import("react-plotly.js"), { 
  ssr: false, 
  loading: () => <div className="flex items-center justify-center h-full w-full bg-[#1E293B] rounded-lg"><Loader2 className="animate-spin text-indigo-500" size={32} /></div> 
});

interface ChartViewerProps {
  datasetId: string;
  chartType: string;
  xCol: string;
  yCol: string;
  zCol?: string;
}

export default function ChartViewer({ datasetId, chartType, xCol, yCol, zCol }: ChartViewerProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!datasetId || !chartType) return;

    const fetchChart = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `http://localhost:8000/api/v1/charts/${datasetId}/generate?chart_type=${encodeURIComponent(chartType)}`;
        if (xCol) url += `&x_col=${encodeURIComponent(xCol)}`;
        if (yCol) url += `&y_col=${encodeURIComponent(yCol)}`;
        if (zCol) url += `&z_col=${encodeURIComponent(zCol)}`;

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to generate chart");
        }

        const data = await response.json();
        setChartData(data);
      } catch (err: any) {
        setError(err.message);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [datasetId, chartType, xCol, yCol, zCol]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#1E293B] rounded-lg border border-[#334155]">
        <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
        <p className="text-gray-400 text-sm">Generating Plotly Chart via Python Backend...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#1E293B] rounded-lg border border-red-500/50 p-6 text-center">
        <AlertTriangle className="text-red-500 mb-2" size={48} />
        <h3 className="text-red-400 font-semibold mb-1">Chart Generation Error</h3>
        <p className="text-sm text-gray-400 max-w-md">{error}</p>
        <p className="text-xs text-gray-500 mt-4">Some charts require specific data types (e.g., Heatmaps need numeric columns).</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#1E293B] rounded-lg border border-[#334155] border-dashed">
        <p className="text-gray-500">Configure your chart axes and click Generate</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden p-2">
      <Plot
        data={chartData.data}
        layout={{
          ...chartData.layout,
          autosize: true,
          margin: { t: 50, r: 20, l: 50, b: 50 },
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
        config={{ displayModeBar: true, responsive: true }}
      />
    </div>
  );
}
