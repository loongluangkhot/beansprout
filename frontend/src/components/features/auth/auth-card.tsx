"use client";

/**
 * AuthCard Component
 * Container component for authentication pages
 */

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 bs-editorial-shell">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 left-[-20%] h-80 w-80 rounded-full opacity-45 blur-3xl"
          style={{ background: "color-mix(in oklab, var(--color-primary) 20%, transparent)" }}
        />
        <div
          className="absolute -bottom-24 right-[-20%] h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{ background: "color-mix(in oklab, var(--color-tertiary) 18%, transparent)" }}
        />
      </div>
      <div className="relative w-full max-w-md md:ml-10">{children}</div>
    </div>
  );
}
