'use client'

import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconButtonProps {
  icon: LucideIcon
  label?: string
  iconDirection?: 'left' | 'right'
  onClick?: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

export function IconButton({
  icon: Icon,
  label,
  iconDirection = 'left',
  onClick,
  variant = 'ghost',
  size = 'icon',
  className,
  disabled,
  'aria-label': ariaLabel,
}: IconButtonProps) {
  const iconEl = <Icon className="h-4 w-4" />

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={cn(
        label && 'gap-2',
        className,
        'w-fit p-4'
      )}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
    >
      {iconDirection === 'left' && iconEl}
      {label}
      {iconDirection === 'right' && iconEl}
    </Button>
  )
}
