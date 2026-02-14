import type { ReactNode } from "react"
import "./Badge.css"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "outline" | "destructive" | "warning" | "success"
  size?: "default" | "small"
  className?: string
}

export default function Badge({ children, variant = "default", size = "default", className = "" }: BadgeProps) {
  return <span className={`badge ${variant} ${size} ${className}`}>{children}</span>
}

