import { SeasonCreateForm } from "@/components/features/season/season-create-form";

export default function CreateSeasonPage() {
  return (
    <main className="min-h-screen bs-editorial-shell pt-24 pb-16 px-4">
      <section className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="font-newsreader text-4xl text-foreground">Create Season</h1>
          <p className="font-manrope text-foreground-muted">
            Start a new reading circle with a welcoming title, book, and story.
          </p>
        </header>
        <SeasonCreateForm />
      </section>
    </main>
  );
}
