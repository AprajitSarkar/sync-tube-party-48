
import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "heavy";
  withBorder?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const intensityMap = {
  light: "bg-white/10",
  medium: "bg-white/15",
  heavy: "bg-white/20",
};

const paddingMap = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      intensity = "medium",
      withBorder = true,
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "backdrop-blur-xl rounded-2xl transition-all",
          intensityMap[intensity],
          paddingMap[padding],
          withBorder && "border border-white/20",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
