/**
 * Genre Selector Component
 * Multi-select chip component for favorite genres (max 5)
 */

"use client";

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
                  ? "bs-cta"
                  : "bg-surface-container-low border border-outline-variant/20 text-foreground-muted hover:bg-surface-container"
              } ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-pressed={isSelected}
            >
              {genre}
            </button>
          );
        })}
      </div>
      <p
        className={`text-sm font-[Manrope] ${
          selected.length >= MAX_GENRES ? "text-tertiary" : "text-foreground-muted"
        }`}
      >
        {selected.length}/{MAX_GENRES} selected
      </p>
      {error && (
        <p className="text-sm text-destructive font-[Manrope]">{error}</p>
      )}
    </div>
  );
}
