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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-blue-600 font-bold text-xl">📚 LearnHub</Link>
          <Link href="/analytics" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">📊 Analytics</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link href="/" className="text-blue-500 text-sm mb-4 inline-block">← Back to Courses</Link>
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Chapters</h2>

        <div className="space-y-4">
          {chapters.map((chapter, i) => (
            <Link key={chapter.id} href={`/books/${bookId}/chapters/${chapter.id}`}>
              <div className="bg-white rounded-xl shadow hover:shadow-md transition p-6 cursor-pointer border border-gray-100 hover:border-blue-300 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{chapter.title}</h3>
                  <p className="text-gray-400 text-sm">Click to view lessons</p>
                </div>
                <div className="ml-auto text-blue-400">→</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}