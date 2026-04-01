'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Chapter {
  id: string;
  title: string;
  order_index: number;
}

export default function BookPage() {
  const { bookId } = useParams();
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    fetch(`/api/chapters?bookId=${bookId}`).then(r => r.json()).then(setChapters);
  }, [bookId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">🎓 STUDY BUDDY</Link>
          <Link href="/analytics" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5">📊 Mission Control</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 flex-grow w-full">
        <Link href="/" className="text-gray-500 hover:text-blue-600 font-semibold text-sm mb-6 inline-flex items-center gap-2 transition-colors">
          <span>←</span> Back to Library
        </Link>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">Chapters</h2>

        <div className="space-y-5">
          {chapters.map((chapter, i) => (
            <Link key={chapter.id} href={`/books/${bookId}/chapters/${chapter.id}`} className="group block">
               <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 transform hover:-translate-y-1 hover:border-blue-200 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                  {i + 1}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{chapter.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">Click to view lessons inside</p>
                </div>
                <div className="text-gray-300 group-hover:text-blue-500 font-bold text-2xl group-hover:translate-x-2 transition-all">→</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}