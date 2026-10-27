import { type ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ open, onClose, title, subtitle, children, footer }: Props) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 p-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
