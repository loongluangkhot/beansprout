"use client";

/**
 * Button Component
 * Primary interactive element for forms and CTAs
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all",
          "active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          
          // Variants
          variant === "default" && "bs-cta shadow-none hover:brightness-[0.98]",
          variant === "outline" &&
            "border border-outline-variant/20 bg-transparent text-foreground hover:bg-surface-container-low hover:text-foreground",
          variant === "ghost" && "bg-transparent text-foreground hover:bg-surface-container-low",
          
          // Sizes
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 px-3",
          size === "lg" && "h-12 px-8",
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
