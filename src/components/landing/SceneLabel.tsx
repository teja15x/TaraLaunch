"use client";

import { cn } from "@/utils/helpers";

interface SceneLabelProps {
  title: string;
  subtitle: string;
  align?: "left" | "center" | "right";
  active: boolean;
}

export default function SceneLabel({
  title,
  subtitle,
  align = "left",
  active,
}: SceneLabelProps) {
  const alignment =
    align === "center"
      ? "items-center text-center mx-auto"
      : align === "right"
      ? "items-end text-right ml-auto"
      : "items-start text-left";

  return (
    <div
      className={cn(
        "pointer-events-none flex flex-col gap-2 transition-all duration-500",
        "max-w-lg",
        alignment,
        active
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0"
      )}
    >
      <h2 className="text-xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-2xl md:text-3xl">
        {title}
      </h2>
      <p className="text-sm text-white/70 drop-shadow sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}
