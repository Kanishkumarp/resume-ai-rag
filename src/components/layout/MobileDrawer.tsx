interface MobileDrawerProps {
  open: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

export function MobileDrawer({ open, children, onClose }: MobileDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 lg:hidden" onClick={onClose}>
      <div className="h-full w-80 max-w-[85vw] bg-slate-900 p-4" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
