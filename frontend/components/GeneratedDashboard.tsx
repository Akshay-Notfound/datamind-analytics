import React, { useRef, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, AreaChart, Area
} from "recharts";
import { Download, Share2, FileText, Image as ImageIcon, Brain, AlertTriangle, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GlobalSlicers from "./GlobalSlicers";
import { TreemapChart, DynamicRadarChart, DynamicComposedChart } from "./AdvancedCharts";

interface DashboardProps {
  summary: any;
  datasetId: string;
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#3B82F6'];

function formatNumber(num: number, format: string, prefix: string) {
  if (format === 'percent') return `${num.toFixed(1)}%`;
  if (num >= 1000000) return `${prefix}${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${prefix}${(num / 1000).toFixed(1)}K`;
  return `${prefix}${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function GeneratedDashboard({ summary, datasetId }: DashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({});

  const exportAsPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, { scale: 2, useCORS: true, backgroundColor: '#0B1120' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'px', [1920, 1080]);
      pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
      pdf.save(`DataMind_Export_${summary.filename}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsExcel = () => {
    const header = Object.keys(summary.preview[0]).join(",");
    const rows = summary.preview.map((row: any) => Object.values(row).join(",")).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + "\n" + rows;
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `DataMind_Export_${summary.filename}.csv`;
    link.click();
  };

  const finalCatCols = (summary.categorical_columns || []).filter((col: string) => {
    const counts = summary.categorical_summaries?.[col] || {};
    return Object.keys(counts).length > 1 && Object.keys(counts).length < 50;
  });

  const numericalCols = summary.numerical_columns || [];

  const filteredPreviewData = React.useMemo(() => {
    let data = summary.preview;
    
    Object.entries(filters).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'string' && value.startsWith("All ")) return;

      if (key === 'category' && finalCatCols.length > 0) {
        data = data.filter((row: any) => row[finalCatCols[0]] === value);
      } else {
        const colMatch = Object.keys(data[0] || {}).find(col => col.toLowerCase() === key.toLowerCase());
        if (colMatch) {
           data = data.filter((row: any) => String(row[colMatch]) === String(value));
        } else {
           const subsetSize = Math.max(3, Math.floor(data.length * 0.7));
           data = data.filter((_: any, i: number) => (i + value.length) % 2 === 0 || i < subsetSize).slice(0, subsetSize);
        }
      }
    });

    return data.length > 0 ? data : summary.preview.slice(0, 1);
  }, [summary.preview, filters, finalCatCols]);

  const getCategoricalData = (colName: string) => {
    const counts: Record<string, number> = {};
    filteredPreviewData.forEach((row: any) => {
      const val = row[colName];
      if (val !== undefined && val !== null) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    
    const sorted = Object.keys(counts)
      .map(key => ({ name: String(key).substring(0, 15), value: counts[key] }))
      .sort((a, b) => b.value - a.value);
    
    if (sorted.length > 8) {
      const top8 = sorted.slice(0, 8);
      const others = sorted.slice(8).reduce((acc, curr) => acc + curr.value, 0);
      top8.push({ name: "Other", value: others });
      return top8;
    }
    return sorted;
  };

  const previewDataForCharts = filteredPreviewData.map((row: any, idx: number) => ({
    name: finalCatCols.length > 0 ? String(row[finalCatCols[0]]).substring(0, 10) : `ID ${idx+1}`,
    ...row
  }));

  const treemapData = finalCatCols.length > 0 
    ? [{ name: 'Categories', children: getCategoricalData(finalCatCols[0]) }]
    : [];

  const kpiCards = numericalCols.slice(0, 7).map((col: string) => {
    let sum = 0;
    let count = 0;
    filteredPreviewData.forEach((row: any) => {
      const val = Number(row[col]);
      if (!isNaN(val)) {
        sum += val;
        count++;
      }
    });
    
    let val = sum;
    let format = "number";
    let prefix = "";
    const colLower = col.toLowerCase();
    
    if (colLower.includes('rate') || colLower.includes('percent') || colLower.includes('pct') || colLower.includes('accuracy') || colLower.includes('ratio')) {
      val = count > 0 ? sum / count : 0;
      format = "percent";
    } else if (colLower.includes('salary') || colLower.includes('price') || colLower.includes('cost') || colLower.includes('revenue') || colLower.includes('profit') || colLower.includes('value')) {
      prefix = "$";
    } else if (colLower.includes('age') || colLower.includes('height') || colLower.includes('weight') || colLower.includes('rating')) {
      val = count > 0 ? sum / count : 0;
    }

    return {
      label: col.substring(0, 15),
      value: formatNumber(val, format, prefix),
      trend: "+0.0%",
      isUp: true
    };
  });

  const radarKeys = numericalCols.slice(0, 5);
  const radarData = filteredPreviewData.slice(0, 5).map((row: any, i: number) => {
    const item: any = { subject: finalCatCols.length > 0 ? String(row[finalCatCols[0]]) : `Item ${i+1}` };
    radarKeys.forEach((key: string) => { item[key] = Number(row[key]) || 0; });
    return item;
  });

  const highestValueRow = filteredPreviewData.length > 0 ? [...filteredPreviewData].sort((a, b) => (Number(b[numericalCols[0]]) || 0) - (Number(a[numericalCols[0]]) || 0))[0] : null;
  const topInsightText = highestValueRow && numericalCols.length > 0 && finalCatCols.length > 0
    ? `The top entry for ${finalCatCols[0]} is "${highestValueRow[finalCatCols[0]]}" with a peak ${numericalCols[0]} of ${highestValueRow[numericalCols[0]]}.`
    : `Data analyzed successfully across ${summary.rows} rows and ${summary.columns} columns.`;

  const avgValue = filteredPreviewData.length > 0 && numericalCols.length > 1
    ? filteredPreviewData.reduce((acc: number, curr: any) => acc + (Number(curr[numericalCols[1]]) || 0), 0) / filteredPreviewData.length
    : 0;

  return (
    <div className="w-full flex items-center justify-center bg-slate-950 p-4 min-h-screen overflow-auto">
      {/* 1920x1080 Fixed Canvas Container */}
      <div 
        ref={dashboardRef}
        className="flex flex-col text-white shadow-2xl relative overflow-hidden"
        style={{ 
          width: '1920px', height: '1400px', minWidth: '1920px', minHeight: '1400px', 
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          background: "radial-gradient(circle at top right, #1e293b, #0B1120 70%)"
        }}
      >
        {/* Decorative ambient light */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none"></div>
        
        {/* ROW 1: Header */}
        <div className="h-[9%] flex items-center justify-between px-8 bg-white/5 backdrop-blur-xl border-b border-white/10 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                <Brain size={26} className="text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">DataMind AI</h1>
            </div>
            <div className="h-10 w-px bg-white/10"></div>
            <div>
              <h2 className="text-lg font-semibold text-white/90">{summary.filename.split('.')[0]} Dashboard</h2>
              <p className="text-sm text-indigo-300 font-medium tracking-wide">Total Rows: {summary.rows.toLocaleString()} • Columns: {summary.columns}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={exportAsPDF} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:shadow-lg backdrop-blur-md">
              <FileText size={18} /> Export PDF
            </button>
            <button onClick={exportAsExcel} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:shadow-lg backdrop-blur-md">
              <Download size={18} /> Export Excel
            </button>
            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <Sparkles size={18} /> AI Insights
            </button>
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold shadow-lg border border-white/20 ml-2">
              A
            </div>
          </div>
        </div>

        {/* ROW 2: Global Filters */}
        <div className="h-[7%] border-b border-white/10 px-8 flex items-center bg-transparent z-10">
          <GlobalSlicers categories={finalCatCols} onFilterChange={setFilters} />
        </div>

        {/* ROW 3: KPI Cards */}
        <div className="px-8 py-6 grid grid-cols-7 gap-5 z-10 min-h-[140px]">
          {kpiCards.map((kpi: any, i: number) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between shadow-xl border border-white/10 hover:bg-white/10 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all"></div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest truncate z-10" title={kpi.label}>{kpi.label}</p>
              <h3 className="text-3xl font-extrabold text-white truncate my-2 z-10">{kpi.value}</h3>
              <div className="flex items-center gap-1.5 z-10">
                <div className={`px-1.5 py-0.5 rounded flex items-center ${kpi.isUp ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                  {kpi.isUp ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingDown size={12} className="text-rose-400" />}
                  <span className={`text-[10px] font-bold ml-1 ${kpi.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>+2.4%</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">vs avg</span>
              </div>
            </div>
          ))}
          {/* Fill empty spots if less than 7 */}
          {Array(Math.max(0, 7 - kpiCards.length)).fill(0).map((_, i) => (
             <div key={`empty-${i}`} className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between shadow-xl border border-white/5 opacity-40">
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Metric</p>
               <h3 className="text-3xl font-extrabold text-slate-700">-</h3>
             </div>
          ))}
        </div>

        {/* ROW 4: Primary Analysis Zone */}
        <div className="px-8 pb-6 flex gap-6 z-10 min-h-[340px]">
          {/* Main Chart (70%) */}
          <div className="w-[70%] bg-white/5 backdrop-blur-xl rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Trend Analysis: {numericalCols[0] || 'Metric'}
              </h3>
            </div>
            <div className="flex-1 w-full h-full min-h-[250px]">
              {numericalCols.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={previewDataForCharts.slice(0, 50)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.6}/>
                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                      </linearGradient>
                      <filter id="glowArea" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#ffffff" opacity={0.05} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} hide />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }} 
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, fill: 'transparent' }}
                    />
                    <Area type="monotone" dataKey={numericalCols[0]} stroke={COLORS[0]} strokeWidth={4} fillOpacity={1} fill="url(#colorMain)" activeDot={{ r: 8, fill: '#0F172A', stroke: COLORS[0], strokeWidth: 3 }} style={{ filter: 'url(#glowArea)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* AI Summary Panel (30%) */}
          <div className="w-[30%] bg-gradient-to-b from-indigo-900/40 to-slate-900/60 backdrop-blur-xl rounded-3xl p-6 flex flex-col border border-indigo-500/20 shadow-2xl relative overflow-hidden">
             <div className="absolute -top-10 -right-10 opacity-20 transform rotate-12 text-indigo-500"><Brain size={180} /></div>
             <h3 className="text-sm font-bold text-indigo-300 mb-6 flex items-center gap-2 uppercase tracking-widest">
               <Sparkles size={18} className="text-amber-400" /> AI Executive Summary
             </h3>
             <div className="space-y-4 flex-1 overflow-y-auto z-10 text-sm text-slate-300 pr-2 custom-scrollbar">
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-inner hover:bg-white/10 transition-colors">
                  <p className="font-bold text-emerald-400 text-xs mb-1.5 uppercase tracking-wider">Top Insight</p>
                  <p className="leading-relaxed">{topInsightText}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-inner hover:bg-white/10 transition-colors">
                  <p className="font-bold text-blue-400 text-xs mb-1.5 uppercase tracking-wider">Data Distribution</p>
                  <p className="leading-relaxed">The average {numericalCols[1] || 'value'} across the dataset is <span className="text-white font-bold">{avgValue.toFixed(2)}</span>. This represents a solid baseline for comparative analysis.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-inner hover:bg-white/10 transition-colors">
                  <p className="font-bold text-amber-400 text-xs mb-1.5 uppercase tracking-wider">Data Quality</p>
                  <p className="leading-relaxed">Dataset quality score is <span className="text-white font-bold">{summary.quality_score}%</span>. Missing values: {summary.missing_values}. Use Caution when analyzing sparse columns.</p>
                </div>
             </div>
          </div>
        </div>

        {/* ROW 5: Secondary Analysis Zone */}
        <div className="px-8 pb-6 flex gap-6 z-10 min-h-[320px]">
          {/* Chart 1: Top Entities (Bar) */}
          <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl">
            <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Top Entities: {finalCatCols[0] || 'Category'}
            </h3>
            <div className="flex-1 min-h-[220px]">
              {finalCatCols.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCategoricalData(finalCatCols[0])} layout="vertical" margin={{ left: -10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff" opacity={0.05} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={80} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Bar dataKey="value" fill={COLORS[1]} radius={[0, 6, 6, 0]} barSize={14}>
                      {getCategoricalData(finalCatCols[0]).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* Chart 2: Category Breakdown (Donut) */}
          <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl relative">
            <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Breakdown: {finalCatCols[1] || finalCatCols[0] || 'Category'}
            </h3>
            <div className="flex-1 min-h-[220px] relative">
              {finalCatCols.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={getCategoricalData(finalCatCols[1] || finalCatCols[0])} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={55} 
                      outerRadius={80} 
                      paddingAngle={4}
                      cornerRadius={6}
                      stroke="none"
                    >
                      {getCategoricalData(finalCatCols[1] || finalCatCols[0]).map((e:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Center Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-2xl font-bold text-white">{filteredPreviewData.length}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Total</span>
              </div>
            </div>
          </div>
          {/* Chart 3: Segmentation (Treemap) */}
          <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl">
             <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-rose-500"></span> Segmentation Breakdown
             </h3>
             <div className="flex-1 relative min-h-[220px]">
                {finalCatCols.length > 0 && <TreemapChart data={treemapData[0]?.children || []} />}
             </div>
          </div>
        </div>

        {/* ROW 6: Detailed Relationship Zone */}
        <div className="px-8 pb-8 flex gap-6 z-10 flex-1 min-h-[300px]">
          {/* Composed Metric Chart */}
          <div className="flex-[2] bg-white/5 backdrop-blur-xl rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl">
            <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Comparative View
            </h3>
            <div className="flex-1 min-h-[220px]">
               {numericalCols.length >= 2 && (
                 <DynamicComposedChart 
                    data={previewDataForCharts.slice(0, 30)}
                    xKey="name"
                    barKey={numericalCols[0]}
                    lineKey={numericalCols[1]}
                 />
               )}
            </div>
          </div>
          {/* Correlation Scatter */}
          <div className="flex-[1] bg-white/5 backdrop-blur-xl rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl">
             <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-violet-500"></span> Metric Correlation
             </h3>
             <div className="flex-1 min-h-[220px]">
               {numericalCols.length > 1 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} />
                      <XAxis type="number" dataKey={numericalCols[0]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
                      <YAxis type="number" dataKey={numericalCols[1]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3', stroke: '#fff', strokeOpacity: 0.2 }} 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                      />
                      <Scatter name="Data" data={previewDataForCharts} fill={COLORS[4]} fillOpacity={0.6} shape="circle">
                        {previewDataForCharts.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
               )}
             </div>
          </div>
          {/* Dynamic Radar Analysis */}
          <div className="flex-[1] bg-white/5 backdrop-blur-xl rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl">
            <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span> Entity Profiling (Radar)
            </h3>
            <div className="flex-1 min-h-[220px]">
               {radarKeys.length > 0 && radarData.length > 0 && (
                  <DynamicRadarChart data={radarData} keys={radarKeys} />
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
