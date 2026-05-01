/**
 * Home Page
 * Landing page for the beansprout application
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/seasons");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="font-newsreader text-5xl md:text-6xl text-foreground mb-4">
          beansprout
        </h1>
        <p className="text-xl text-foreground-muted mb-8">
          A warm, welcoming space for book club facilitation
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full 
                       bg-primary text-primary-foreground font-medium
                       hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full 
                       border border-surface-container-high bg-white font-medium
                       hover:bg-surface-container transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
