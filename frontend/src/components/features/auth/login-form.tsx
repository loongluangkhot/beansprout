"use client";

/**
 * Login Form Component
 * Form for authenticating with existing credentials
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

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
  const { login: loginUser, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const searchParams = useSearchParams();
  const loggedOut = searchParams.get("logged_out") === "true";
  
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
    <Card className="w-full bs-panel bs-glass">
      <CardHeader className="space-y-2 text-left pl-8 pr-6 pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted font-manrope">
          Welcome to beansprout
        </p>
        <CardTitle className="font-newsreader text-4xl text-foreground leading-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-foreground-muted">
          Sign in to continue your reading journey
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pb-8">
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
              className="h-12"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">
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
                className="h-12 pr-12"
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
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {errors.password && (
              <p className="text-sm text-destructive mt-1">
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
              className="w-4 h-4 rounded border-input bg-transparent text-primary focus:ring-ring/20"
            />
            <Label htmlFor="rememberMe" className="text-foreground-muted text-sm cursor-pointer">
              Remember me
            </Label>
          </div>

          {/* Logged Out Success Message */}
          {loggedOut && (
            <div className="p-3 rounded-lg bg-success-container text-foreground text-sm">
              Thanks for visiting! Come back soon.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-error-container text-foreground text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full h-12"
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
          <p className="text-center text-sm text-foreground-muted pt-2">
            Don&apos;t have an account?{" "}
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
