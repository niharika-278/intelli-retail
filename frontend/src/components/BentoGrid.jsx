import { cn } from '../utils/cn';

export function BentoGrid({ children, className }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6',
        'auto-rows-[minmax(140px,auto)]',
        'gap-bento md:gap-bento-lg',
        className
      )}
    >
      {children}
    </div>
  );
}

export default BentoGrid;
