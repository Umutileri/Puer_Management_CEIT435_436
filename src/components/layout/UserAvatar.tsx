import React from "react";
import { cn, getInitials } from "@/src/lib/utils";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-24 w-24 text-2xl",
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = "md", className }) => {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-primary to-orange-400 font-black uppercase text-white shadow-md shadow-orange-500/20",
        sizeMap[size],
        className
      )}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
