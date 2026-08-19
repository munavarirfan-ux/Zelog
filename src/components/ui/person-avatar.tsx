"use client";

import { avatarGradient, initials } from "@/data/orgData";
import { cn } from "@/lib/utils";

interface PersonAvatarProps {
  name: string;
  /** Profile photo URL. When absent, a colored initials avatar is shown. */
  src?: string;
  /** Seed for the deterministic gradient (defaults to name). */
  seed?: string;
  size?: number;
  className?: string;
}

/** Employee avatar: photo when available, otherwise a multi-color initials chip. No outline. */
export function PersonAvatar({ name, src, seed, size = 36, className }: PersonAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold text-white", className)}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.36)), background: avatarGradient(seed ?? name) }}
    >
      {initials(name)}
    </span>
  );
}
