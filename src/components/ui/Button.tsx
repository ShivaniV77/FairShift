import { type ReactNode, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm',
  secondary:
    'bg-slate-800 text-white hover:bg-slate-900 focus-visible:ring-slate-500',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm',
  outline:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
