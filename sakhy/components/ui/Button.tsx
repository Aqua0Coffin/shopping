import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "crimson";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  href?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  href,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans uppercase tracking-[0.2em] text-xs transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-gold text-deep hover:bg-gold-light border border-transparent active:bg-gold",
    outline:
      "bg-transparent border border-gold text-gold hover:bg-gold/10 active:bg-gold/20",
    ghost:
      "bg-transparent text-gold hover:bg-gold/5 active:bg-gold/10",
    crimson:
      "bg-crimson text-ivory hover:bg-red-900 border border-transparent active:bg-crimson",
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] tracking-wider",
    md: "px-6 py-3.5",
    lg: "px-8 py-4 text-sm tracking-[0.25em]",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button disabled={disabled || loading} className={classes} {...props}>
      {content}
    </button>
  );
}
