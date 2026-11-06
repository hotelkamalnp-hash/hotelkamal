import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface UseModalDismissProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
}

/**
 * Hook to handle Escape key dismissal and body scroll locking.
 * Supports both object signature ({ isOpen, onClose }) and positional signature (isOpen, onClose).
 */
export function useModalDismiss(
  isOpenOrProps: boolean | UseModalDismissProps,
  maybeOnClose?: () => void,
  closeOnEscape = true,
  lockScroll = true
) {
  const isOpen = typeof isOpenOrProps === 'boolean' ? isOpenOrProps : isOpenOrProps.isOpen;
  const onClose = typeof isOpenOrProps === 'boolean' ? (maybeOnClose || (() => {})) : isOpenOrProps.onClose;
  const shouldEscape = typeof isOpenOrProps === 'boolean' ? closeOnEscape : (isOpenOrProps.closeOnEscape ?? true);
  const shouldLock = typeof isOpenOrProps === 'boolean' ? lockScroll : (isOpenOrProps.lockScroll ?? true);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldEscape && event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    if (shouldLock) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, shouldEscape, shouldLock]);
}

export interface ModalDismissButtonProps {
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  label?: string;
}

/**
 * Standardized accessible top-right close button meeting touch target requirements (>= 44px).
 * Supports both onClose and onClick handlers.
 */
export const ModalDismissButton: React.FC<ModalDismissButtonProps> = ({
  onClose,
  onClick,
  className = '',
  ariaLabel,
  label,
}) => {
  const handleDismiss = onClick || onClose || (() => {});
  const resolvedAriaLabel = ariaLabel || label || 'Close modal dialog';

  return (
    <button
      type="button"
      onClick={handleDismiss}
      aria-label={resolvedAriaLabel}
      className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 cursor-pointer ${className}`}
      title="Close (Esc)"
    >
      <X className="w-5 h-5" />
    </button>
  );
};
