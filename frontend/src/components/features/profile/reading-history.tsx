/**
 * Reading History Component
 * Add/remove books from reading history (max 20)
 */

"use client";

import { ReadingHistoryItem } from "@/lib/api/profile";
import { Button } from "@/components/ui/button";

interface ReadingHistoryProps {
  books: ReadingHistoryItem[];
  onChange: (books: ReadingHistoryItem[]) => void;
  disabled?: boolean;
  error?: string;
}

const MAX_BOOKS = 20;

export function ReadingHistory({ books, onChange, disabled, error }: ReadingHistoryProps) {
  const addBook = () => {
    if (disabled || books.length >= MAX_BOOKS) return;
    onChange([...books, { title: "", author: "", completed_date: "" }]);
  };

  const removeBook = (index: number) => {
    if (disabled) return;
    onChange(books.filter((_, i) => i !== index));
  };

  const updateBook = (index: number, field: keyof ReadingHistoryItem, value: string) => {
    const updated = [...books];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {books.map((book, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={book.title}
              onChange={(e) => updateBook(index, "title", e.target.value)}
              placeholder="Book title"
              disabled={disabled}
              className="w-full px-3 py-2 rounded-full border border-[#4e6240]/20 bg-white/80 font-[Manrope] text-sm text-[#1b1c1a] placeholder:text-[#1b1c1a]/40 focus:outline-none focus:ring-2 focus:ring-[#4e6240]/30 disabled:opacity-50"
            />
            <input
              type="text"
              value={book.author}
              onChange={(e) => updateBook(index, "author", e.target.value)}
              placeholder="Author"
              disabled={disabled}
              className="w-full px-3 py-2 rounded-full border border-[#4e6240]/20 bg-white/80 font-[Manrope] text-sm text-[#1b1c1a] placeholder:text-[#1b1c1a]/40 focus:outline-none focus:ring-2 focus:ring-[#4e6240]/30 disabled:opacity-50"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeBook(index)}
            disabled={disabled}
            className="text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            Remove
          </Button>
        </div>
      ))}
      {books.length < MAX_BOOKS && (
        <Button
          type="button"
          variant="outline"
          onClick={addBook}
          disabled={disabled}
          className="w-full border-[#4e6240]/30 text-[#4e6240] font-[Manrope] disabled:opacity-50"
        >
          + Add Book
        </Button>
      )}
      {error && (
        <p className="text-sm text-red-500 font-[Manrope]">{error}</p>
      )}
      <p className="text-sm text-[#1b1c1a]/50 font-[Manrope]">
        {books.length}/{MAX_BOOKS} books
      </p>
    </div>
  );
}
