import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}

export function MobileDrawer({ open, children, onClose }: MobileDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex bg-slate-950/80 lg:hidden"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close search settings"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div
        id="mobile-search-settings"
        role="dialog"
        aria-modal="true"
        aria-label="Search settings"
        className="relative z-10 h-full w-[min(24rem,90vw)] overflow-y-auto bg-slate-900 p-4 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-white">Search settings</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close search settings"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
