'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-blue-600 font-bold text-xl">📚 LearnHub</Link>
          <span className="text-gray-500 font-medium">📊 Analytics Dashboard</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-500 mb-8">Real-time data from user interactions</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Button Clicks</p>
            <p className="text-4xl font-bold text-blue-600 mt-1">{totalClicks}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Total Watch Time</p>
            <p className="text-4xl font-bold text-green-600 mt-1">{Math.round(totalWatchSeconds / 60)}m</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Avg Scroll Depth</p>
            <p className="text-4xl font-bold text-yellow-600 mt-1">{avgCompletion}%</p>
          </div>
        </div>

        {/* Button Clicks Chart */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Button Clicks by Type</h2>
          {clicks.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No data yet — go click some buttons!</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clicks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="button_label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="click_count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Watch Time Chart */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Video Watch Time</h2>
          {watchtime.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No data yet — go watch some videos!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="text-left p-3 rounded-l">Video</th>
                    <th className="text-left p-3">Content</th>
                    <th className="text-left p-3">Total Watch Time</th>
                    <th className="text-left p-3 rounded-r">Avg per Session</th>
                  </tr>
                </thead>
                <tbody>
                  {watchtime.map((row: any, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 font-mono text-xs text-gray-500">{row.video_id}</td>
                      <td className="p-3">{row.content_title}</td>
                      <td className="p-3 font-semibold text-green-600">{row.total_seconds}s</td>
                      <td className="p-3 text-gray-600">{row.avg_seconds}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Progress / Scroll Depth Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-1">Content Completion Rate</h2>
          <p className="text-gray-400 text-sm mb-4">Shows how far users scroll through each lesson (our custom metric)</p>
          {progress.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No data yet — go read some content!</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="content_title" />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="avg_scroll_depth" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
}