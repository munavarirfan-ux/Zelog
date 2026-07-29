"use client";

import * as React from "react";
import MuiAvatar from "@mui/material/Avatar";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <MuiAvatar
      ref={ref}
      className={cn(
        "!text-white !text-xs !font-semibold",
        className,
      )}
      sx={{ width: 36, height: 36, background: "linear-gradient(135deg, #4133A5, #7A4DFF)" }}
      {...(props as any)}
    >
      {children}
    </MuiAvatar>
  )
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, src, alt, ...props }, ref) => (
    <img ref={ref} src={src} alt={alt || ""} className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
  )
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <span className={cn("flex h-full w-full items-center justify-center", className)} ref={ref as any} {...props}>
      {children}
    </span>
  )
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
