"use client";

import React, { useEffect, useState } from "react";
import GeneratedDashboard from "../../../../components/GeneratedDashboard";

export default function SharedDashboard({ params }: { params: { id: string } }) {
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/dashboard/${params.id}`);
        if (!response.ok) {
          throw new Error("Dashboard not found or access denied.");
        }
        const data = await response.json();
        // The endpoint returns { dashboard: {...}, summary: {...} }
        setDataSummary(data.summary);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDashboard();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <p className="text-xl text-gray-500 animate-pulse">Loading Shared Dashboard...</p>
      </div>
    );
  }

  if (error || !dataSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
        <p className="text-gray-600">{error || "Failed to load dashboard."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shared Dashboard View</h1>
          <p className="text-gray-500 mt-2">You are viewing a shared dataset analysis.</p>
        </header>

        {/* Hide the Share/Export buttons in the GeneratedDashboard if needed by passing a prop, 
            but for now, we'll let them export PDF/Image! */}
        <GeneratedDashboard summary={dataSummary} datasetId="" />
      </div>
    </div>
  );
}
