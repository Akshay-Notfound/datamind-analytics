import React from "react";
import { 
  ResponsiveContainer, Treemap, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Tooltip, ComposedChart, 
  Line, Area, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell 
} from "recharts";

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#3B82F6'];

const CustomTreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name, value } = props;

  // We only render cells if they have a decent size
  if (width < 20 || height < 20) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? COLORS[index % COLORS.length] : 'transparent',
          stroke: '#0F172A',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
        rx={4}
        ry={4}
      />
      {width > 50 && height > 30 && (
        <>
          <text x={x + 8} y={y + 18} fill="#ffffff" fontSize={11} fontWeight={600} opacity={0.9}>
            {name}
          </text>
          <text x={x + 8} y={y + 32} fill="#ffffff" fontSize={10} opacity={0.7}>
            {value}
          </text>
        </>
      )}
    </g>
  );
};

export const TreemapChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey="value"
        aspectRatio={4 / 3}
        stroke="#0F172A"
        content={<CustomTreemapContent />}
      >
        <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
      </Treemap>
    </ResponsiveContainer>
  );
};

export const DynamicRadarChart = ({ data, keys }: { data: any[], keys: string[] }) => {
  if (!data || data.length === 0 || !keys || keys.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
        <defs>
          {keys.map((key, idx) => (
            <radialGradient key={`radarGrad-${idx}`} id={`radarGrad-${idx}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.8} />
              <stop offset="100%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.1} />
            </radialGradient>
          ))}
        </defs>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={10} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#334155" tick={{ fill: '#64748b', fontSize: 9 }} />
        <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} />
        {keys.map((key, idx) => (
          <Radar 
            key={key} 
            name={key} 
            dataKey={key} 
            stroke={COLORS[idx % COLORS.length]} 
            strokeWidth={2}
            fill={`url(#radarGrad-${idx})`} 
            fillOpacity={1} 
          />
        ))}
        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export const DynamicComposedChart = ({ data, xKey, barKey, lineKey, areaKey }: { data: any[], xKey: string, barKey: string, lineKey?: string, areaKey?: string }) => {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS[4]} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={COLORS[4]} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS[0]} stopOpacity={1}/>
            <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0.6}/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#334155" opacity={0.5} />
        <XAxis dataKey={xKey} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />
        
        {areaKey && <Area type="monotone" dataKey={areaKey} fill="url(#areaGrad)" stroke={COLORS[4]} strokeWidth={2} />}
        <Bar dataKey={barKey} barSize={16} fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
        {lineKey && <Line type="monotone" dataKey={lineKey} stroke={COLORS[1]} strokeWidth={3} dot={{ r: 4, fill: '#0F172A', strokeWidth: 2 }} activeDot={{ r: 6 }} style={{ filter: 'url(#glow)' }} />}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
