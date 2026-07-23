import React from "react";

interface SectionHeadingProps {
  tag?: string;
  title: string; // supports markdown-like em for styling e.g., "Draped in *Heritage*"
  center?: boolean;
  className?: string;
}

export default function SectionHeading({
  tag,
  title,
  center = true,
  className = "",
}: SectionHeadingProps) {
  // Parse title to handle *text* styling as gold italics
  const parsedTitle = title.split("*").map((part, i) => {
    if (i % 2 !== 0) {
      return (
        <em key={i} className="text-gold not-italic font-accent font-normal italic pr-1">
          {part}
        </em>
      );
    }
    return part;
  });

  return (
    <div className={`mb-12 flex flex-col ${center ? "items-center text-center" : "items-start text-left"} ${className}`}>
      {tag && (
        <span className="text-gold text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-4 block font-sans font-light">
          {tag}
        </span>
      )}
      <h2 className="font-display text-4xl sm:text-5xl font-light leading-[1.2] text-charcoal">
        {parsedTitle}
      </h2>
      <div className={`w-12 h-[1px] bg-gold/45 mt-5 ${center ? "mx-auto" : ""}`} />
    </div>
  );
}
