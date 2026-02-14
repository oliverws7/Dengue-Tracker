import type { ReactNode, ButtonHTMLAttributes } from "react"
import "./Button.css"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon" | "small"
  className?: string
}

export default function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`button ${variant} ${size} ${className}`} {...props}>
      {children}
    </button>
  )
}

