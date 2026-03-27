'use client';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-orange-400 text-slate-950 shadow-[0_8px_22px_rgba(245,158,11,0.32)] hover:brightness-110 focus:ring-primary-300/60',
    secondary: 'surface-panel-soft border border-white/20 text-white hover:border-white/35 hover:bg-white/10 focus:ring-white/40',
    ghost: 'bg-transparent text-white/85 hover:bg-white/10 hover:text-white focus:ring-white/30',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-[0_8px_22px_rgba(239,68,68,0.28)] hover:brightness-110 focus:ring-red-300/60',
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <><svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Loading...</>
      ) : children}
    </button>
  );
}
