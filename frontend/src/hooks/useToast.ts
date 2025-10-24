import { toast as sonnerToast } from 'react-hot-toast';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const useToast = () => {
  const toast = ({ title, description, variant = 'default', duration = 4000 }: ToastOptions) => {
    const style = variant === 'destructive'
      ? { background: '#ef4444', color: 'white' }
      : { background: '#10b981', color: 'white' };

    sonnerToast(title, {
      duration,
      style,
      position: 'top-right',
    });

    if (description) {
      sonnerToast(description, {
        duration: duration - 1000,
        style: { ...style, fontSize: '14px', opacity: 0.8 },
        position: 'top-right',
      });
    }
  };

  return { toast };
};

