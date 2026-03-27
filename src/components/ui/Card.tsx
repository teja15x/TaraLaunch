interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`surface-panel rounded-3xl p-6 ${hover ? 'cursor-pointer transition-all hover:-translate-y-1 hover:border-white/35' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
