/**
 * Genre Selector Component
 * Multi-select chip component for favorite genres (max 5)
 */

"use client";

import { GenreSelector as GenreSelectorType } from "@/lib/api/profile";

interface GenreSelectorProps {
  selected: string[];
  onChange: (genres: string[]) => void;
  disabled?: boolean;
  error?: string;
}

const AVAILABLE_GENRES = [
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Sci-Fi",
  "Fantasy",
  "Romance",
  "Historical",
  "Biography",
  "Self-Help",
  "Other",
] as const;

const MAX_GENRES = 5;

export function GenreSelector({ selected, onChange, disabled, error }: GenreSelectorProps) {
  const toggleGenre = (genre: string) => {
    if (disabled) return;

    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else if (selected.length < MAX_GENRES) {
      onChange([...selected, genre]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_GENRES.map((genre) => {
          const isSelected = selected.includes(genre);
          const isDisabled = disabled || (!isSelected && selected.length >= MAX_GENRES);

          return (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              disabled={isDisabled}
              className={`px-3 py-1.5 rounded-full font-[Manrope] text-sm transition-all ${
                isSelected
                  ? "bg-[#4e6240] text-white"
                  : "bg-white border border-[#4e6240]/20 text-[#1b1c1a]/70 hover:border-[#4e6240]/50"
              } ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-pressed={isSelected}
            >
              {genre}
            </button>
          );
        })}
      </div>
      <p className={`text-sm font-[Manrope] ${
        selected.length >= MAX_GENRES 
          ? "text-[#8b4c00]" 
          : "text-[#1b1c1a]/50"
      }`}>
        {selected.length}/{MAX_GENRES} selected
      </p>
      {error && (
        <p className="text-sm text-red-500 font-[Manrope]">{error}</p>
      )}
    </div>
  );
}
