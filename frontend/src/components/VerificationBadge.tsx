'use client';

import { Badge } from './ui/badge';
import { formatVerificationStatus } from '../utils/formatters';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

interface VerificationBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function VerificationBadge({
  status,
  showIcon = true,
  size = 'default',
  className = '',
}: VerificationBadgeProps) {
  const { text, color } = formatVerificationStatus(status);

  const getIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-3 h-3" />;
      case 'rejected':
        return <XCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      default:
        return <Shield className="w-3 h-3" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      className={`${color} ${sizeClasses[size]} ${className}`}
      variant="outline"
    >
      {showIcon && getIcon()}
      <span className={showIcon ? 'ml-1' : ''}>{text}</span>
    </Badge>
  );
}

