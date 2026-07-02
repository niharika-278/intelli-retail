import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

export function LogoIcon({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8 w-8', className)}
      aria-hidden
    >
      <rect x="6" y="4" width="5" height="24" rx="2.5" fill="currentColor" />
      <circle cx="22" cy="8" r="3" fill="currentColor" opacity="0.9" />
      <circle cx="22" cy="16" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="22" cy="24" r="3" fill="currentColor" opacity="0.35" />
      <path
        d="M11 12h7M11 16h7M11 20h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

export default function Logo({ variant = 'full', className, to = '/' }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5 group', className)}>
      <LogoIcon className="text-ink group-hover:text-violet transition-colors duration-200" />
      {variant === 'full' && (
        <span className="font-display text-xl tracking-tight">
          <span className="font-bold">Intelli</span>
          <span className="font-semibold opacity-60">Retail</span>
        </span>
      )}
    </Link>
  );
}
