"use client";

/**
 * Registration Form Component
 * Form for creating a new user account
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
import { Check, Eye, EyeOff } from "lucide-react";

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
    } catch {
      // Error is handled by useAuth hook
    }
  };

  return (
    <Card className="w-full bs-panel bs-glass">
      <CardHeader className="space-y-2 text-left pl-8 pr-6 pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted font-manrope">
          Begin your season
        </p>
        <CardTitle className="font-newsreader text-4xl text-foreground leading-tight">
          Join beansprout
        </CardTitle>
        <CardDescription className="text-foreground-muted">
          Start your reading journey
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
                placeholder="Create a password"
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
            
            {/* Password Requirements Checklist */}
            {password.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-surface-container-low space-y-2">
                {requirementsMet.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      req.met ? "text-foreground" : "text-foreground-muted"
                    }`}
                  >
                    <Check className={`w-4 h-4 ${req.met ? "opacity-100" : "opacity-40"}`} />
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            )}
            
            {errors.password && (
              <p className="text-sm text-destructive mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-error-container text-foreground text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !allRequirementsMet}
            size="lg"
            className="w-full h-12"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-foreground-muted pt-2">
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
