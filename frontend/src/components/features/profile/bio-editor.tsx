/**
 * Bio Editor Component
 * Text area with character limit validation
 */

"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";

interface BioEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const BIO_MAX_LENGTH = 500;

export function BioEditor({ value, onChange, disabled, error }: BioEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.slice(0, BIO_MAX_LENGTH);
    onChange(newValue);
  };

  return (
    <div className="space-y-1">
      <textarea
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Tell other members about yourself..."
        className={`w-full p-3 rounded-full border bg-white/80 font-[Manrope] text-[#1b1c1a] placeholder:text-[#1b1c1a]/40 focus:outline-none focus:ring-2 resize-none ${
          error
            ? "border-red-500 focus:ring-red-500/30"
            : "border-[#4e6240]/20 focus:ring-[#4e6240]/30"
        }`}
        rows={4}
        aria-invalid={!!error}
      />
      <p className={`text-right text-sm font-[Manrope] ${
        value.length >= BIO_MAX_LENGTH 
          ? "text-red-500" 
          : "text-[#1b1c1a]/50"
      }`}>
        {value.length}/{BIO_MAX_LENGTH}
      </p>
      {error && (
        <p className="text-sm text-red-500 font-[Manrope]">{error}</p>
      )}
    </div>
  );
}
