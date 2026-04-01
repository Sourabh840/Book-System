'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Content {
  id: string;
  title: string;
  order_index: number;
}

export default function ChapterPage() {
  const { bookId, chapterId } = useParams();
  const [contents, setContents] = useState<Content[]>([]);

  useEffect(() => {
    fetch(`/api/content?chapterId=${chapterId}`).then(r => r.json()).then(setContents);
  }, [chapterId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-blue-600 font-bold text-xl">📚 LearnHub</Link>
          <Link href="/analytics" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">📊 Analytics</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link href={`/books/${bookId}`} className="text-blue-500 text-sm mb-4 inline-block">← Back to Chapters</Link>
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Lessons</h2>

        <div className="space-y-4">
          {contents.map((item, i) => (
            <Link key={item.id} href={`/content/${item.id}`}>
              <div className="bg-white rounded-xl shadow hover:shadow-md transition p-6 cursor-pointer border border-gray-100 hover:border-green-300 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-gray-400 text-sm">Video lesson + interactive content</p>
                </div>
                <div className="ml-auto text-green-400">▶</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}