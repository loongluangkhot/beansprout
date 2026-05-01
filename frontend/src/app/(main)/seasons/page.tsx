import { SeasonLibrary } from "@/components/features/season/season-library";

export default function SeasonsPage() {
  return (
    <main className="min-h-screen bs-editorial-shell pt-24 pb-16 px-4">
      <section className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="font-newsreader text-4xl text-foreground">Season Library</h1>
          <p className="font-manrope text-foreground-muted">
            Browse active public seasons and find your next reading circle.
          </p>
        </header>
        <SeasonLibrary />
      </section>
    </main>
  );
}
