"use client";

import React, { useState } from "react";
import DataUpload from "../../components/DataUpload";
import DataPreviewGrid from "../../components/DataPreviewGrid";
import GeneratedDashboard from "../../components/GeneratedDashboard";
import TopHeader from "../../components/TopHeader";
import { BarChart, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [isDashboardGenerated, setIsDashboardGenerated] = useState(false);

  const handleUploadSuccess = (data: any) => {
    setDataSummary(data);
    setIsDashboardGenerated(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <TopHeader filename={dataSummary?.filename} />
      
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Data Workbench</h1>
            <p className="text-gray-500 mt-1">Upload and analyze your datasets automatically.</p>
          </div>
        </div>

        {!dataSummary ? (
          <div className="mt-12">
            <DataUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Analysis Results: <span className="text-indigo-600 font-mono">{dataSummary.filename}</span>
              </h2>
              <button 
                onClick={() => setDataSummary(null)}
                className="text-sm text-gray-600 hover:text-indigo-600 font-medium"
              >
                Upload New File
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quality Score</p>
                    <p className={`text-3xl font-bold mt-2 ${dataSummary.quality_score > 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {dataSummary.quality_score}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${dataSummary.quality_score > 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {dataSummary.quality_score > 80 ? <CheckCircle2 /> : <AlertTriangle />}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Rows</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">
                      {dataSummary.rows.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Activity />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Columns</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">
                      {dataSummary.columns.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <BarChart />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Missing Values</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">
                      {dataSummary.missing_values.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <AlertTriangle />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Grid */}
            {!isDashboardGenerated && (
              <>
                <DataPreviewGrid 
                  data={dataSummary.preview} 
                  columnTypes={dataSummary.column_types} 
                />
                <div className="flex justify-center mt-8">
                  <button 
                    onClick={() => setIsDashboardGenerated(true)}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg transition-transform hover:scale-105"
                  >
                    Create Comprehensive Dashboard
                  </button>
                </div>
              </>
            )}

            {isDashboardGenerated && (
              <GeneratedDashboard summary={dataSummary} datasetId={dataSummary.dataset_id} />
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
