import { SeasonDetail } from "@/components/features/season/season-detail";

type SeasonDetailPageProps = {
  params: {
    seasonId: string;
  };
};

export default function SeasonDetailPage({ params }: SeasonDetailPageProps) {
  return (
    <main className="min-h-screen bs-editorial-shell pt-24 pb-16 px-4">
      <section className="max-w-3xl mx-auto">
        <SeasonDetail seasonId={params.seasonId} />
      </section>
    </main>
  );
}
