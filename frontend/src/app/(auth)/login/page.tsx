"use client";

/**
 * Login Page
 * Page for authenticating existing users
 */

import { AuthCard } from "@/components/features/auth/auth-card";
import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <AuthCard>
      <LoginForm />
    </AuthCard>
  );
}
