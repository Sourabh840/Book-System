'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#facc15'];

export default function AnalyticsPage() {
  const [clicks, setClicks] = useState<any[]>([]);
  const [watchtime, setWatchtime] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
  fetch('/api/analytics/clicks')
    .then(r => r.json())
    .then(data => setClicks(Array.isArray(data) ? data : []));

  fetch('/api/analytics/watchtime')
    .then(r => r.json())
    .then(data => setWatchtime(Array.isArray(data) ? data : []));

  fetch('/api/analytics/progress')
    .then(r => r.json())
    .then(data => setProgress(Array.isArray(data) ? data : []));
}, []);

  const totalClicks = clicks.reduce((sum: number, d: any) => sum + Number(d.click_count), 0);
  const totalWatchSeconds = watchtime.reduce((sum: number, d: any) => sum + Number(d.total_seconds), 0);
  const avgCompletion = progress.length
    ? Math.round(progress.reduce((sum: number, d: any) => sum + Number(d.avg_scroll_depth), 0) / progress.length)
    : 0;

  const clickDataGrouped = clicks.reduce((acc: any[], curr: any) => {
    const existing = acc.find((item) => item.content_title === curr.content_title);
    if (existing) {
      existing[curr.button_label] = Number(curr.click_count);
    } else {
      acc.push({
        content_title: curr.content_title,
        [curr.button_label]: Number(curr.click_count)
      });
    }
    return acc;
  }, []);
  
  const uniqueButtons = Array.from(new Set(clicks.map(c => c.button_label))) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/70 backdrop-blur-xl shadow-sm border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight transition-transform hover:scale-105">🎓 STUDY BUDDY</Link>
          <span className="text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase shadow-lg shadow-blue-500/30">📊 Dashboard</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-3 tracking-tight">Mission Control</h1>
        <p className="text-lg text-gray-500 mb-10 font-medium">Real-time data from user interactions</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-blue-200/40 p-8 border border-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="text-gray-500 font-semibold tracking-wide uppercase text-sm mb-2">Total Clicks</p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600">{totalClicks}</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-green-200/40 p-8 border border-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-100 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="text-gray-500 font-semibold tracking-wide uppercase text-sm mb-2">Watch Time</p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-500 to-emerald-600">{Math.round(totalWatchSeconds / 60)}<span className="text-3xl">m</span></p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-purple-200/40 p-8 border border-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="text-gray-500 font-semibold tracking-wide uppercase text-sm mb-2">Avg Depth</p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-pink-500">{avgCompletion}<span className="text-3xl">%</span></p>
          </div>
        </div>

        {/* Button Clicks Chart */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 p-8 mb-10 border border-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><span className="text-indigo-500">🎯</span> Engagement Metrics</h2>
          {clicks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              <span className="text-4xl mb-3">👻</span>
              <p>No data yet — go click some buttons!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={clickDataGrouped}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="content_title" tick={{fontSize: 13, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 13, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'}} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                {uniqueButtons.map((btnLabel, idx) => (
                  <Bar key={btnLabel} name={btnLabel} dataKey={btnLabel} fill={COLORS[idx % COLORS.length]} radius={[6, 6, 0, 0]} maxBarSize={60} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Progress / Scroll Depth Chart */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3"><span className="text-pink-500">📖</span> Completion Rate</h2>
            <p className="text-gray-500 text-sm mb-6 font-medium">Average scroll depth through chapters</p>
            {progress.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                <span className="text-4xl mb-3">👻</span>
                <p>No data yet — go read some content!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progress}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="content_title" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `${v}%`} cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="avg_scroll_depth" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Watch Time List */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-white flex flex-col h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><span className="text-green-500">📺</span> Video Retention</h2>
            {watchtime.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-grow py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                <span className="text-4xl mb-3">👻</span>
                <p>No data yet — go watch some videos!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-xs">
                      <th className="py-4 font-semibold">Content Title</th>
                      <th className="py-4 font-semibold">Total Time</th>
                      <th className="py-4 font-semibold">Avg / Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchtime.map((row: any, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 pr-4 text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">{row.content_title}</td>
                        <td className="py-4 text-green-600 font-bold">{row.total_seconds}s</td>
                        <td className="py-4 text-gray-500 font-medium">{row.avg_seconds}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}