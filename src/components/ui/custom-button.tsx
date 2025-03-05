
import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const buttonVariants = cva(
  "relative overflow-hidden transition-all duration-300 ease-in-out flex items-center justify-center gap-2",
  {
    variants: {
      variant: {
        default:
          "glass-effect hover:bg-white/10 active:scale-[0.98] active:bg-white/15",
        outline:
          "bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5",
        ghost: "bg-transparent hover:bg-white/5",
        glow: "bg-primary/20 hover:bg-primary/30 subtle-glow before:absolute before:inset-0 before:bg-primary/10 before:blur-xl before:opacity-0 hover:before:opacity-100 before:transition-opacity",
      },
      size: {
        default: "h-12 px-6 py-3 rounded-xl text-base",
        sm: "h-10 px-4 py-2 rounded-lg text-sm",
        lg: "h-14 px-8 py-4 rounded-xl text-lg",
        icon: "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant, size, isLoading, icon, children, ...props }, ref) => {
    return (
      <Button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}
      </Button>
    );
  }
);

CustomButton.displayName = "CustomButton";

export { CustomButton, buttonVariants };
