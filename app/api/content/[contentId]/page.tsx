'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ContentData {
  id: string;
  title: string;
  body: string;
  video_url: string;
  video_id: string;
}

function getUserId(): string {
  let id = localStorage.getItem('user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('user_id', id);
  }
  return id;
}

export default function ContentPage() {
  const { contentId } = useParams();
  const [content, setContent] = useState<ContentData | null>(null);
  const [completed, setCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchStartRef = useRef<number>(0);

  useEffect(() => {
    fetch(`/api/content?contentId=${contentId}`).then(r => r.json()).then(setContent);
  }, [contentId]);

  // Scroll depth tracking
  useEffect(() => {
    let lastDepth = 0;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const depth = Math.round((scrollTop / docHeight) * 100);

      if (depth > lastDepth + 10) {
        lastDepth = depth;
        fetch('/api/events/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: getUserId(),
            content_id: contentId,
            scroll_depth: depth,
          }),
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [contentId]);

  const trackClick = async (buttonLabel: string) => {
    await fetch('/api/events/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: getUserId(),
        button_label: buttonLabel,
        content_id: contentId,
      }),
    });
    if (buttonLabel === 'Mark as Complete') setCompleted(true);
  };

  const trackWatchTime = async (watchedSeconds: number) => {
    if (watchedSeconds < 2) return;
    await fetch('/api/events/watchtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: getUserId(),
        video_id: content?.video_id || 'unknown',
        content_id: contentId,
        watched_seconds: Math.floor(watchedSeconds),
      }),
    });
  };

  if (!content) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-blue-600 font-bold text-xl">📚 LearnHub</Link>
          <Link href="/analytics" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">📊 Analytics</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{content.title}</h1>

        {/* Video Player */}
        <div className="rounded-xl overflow-hidden shadow-lg mb-8 bg-black">
          <video
            ref={videoRef}
            controls
            className="w-full"
            onPlay={() => { watchStartRef.current = Date.now(); }}
            onPause={() => trackWatchTime((Date.now() - watchStartRef.current) / 1000)}
            onEnded={() => trackWatchTime((Date.now() - watchStartRef.current) / 1000)}
            src={content.video_url}
          />
        </div>

        {/* Interactive Buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => trackClick('Mark as Complete')}
            className={`px-6 py-3 rounded-lg font-medium transition ${completed ? 'bg-green-500 text-white' : 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50'}`}
          >
            {completed ? '✅ Completed!' : '☐ Mark as Complete'}
          </button>
          <button
            onClick={() => trackClick('Take Quiz')}
            className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            📝 Take Quiz
          </button>
          <button
            onClick={() => trackClick('Download Notes')}
            className="px-6 py-3 rounded-lg font-medium bg-gray-700 text-white hover:bg-gray-800 transition"
          >
            📥 Download Notes
          </button>
          <button
            onClick={() => trackClick('Bookmark')}
            className="px-6 py-3 rounded-lg font-medium bg-yellow-400 text-white hover:bg-yellow-500 transition"
          >
            🔖 Bookmark
          </button>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Lesson Content</h2>
          <p className="text-gray-600 leading-relaxed text-lg">{content.body}</p>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Key Takeaways</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Understanding the core concept introduced in this lesson</li>
              <li>• How to apply this knowledge in real projects</li>
              <li>• Common mistakes to avoid as a beginner</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}