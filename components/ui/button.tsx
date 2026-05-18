"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 
          "bg-neon-pink text-black shadow-lg shadow-neon-pink/30 hover:bg-neon-pink/90",
        outline: 
          "border-2 border-neon-blue text-neon-blue hover:bg-neon-blue/10 hover:text-neon-blue",
        ghost:
          "text-neon-purple hover:bg-neon-purple/10 hover:text-neon-purple",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, glow = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            glow && "animate-glow-pulse"
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };