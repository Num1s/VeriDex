import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'border-primary-300 bg-primary-100 text-primary-700 hover:bg-primary-200',
        accent:
          'border-accent-300 bg-accent-100 text-accent-700 hover:bg-accent-200',
        secondary:
          'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200',
        destructive:
          'border-red-300 bg-red-100 text-red-700 hover:bg-red-200',
        success:
          'border-green-300 bg-green-100 text-green-700 hover:bg-green-200',
        warning:
          'border-yellow-300 bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
        outline: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

