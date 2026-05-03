interface RedirectingStateProps {
  message?: string;
}

export function RedirectingState({ message = "Redirecting..." }: RedirectingStateProps) {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-4">
      <p className="font-manrope text-foreground-muted">{message}</p>
    </main>
  );
}
