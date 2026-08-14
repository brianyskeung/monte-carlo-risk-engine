import { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Maximize2, Minimize2 } from 'lucide-react';

interface PathData {
    day: number;
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
    mean: number;
}

interface SimulationChartProps {
    data: PathData[];
}

const CompactTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md p-3 border border-stone-100 rounded-lg shadow-lg pointer-events-none z-50 min-w-48">
                <p className="font-medium text-stone-400 pb-1 border-b border-stone-100/80 uppercase tracking-wider text-[11px]">
                    Forecast Day {label}
                </p>
                <div className="flex flex-col gap-1.5 text-[10px] ">
                    {payload.map((entry: any, index: number) => {
                        const percentValue = ((entry.value - 1) * 100);
                        const isPositive = percentValue >= 0;
                        return (
                            <div key={index} className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full shadow-sm"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="font-medium text-stone-600">
                                        {entry.name}
                                    </span>
                                </div>
                                <span className={`font-semibold tabular-nums ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {isPositive ? '+' : ''}{percentValue.toFixed(2)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

{/* Main Chart Component */ }
export default function SimulationChart({ data }: SimulationChartProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!data || data.length === 0) return null;

    return (
        <div
            className={
                isFullscreen
                    ? "fixed inset-0 z-50 bg-[#fafaf9] p-8 flex flex-col"
                    : "relative w-full h-80 bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-all duration-300"
            }
        >
            {/* Fullscreen Toggle */}
            <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 bg-white hover:bg-stone-50 border border-stone-100 rounded-md transition-colors z-10"
                title="Toggle Fullscreen"
            >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <div className="grow w-full h-full pb-4">
                <ResponsiveContainer width="100%" height="100%">

                    <LineChart data={data} margin={{ top: 10, right: 30, bottom: 0, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                        <XAxis
                            dataKey="day"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tick={{ fontSize: 11, fill: '#a8a29e' }}
                            axisLine={{ stroke: '#e7e5e4' }}
                            tickLine={false}
                            dy={10}
                            minTickGap={50}
                        />
                        <YAxis
                            type="number"
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 11, fill: '#a8a29e' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${((value - 1) * 100).toFixed(0)}%`}

                        />

                        <Tooltip content={<CompactTooltip />} cursor={{ stroke: '#d6d3d1', strokeWidth: 1.5, strokeDasharray: '4 4' }} />


                        <Line type="monotone" dataKey="p95" stroke="#10b981" strokeWidth={1.5} dot={false} strokeOpacity={0.8} name="95th Percentile (Best)" />
                        <Line type="monotone" dataKey="p75" stroke="#6ee7b7" strokeWidth={1} dot={false} strokeOpacity={0.6} name="75th Percentile" />

                        <Line type="monotone" dataKey="p50" stroke="#0f172a" strokeWidth={2.5} dot={false} name="Median Path" />

                        <Line type="monotone" dataKey="p25" stroke="#fca5a5" strokeWidth={1} dot={false} strokeOpacity={0.6} name="25th Percentile" />
                        <Line type="monotone" dataKey="p5" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="5th Percentile (Worst)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}