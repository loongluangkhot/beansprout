/**
 * Bio Editor Component
 * Text area with character limit validation
 */

"use client";

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
        className={[
          "w-full p-4 rounded-2xl border border-input bg-surface-container-high text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "resize-none",
          error ? "border-destructive" : "",
        ].join(" ")}
        rows={4}
        aria-invalid={!!error}
      />
      <p
        className={[
          "text-right text-sm",
          value.length >= BIO_MAX_LENGTH ? "text-destructive" : "text-muted-foreground",
        ].join(" ")}
      >
        {value.length}/{BIO_MAX_LENGTH}
      </p>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
