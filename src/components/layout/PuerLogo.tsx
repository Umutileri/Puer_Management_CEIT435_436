import React from "react";
import { cn } from "@/src/lib/utils";

interface PuerLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { box: "h-10 w-10", icon: "h-6 w-6", text: "text-lg" },
  md: { box: "h-11 w-11", icon: "h-7 w-7", text: "text-xl" },
  lg: { box: "h-14 w-14", icon: "h-9 w-9", text: "text-2xl" },
};

export const PuerLogo: React.FC<PuerLogoProps> = ({
  size = "md",
  showText = true,
  className,
}) => {
  const sizes = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-orange-400 shadow-lg shadow-orange-500/30",
          sizes.box,
        )}
      >
        <span
          className="text-xl font-black text-white text-center"
          style={{
            textShadow: "0 2px 8px rgba(255,255,255,0.35)",
          }}
        >
          P.
        </span>
      </div>
      {showText && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-black tracking-[0.18em] text-slate-900",
              sizes.text,
            )}
          >
            PUER
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
        </div>
      )}
    </div>
  );
};
