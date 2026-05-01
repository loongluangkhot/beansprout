import { PublicProfile } from "@/components/features/profile/public-profile";

type PublicProfilePageProps = {
  params: {
    userId: string;
  };
};

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  return (
    <main className="min-h-screen bs-editorial-shell pt-24 pb-16 px-4">
      <section className="max-w-3xl mx-auto">
        <PublicProfile userId={params.userId} />
      </section>
    </main>
  );
}
