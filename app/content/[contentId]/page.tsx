'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ContentPage() {
  const { contentId } = useParams();
  const [content, setContent] = useState<any>(null);
  
  const userId = 'user_demo_123';

  const maxScrollDepth = useRef(0);
  const watchedSeconds = useRef(0);
  const lastTimeRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`/api/content?contentId=${contentId}`)
      .then(res => res.json())
      .then(data => setContent(data));
  }, [contentId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const depth = Math.min(
        100,
        Math.round((scrollY / (documentHeight - windowHeight)) * 100)
      );
      
      if (depth > maxScrollDepth.current) {
        maxScrollDepth.current = depth;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hasSent = { progress: false, watchtime: false };

    const sendAnalytics = () => {
      if (maxScrollDepth.current > 0 && !hasSent.progress) {
        fetch('/api/events/progress', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            content_id: contentId,
            scroll_depth: maxScrollDepth.current
          })
        });
        hasSent.progress = true;
      }

      if (watchedSeconds.current > 0 && !hasSent.watchtime) {
        fetch('/api/events/watchtime', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            video_id: content?.video_url ? `video_${contentId}` : 'unknown',
            content_id: contentId,
            watched_seconds: Math.round(watchedSeconds.current)
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
        body: JSON.stringify({
          user_id: userId,
          button_label: label,
          content_id: contentId
        })
      });
      alert(`Tracked click: ${label}!`);
    } catch (err) {
      console.error('Failed to log click', err);
    }
  };

  if (!content) return <div className="p-10 text-center">Loading Content...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href={`/books/${content.chapter_id}`} className="text-blue-500 font-semibold hover:text-blue-700">← Back to Lessons</Link>
          <Link href="/analytics" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow hover:bg-blue-700 transition">📊 Dashboard</Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-10 flex-grow w-full">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{content.title}</h1>
        
        {content.video_url && (
          <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-lg mb-8 relative">
            <video 
              ref={videoRef}
              src={content.video_url} 
              className="w-full h-full object-cover"
              controls 
              onTimeUpdate={handleTimeUpdate}
              onSeeked={handleSeeked}
              onPlay={() => lastTimeRef.current = videoRef.current?.currentTime || 0}
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reading Material</h2>
          <div className="prose text-gray-700 max-w-none text-lg leading-relaxed whitespace-pre-wrap">
            {content.body_text}
          </div>
          
          <div className="mt-10 py-6 border-t flex gap-4 justify-center">
            <button 
              onClick={() => handleButtonClick('Take Quiz')}
              className="bg-purple-100 text-purple-700 font-semibold py-3 px-6 rounded-xl hover:bg-purple-200 transition"
            >
              📝 Take Quiz
            </button>
            <button 
              onClick={() => handleButtonClick('Mark as Complete')}
              className="bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-green-700 transition"
            >
              ✅ Mark as Complete
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
