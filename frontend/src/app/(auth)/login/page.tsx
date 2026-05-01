"use client";

/**
 * Login Page
 * Page for authenticating existing users
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/features/auth/auth-card";
import { LoginForm } from "@/components/features/auth/login-form";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
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
    <AuthCard>
      <LoginForm />
    </AuthCard>
  );
}
