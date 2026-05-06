interface BadgeProps {
  label: string;
  color?: 'orange' | 'red' | 'green' | 'blue' | 'gray';
  className?: string;
}

const colors = {
  orange: 'bg-brand-accent text-white',
  red: 'bg-red-500 text-white',
  green: 'bg-emerald-500 text-white',
  blue: 'bg-blue-500 text-white',
  gray: 'bg-gray-200 text-gray-700',
};

export function Badge({ label, color = 'orange', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wide ${colors[color]} ${className}`}>
      {label}
    </span>
  );
}
