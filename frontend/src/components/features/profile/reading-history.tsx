/**
 * Reading History Component
 * Add/remove books from reading history (max 20)
 */

"use client";

import { ReadingHistoryItem } from "@/lib/api/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            <Input
              type="text"
              value={book.title}
              onChange={(e) => updateBook(index, "title", e.target.value)}
              placeholder="Book title"
              disabled={disabled}
              className="h-11"
            />
            <Input
              type="text"
              value={book.author}
              onChange={(e) => updateBook(index, "author", e.target.value)}
              placeholder="Author"
              disabled={disabled}
              className="h-11"
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
          className="w-full"
        >
          + Add Book
        </Button>
      )}
      {error && (
        <p className="text-sm text-destructive font-[Manrope]">{error}</p>
      )}
      <p className="text-sm text-foreground-muted font-[Manrope]">
        {books.length}/{MAX_BOOKS} books
      </p>
    </div>
  );
}
