"use client";

/**
 * Registration Page
 * Page for creating a new user account
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/features/auth/auth-card";
import { RegisterForm } from "@/components/features/auth/register-form";
import { RedirectingState } from "@/components/ui/redirecting-state";
import { useAuthStore } from "@/stores/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/seasons");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return <RedirectingState />;
  }

  return (
    <AuthCard>
      <RegisterForm />
    </AuthCard>
  );
}
