"use client";

/**
 * Login Form Component
 * Form for authenticating with existing credentials
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

// Login form schema with Zod validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Please enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login: loginUser, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginUser(data.email, data.password);
    } catch {
      // Error is handled by useAuth hook
    }
  };

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm border-surface-container-high shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="font-newsreader text-3xl text-foreground">
          Welcome back
        </CardTitle>
        <CardDescription className="text-foreground-muted">
          Sign in to continue your reading journey
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="rounded-full bg-surface-container border-surface-container-high px-4 py-6 
                         focus:border-primary focus:ring-primary/20 transition-colors"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="rounded-full bg-surface-container border-surface-container-high px-4 py-6 
                           pr-12 focus:border-primary focus:ring-primary/20 transition-colors"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted 
                           hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          {/* TODO: Implement backend support for extended token expiration when Remember Me is checked */}
          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-surface-container-high text-primary 
                         focus:ring-primary/20"
            />
            <Label htmlFor="rememberMe" className="text-foreground-muted text-sm cursor-pointer">
              Remember me
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 rounded-full bg-primary text-primary-foreground font-medium
                       hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-foreground-muted">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Create account
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
