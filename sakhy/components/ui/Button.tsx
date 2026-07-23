import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "crimson";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  href?: string;
}

/**
 * Button — reference-styled with rounded-full pill shape.
 * - primary: dark (ink) background, ivory text — matches reference "Shop Collection" button
 * - outline: bordered pill, transparent bg — matches reference "Explore New Arrivals" button
 * - ghost: transparent, no border
 * - crimson: for destructive/alert actions
 * All functional props (disabled, loading spinner, href) are preserved.
 */

const sizes = {
  sm:  "px-4 py-2 text-[10px] tracking-wider",
  md:  "px-6 py-3.5 text-[12px]",
  lg:  "px-7 py-3.5 text-[13px]",
};

const variants = {
  primary:
    "text-background hover:opacity-85 border border-transparent active:opacity-100",
  outline:
    "bg-transparent border hover:opacity-80 active:opacity-100",
  ghost:
    "bg-transparent text-inherit hover:opacity-70 active:opacity-100",
  crimson:
    "border border-transparent hover:opacity-85 active:opacity-100",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  href,
  className = "",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-sans uppercase tracking-[0.18em] transition-all duration-300 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  // Build inline styles to match reference color system
  const getStyle = (): React.CSSProperties => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "var(--color-ink)",
          color: "var(--color-background)",
          borderColor: "transparent",
          ...style,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: "var(--color-ink)",
          borderColor: "rgba(17,17,17,0.25)",
          ...style,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: "var(--color-ink)",
          borderColor: "transparent",
          ...style,
        };
      case "crimson":
        return {
          backgroundColor: "var(--color-crimson)",
          color: "var(--color-ivory)",
          borderColor: "transparent",
          ...style,
        };
      default:
        return style || {};
    }
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
      <Link href={href} className={classes} style={getStyle()}>
        {content}
      </Link>
    );
  }

  return (
    <button
      disabled={disabled || loading}
      className={classes}
      style={getStyle()}
      {...props}
    >
      {content}
    </button>
  );
}
