"use client";

/**
 * Registration Form Component
 * Form for creating a new user account
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

// Registration form schema with Zod validation
const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Password requirement checklist
interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Contains letter", test: (p) => /[a-zA-Z]/.test(p) },
  { label: "Contains number", test: (p) => /[0-9]/.test(p) },
];

export function RegisterForm() {
  const { register: registerUser, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password", "");
  
  // Check password requirements
  const requirementsMet = passwordRequirements.map((req) => ({
    ...req,
    met: req.test(password),
  }));
  
  const allRequirementsMet = requirementsMet.every((req) => req.met);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
      });
      // Show confirmation message before redirect
      setSuccessMessage("Welcome to beansprout! Your account has been created.");
      setShowSuccess(true);
      // Small delay to show message before redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch {
      // Error is handled by useAuth hook
    }
  };

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm border-surface-container-high shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="font-newsreader text-3xl text-foreground">
          Join beansprout
        </CardTitle>
        <CardDescription className="text-foreground-muted">
          Start your reading journey
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
                placeholder="Create a password"
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
            
            {/* Password Requirements Checklist */}
            {password.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-surface-container/50 space-y-2">
                {requirementsMet.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      req.met ? "text-green-700" : "text-foreground-muted"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            )}
            
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !allRequirementsMet || showSuccess}
            className="w-full py-6 rounded-full bg-primary text-primary-foreground font-medium
                       hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Creating account...
              </span>
            ) : showSuccess ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Redirecting...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-foreground-muted">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
