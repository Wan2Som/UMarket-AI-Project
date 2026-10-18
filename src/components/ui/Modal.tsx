"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/format";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Hide the close button for steps the user should finish. Escape still works. */
  dismissible?: boolean;
  className?: string;
}

/**
 * Accessible modal built on the native <dialog> element: focus trapping,
 * Escape to close and the backdrop come from the browser.
 */
export function Modal({ open, onClose, title, description, children, dismissible = true, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (dismissible && e.target === ref.current) onClose();
      }}
      aria-labelledby="modal-title"
      className={cn(
        "glass m-auto w-[min(92vw,28rem)] rounded-3xl p-0 text-fg shadow-float",
        "bg-surface-strong/95 open:animate-rise",
        className,
      )}
    >
      <div className="p-6 sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="font-display text-xl font-bold tracking-tight">
              {title}
            </h2>
            {description && <div className="mt-1.5 text-sm leading-relaxed text-muted">{description}</div>}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 -mt-1 rounded-full p-2 text-muted transition-colors hover:bg-line hover:text-fg"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </dialog>
  );
}
