import type { ReactNode } from 'react'

interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info'
  children: ReactNode
}

export default function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>
}
