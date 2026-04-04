"use client";

/**
 * Session Validator
 * Validates authentication session on app load
 * Used to restore auth state after page refresh
 */

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface SessionValidatorProps {
  children: React.ReactNode;
}

export function SessionValidator({ children }: SessionValidatorProps) {
  const [isReady, setIsReady] = useState(false);
  const { token, validateSession } = useAuthStore();

  useEffect(() => {
    async function checkSession() {
      if (token) {
        // Validate the stored token
        await validateSession();
      }
      setIsReady(true);
    }

    checkSession();
  }, [token, validateSession]);

  // Show nothing while validating (prevents flash of unauthenticated state)
  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
