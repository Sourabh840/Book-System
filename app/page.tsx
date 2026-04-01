'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Book {
  id: string;
  title: string;
  description: string;
}

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
  fetch('/api/books')
    .then(r => {
      if (!r.ok) throw new Error(`HTTP error: ${r.status}`);
      return r.json();
    })
    .then(data => setBooks(Array.isArray(data) ? data : []))
    .catch(err => console.error('Failed to load books:', err));
}, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">📚 LearnHub</h1>
          <Link href="/analytics" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            📊 Analytics
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">All Courses</h2>
        <p className="text-gray-500 mb-8">Choose a course to start learning</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map(book => (
            <Link key={book.id} href={`/books/${book.id}`}>
              <div className="bg-white rounded-xl shadow hover:shadow-md transition p-6 cursor-pointer border border-gray-100 hover:border-blue-300">
                <div className="text-4xl mb-3">📖</div>
                <h3 className="text-xl font-semibold text-gray-800">{book.title}</h3>
                <p className="text-gray-500 mt-2 text-sm">{book.description}</p>
                <div className="mt-4 text-blue-600 text-sm font-medium">Start Learning →</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}