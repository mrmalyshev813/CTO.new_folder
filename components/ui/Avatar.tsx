import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isOnline?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'md', isOnline = false, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    }

    return (
      <div className="relative inline-block" ref={ref} {...props}>
        <div
          className={cn(
            'rounded-full overflow-hidden bg-[#e1e3e6] flex items-center justify-center font-medium text-[#818c99]',
            sizeClasses[size],
            className
          )}
        >
          {src ? (
            <img src={src} alt={alt} className="w-full h-full object-cover" />
          ) : (
            <span>{alt?.charAt(0) || '?'}</span>
          )}
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4bb34b] border-2 border-white rounded-full" />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar }
