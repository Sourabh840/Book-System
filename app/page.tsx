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
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">🎓 STUDY BUDDY</h1>
          <div className="flex gap-3 items-center">
            <Link href="/analytics" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              📊 Analytics
            </Link>
            <Link href="/profile" className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-110 transition-all duration-300" title="My Profile">
              👤
            </Link>
            <button 
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
                } catch (e) {}
                window.location.replace('/login');
              }}
              className="text-gray-500 hover:text-red-500 font-semibold text-sm transition-colors rounded-lg hover:bg-red-50 px-3 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Library</h2>
        <p className="text-lg text-gray-500 mb-10">Choose a book to start learning</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map(book => (
            <Link key={book.id} href={`/books/${book.id}`} className="group block">
               <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 p-8 cursor-pointer border border-gray-100 hover:border-transparent transform hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-400 to-indigo-600"></div>
                <div className="text-5xl mb-5 opacity-80 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 inline-block origin-bottom-left">📖</div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">{book.title}</h3>
                <p className="text-gray-500 mt-3 text-base leading-relaxed flex-grow">{book.description}</p>
                <div className="mt-8 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                  Open Book <span className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}