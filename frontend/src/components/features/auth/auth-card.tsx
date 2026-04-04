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
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
