import Image from 'next/image'
import { cn } from '@/lib/utils'

// ─── Costanti ────────────────────────────────────────────────────────────────

const COLORS = [
  '#534AB7', '#1D9E75', '#185FA5', '#BA7517',
  '#C74B50', '#2E86AB', '#7B2D8B', '#E8631A',
]

const SIZES = {
  sm: { container: 'w-8 h-8',   text: 'text-xs'  },
  md: { container: 'w-10 h-10', text: 'text-sm'  },
  lg: { container: 'w-20 h-20', text: 'text-2xl' },
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function getAvatarColor(name: string): string {
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return COLORS[hash % COLORS.length]
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function Avatar({ name, avatarUrl, size = 'md', className }: AvatarProps) {
  const { container, text } = SIZES[size]

  if (avatarUrl) {
    return (
      <div className={cn('relative rounded-full overflow-hidden shrink-0', container, className)}>
        <Image src={avatarUrl} alt={name} fill className="object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full shrink-0 flex items-center justify-center font-semibold text-white select-none',
        container,
        text,
        className
      )}
      style={{ backgroundColor: getAvatarColor(name) }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
