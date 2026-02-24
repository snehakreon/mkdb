import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export default function Button({ children, onClick, variant = 'primary', className = '' }: Props) {
  const variants = {
    primary: 'bg-mk-red hover:bg-mk-red-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={\`px-4 py-2 rounded-lg font-semibold transition \${variants[variant]} \${className}\`}
    >
      {children}
    </button>
  );
}
