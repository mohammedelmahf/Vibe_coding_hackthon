'use client';

import { useCart } from '@/store/cart';

export default function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div className="fixed top-2 left-3 right-3 z-[80] pointer-events-none safe-top">
      <div
        className="mx-auto max-w-[340px] rounded-2xl flex items-center gap-3 px-4 py-3.5 toast-in"
        style={{
          background: toast.type === 'success'
            ? 'rgba(28,28,30,0.92)'
            : 'rgba(255,59,48,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 ${
          toast.type === 'success' ? 'bg-[var(--c-success)]' : 'bg-white/25'
        }`}>
          {toast.type === 'success' ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>
        <span className="text-white text-[14px] font-medium leading-snug line-clamp-1">{toast.message}</span>
      </div>
    </div>
  );
}
