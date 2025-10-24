'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useGasless } from '../hooks/useGasless';
import { Loader2 } from 'lucide-react';

interface GaslessButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  className?: string;
  showGasFree?: boolean;
}

export default function GaslessButton({
  onClick,
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  showGasFree = true,
}: GaslessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { gasPrice } = useGasless();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error('Gasless transaction failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={className}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </Button>

      {showGasFree && (
        <Badge variant="secondary" className="text-xs">
          Gas-Free
        </Badge>
      )}
    </div>
  );
}

