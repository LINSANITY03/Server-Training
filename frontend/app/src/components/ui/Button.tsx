"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: string;
  loading?: boolean;
}

export default function Button({
  children,
  variant = "solid",
  size = "md",
  icon,
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Base structural styling
  const baseStyle = "inline-flex items-center justify-center font-semibold tracking-wide rounded-[var(--radius)] transition-all duration-150 transform active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";
  
  // Custom design token configurations
  const variants = {
    solid: "bg-[var(--amber)] text-[#1a0f00] shadow-md shadow-[rgba(212,148,58,0.1)] hover:bg-[var(--amber-light)]",
    outline: "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface2)] hover:border-[var(--border-hover)]",
    ghost: "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        // Loading Spinner Layout
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      ) : icon ? (
        <i className={`ti ${icon} text-base`} aria-hidden="true" />
      ) : null}
      
      <span>{children}</span>
    </button>
  );
}