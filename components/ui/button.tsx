import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl hover:scale-105 btn-glow",
        destructive:
          "bg-gradient-to-r from-error to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white shadow-md hover:shadow-lg",
        secondary:
          "bg-gradient-to-r from-secondary/10 to-secondary/20 text-secondary border border-secondary/30 hover:from-secondary hover:to-secondary/80 hover:text-white shadow-md hover:shadow-lg",
        ghost: "bg-transparent hover:bg-muted text-foreground hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline bg-transparent p-0 h-auto font-medium",
        glass: "glass-effect text-white hover:bg-white/20 shadow-lg backdrop-blur-md",
        glow: "bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:shadow-glow-lg animate-pulse-glow",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        xl: "h-16 px-10 py-5 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, icon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && "cursor-not-allowed",
          disabled && "cursor-not-allowed opacity-50"
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="spinner w-4 h-4 mr-2" />
            {children}
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
