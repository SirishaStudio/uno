import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { soundButtonClick } from '@/hooks/useSound';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-br from-uno-red to-red-700 text-white font-semibold ' +
    'shadow-lg shadow-uno-red/30 hover:shadow-uno-red/50 hover:from-red-500 hover:to-uno-red ' +
    'border border-red-400/20 active:scale-95',
  secondary:
    'glass text-white font-semibold hover:bg-white/10 border-white/15 active:scale-95',
  ghost:
    'bg-transparent text-uno-muted hover:text-white hover:bg-white/5 border border-transparent active:scale-95',
  danger:
    'bg-gradient-to-br from-red-700 to-red-900 text-white font-semibold ' +
    'hover:from-red-600 hover:to-red-800 border border-red-500/20 active:scale-95',
  neon:
    'bg-gradient-to-br from-neon-red to-uno-red text-white font-black ' +
    'shadow-lg shadow-neon-red/40 hover:shadow-neon-red/60 active:scale-95',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9  px-4  text-sm  rounded-xl',
  md: 'h-11 px-5  text-sm  rounded-2xl',
  lg: 'h-13 px-8  text-base rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, onClick, children, ...rest }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      soundButtonClick();
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-uno-bg',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
          'select-none cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
