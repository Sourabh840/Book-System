'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function getYouTubeEmbedUrl(url: string): string {
  // Handle shorts: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}?rel=0&modestbranding=1&enablejsapi=1`;
  
  // Handle standard: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1&enablejsapi=1`;
  
  // Handle youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?rel=0&modestbranding=1&enablejsapi=1`;
  
  return url;
}

export default function ContentPage() {
  const { contentId } = useParams();
  const [content, setContent] = useState<any>(null);

  const maxScrollDepth = useRef(0);
  const watchedSeconds = useRef(0);
  const lastTimeRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    fetch(`/api/content?contentId=${contentId}`)
      .then(res => res.json())
      .then(data => setContent(data));
  }, [contentId]);

  // Scroll depth tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const depth = Math.min(100, Math.round((scrollY / (documentHeight - windowHeight)) * 100));
      if (depth > maxScrollDepth.current) maxScrollDepth.current = depth;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // For YouTube videos, track time spent on page as a proxy for watch time
  useEffect(() => {
    if (content?.video_url && isYouTubeUrl(content.video_url)) {
      startTimeRef.current = Date.now();
    }
  }, [content]);

  // Analytics flush on unmount / beforeunload
  useEffect(() => {
    const hasSent = { progress: false, watchtime: false };
    const sendAnalytics = () => {
      if (maxScrollDepth.current > 0 && !hasSent.progress) {
        fetch('/api/events/progress', {
          method: 'POST', keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_id: contentId, scroll_depth: maxScrollDepth.current })
        });
        hasSent.progress = true;
      }

      // For YouTube: use page time as proxy; for native: use actual tracked seconds
      let totalWatched = watchedSeconds.current;
      if (content?.video_url && isYouTubeUrl(content.video_url) && startTimeRef.current > 0) {
        totalWatched = Math.round((Date.now() - startTimeRef.current) / 1000);
      }

      if (totalWatched > 0 && !hasSent.watchtime) {
        fetch('/api/events/watchtime', {
          method: 'POST', keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video_id: content?.video_url ? `video_${contentId}` : 'unknown',
            content_id: contentId,
            watched_seconds: Math.round(totalWatched)
          })
        });
        hasSent.watchtime = true;
      }
    };
    window.addEventListener('beforeunload', sendAnalytics);
    return () => {
      window.removeEventListener('beforeunload', sendAnalytics);
      sendAnalytics();
    };
  }, [contentId, content]);

  // Native video timeupdate handlers (for non-YouTube videos)
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    if (currentTime > lastTimeRef.current) {
      watchedSeconds.current += (currentTime - lastTimeRef.current);
    }
    lastTimeRef.current = currentTime;
  };

  const handleSeeked = () => {
    if (!videoRef.current) return;
    lastTimeRef.current = videoRef.current.currentTime;
  };

  const handleButtonClick = async (label: string) => {
    try {
      await fetch('/api/events/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ button_label: label, content_id: contentId })
      });
      alert(`Tracked click: ${label}!`);
    } catch (err) {
      console.error('Failed to log click', err);
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  const isYT = content.video_url && isYouTubeUrl(content.video_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-gray-500 font-semibold hover:text-blue-600 transition-colors flex items-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Library
          </Link>
          <Link href="/analytics" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            📊 Mission Control
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 flex-grow w-full">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-10 tracking-tight leading-tight">
          {content.title}
        </h1>

        {/* Video Player */}
        {content.video_url && (
          <div className="mb-12">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-1.5 shadow-2xl shadow-black/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden relative">
                {isYT ? (
                  <iframe
                    src={getYouTubeEmbedUrl(content.video_url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Lecture Video"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={content.video_url}
                    className="w-full h-full object-cover"
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    onSeeked={handleSeeked}
                    onPlay={() => { lastTimeRef.current = videoRef.current?.currentTime || 0; }}
                  />
                )}
              </div>
            </div>
            {/* Video Badge */}
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                  {isYT ? '▶ YouTube' : '🎬 Video'}
                </span>
                <span className="text-xs text-gray-400">Lecture video for this chapter</span>
              </div>
              <div className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-semibold">
                ⏱ Analytics tracked
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-50 to-transparent rounded-tr-full opacity-40 pointer-events-none"></div>

          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3 relative">
            <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">📖</span>
            Chapter Content
          </h2>
          <div className="prose prose-blue text-gray-600 max-w-none text-lg leading-relaxed whitespace-pre-wrap relative">
            {content.body_text}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 justify-center md:justify-start">
            <button
              onClick={() => handleButtonClick('Take Quiz')}
              className="group bg-indigo-50 text-indigo-700 font-bold py-3.5 px-8 rounded-2xl hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all outline-none flex items-center gap-2"
            >
              <span className="group-hover:rotate-12 transition-transform">📝</span> Take Quiz
            </button>
            <button
              onClick={() => handleButtonClick('Mark as Complete')}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all outline-none flex items-center gap-2"
            >
              <span className="group-hover:scale-125 transition-transform">✅</span> Mark as Complete
            </button>
            <button
              onClick={() => handleButtonClick('Download Notes')}
              className="group bg-gray-100 text-gray-700 font-bold py-3.5 px-8 rounded-2xl hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all outline-none flex items-center gap-2"
            >
              <span className="group-hover:-translate-y-1 transition-transform">📥</span> Download Notes
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center text-sm text-gray-400">
          <span>🎓 STUDY BUDDY — Content Analytics Platform</span>
          <span className="font-mono text-xs">Content ID: {contentId?.toString().slice(0, 8)}...</span>
        </div>
      </footer>
    </div>
  );
}
