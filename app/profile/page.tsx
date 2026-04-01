'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProfileData {
  user: { id: number; username: string; joined: string };
  stats: { totalClicks: number; totalWatchSeconds: number; totalSessions: number; completedLessons: number };
  recentActivity: { button_label: string; created_at: string; content_title: string }[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Could not load profile.</p>
      </div>
    );
  }

  const joinedDate = new Date(profile.user.joined).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const watchMinutes = Math.round(profile.stats.totalWatchSeconds / 60);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight hover:scale-105 transition-transform">🎓 STUDY BUDDY</Link>
          <div className="flex gap-3 items-center">
            <Link href="/analytics" className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors px-3 py-2">
              📊 Analytics
            </Link>
            <Link href="/" className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors px-3 py-2">
              📖 Library
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Profile Header Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-200/30 border border-white p-8 md:p-12 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-transparent rounded-tr-full opacity-40 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative">
            {/* Avatar */}
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-xl shadow-purple-500/30 flex-shrink-0">
              {profile.user.username.charAt(0).toUpperCase()}
            </div>
            
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                {profile.user.username}
              </h1>
              <p className="text-gray-500 mt-2 text-lg font-medium">
                📅 Member since {joinedDate}
              </p>
              <p className="text-gray-400 text-sm mt-1 font-mono">
                ID: {profile.user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg shadow-blue-100/40 p-6 border border-white text-center group hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600">
              {profile.stats.totalClicks}
            </div>
            <p className="text-gray-500 text-sm font-semibold mt-1 uppercase tracking-wide">Clicks</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg shadow-green-100/40 p-6 border border-white text-center group hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-500 to-emerald-600">
              {watchMinutes}<span className="text-xl">m</span>
            </div>
            <p className="text-gray-500 text-sm font-semibold mt-1 uppercase tracking-wide">Watch Time</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg shadow-purple-100/40 p-6 border border-white text-center group hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-pink-500">
              {profile.stats.totalSessions}
            </div>
            <p className="text-gray-500 text-sm font-semibold mt-1 uppercase tracking-wide">Sessions</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg shadow-amber-100/40 p-6 border border-white text-center group hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-500">
              {profile.stats.completedLessons}
            </div>
            <p className="text-gray-500 text-sm font-semibold mt-1 uppercase tracking-wide">Completed</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 border border-white p-8 relative overflow-hidden">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">⚡</span>
            Recent Activity
          </h2>

          {profile.recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              <span className="text-5xl mb-4">🌱</span>
              <p className="text-lg font-medium">No activity yet</p>
              <p className="text-sm mt-1">Start reading books and clicking buttons to see your activity here!</p>
              <Link href="/" className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                📖 Browse Library
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50/70 transition-colors group">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 font-bold group-hover:bg-blue-100 transition-colors flex-shrink-0">
                    {activity.button_label === 'Mark as Complete' ? '✅' : 
                     activity.button_label === 'Take Quiz' ? '📝' : 
                     activity.button_label === 'Download Notes' ? '📥' : '🔘'}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {activity.button_label}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      on {activity.content_title || 'Unknown content'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 font-mono whitespace-nowrap flex-shrink-0">
                    {timeAgo(activity.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
