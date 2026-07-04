"use client";

import React, { useState, useEffect } from "react";
import TopHeader from "../../../components/TopHeader";
import ChartViewer from "../../../components/ChartViewer";
import { BarChart2, Database, LayoutTemplate, Settings2 } from "lucide-react";

export default function ChartExplorer() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [chartType, setChartType] = useState<string>("scatter");
  
  const [xCol, setXCol] = useState<string>("");
  const [yCol, setYCol] = useState<string>("");
  const [zCol, setZCol] = useState<string>("");

  const CHART_TYPES = [
    { category: "Basic Charts", types: ["Line", "Bar", "Horizontal Bar", "Pie", "Area"] },
    { category: "Statistical Charts", types: ["Histogram", "Box", "Violin", "Strip"] },
    { category: "Relationship Charts", types: ["Scatter", "Bubble", "Density Contour"] },
    { category: "Comparison Charts", types: ["Grouped Bar", "Stacked Bar"] },
    { category: "Correlation Charts", types: ["Heatmap"] },
    { category: "Hierarchical Charts", types: ["Treemap", "Sunburst"] },
    { category: "Advanced Charts", types: ["Waterfall", "Funnel", "Radar", "3D Scatter"] }
  ];

  useEffect(() => {
    // Fetch available datasets
    fetch("http://localhost:8000/api/v1/data/datasets")
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setDatasets(data);
          setSelectedDataset(data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const currentDataset = datasets.find(d => d.id === selectedDataset);
  const allColumns = currentDataset ? [...(currentDataset.numerical_columns || []), ...(currentDataset.categorical_columns || [])] : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <TopHeader filename="Chart Explorer" />
      
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <LayoutTemplate className="text-indigo-600" /> Advanced Chart Explorer
          </h1>
          <p className="text-gray-500 mt-1">Select from our library of advanced charts and configure them dynamically.</p>
        </div>

        <div className="flex gap-6 h-[750px]">
          {/* Sidebar Configurator */}
          <div className="w-[350px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 font-semibold text-gray-700">
              <Settings2 size={18} /> Configuration
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
              {/* Dataset Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Database size={16} className="text-indigo-500" /> Select Dataset
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                >
                  {datasets.length === 0 && <option>Loading...</option>}
                  {datasets.map(d => (
                    <option key={d.id} value={d.id}>{d.filename}</option>
                  ))}
                </select>
              </div>

              <hr className="border-gray-100" />

              {/* Chart Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <BarChart2 size={16} className="text-indigo-500" /> Chart Type
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                >
                  {CHART_TYPES.map(category => (
                    <optgroup key={category.category} label={category.category}>
                      {category.types.map(type => (
                        <option key={type} value={type.toLowerCase()}>{type}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Axis Configuration */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Map Data Fields</h3>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">X-Axis (or Primary/Labels)</label>
                  <select 
                    className="w-full border border-gray-200 rounded p-2 text-sm bg-white"
                    value={xCol}
                    onChange={(e) => setXCol(e.target.value)}
                  >
                    <option value="">-- Select Column --</option>
                    {allColumns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Y-Axis (or Values)</label>
                  <select 
                    className="w-full border border-gray-200 rounded p-2 text-sm bg-white"
                    value={yCol}
                    onChange={(e) => setYCol(e.target.value)}
                  >
                    <option value="">-- Select Column --</option>
                    {allColumns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Z-Axis (or Size/Color Grouping)</label>
                  <select 
                    className="w-full border border-gray-200 rounded p-2 text-sm bg-white"
                    value={zCol}
                    onChange={(e) => setZCol(e.target.value)}
                  >
                    <option value="">-- Optional --</option>
                    {allColumns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Chart Display Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-4">
             <ChartViewer 
                datasetId={selectedDataset} 
                chartType={chartType} 
                xCol={xCol} 
                yCol={yCol} 
                zCol={zCol} 
             />
          </div>
        </div>
      </div>
    </div>
  );
}
