"use client";

/**
 * Registration Page
 * Page for creating a new user account
 */

import { AuthCard } from "@/components/features/auth/auth-card";
import { RegisterForm } from "@/components/features/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthCard>
      <RegisterForm />
    </AuthCard>
  );
}
