'use client';

import { useCart } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { useRef, useState, useCallback, useEffect } from 'react';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    toggleCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    deliveryMethod,
    setDeliveryMethod,
  } = useCart();
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, currentY: 0, isDragging: false });
  const [sheetY, setSheetY] = useState(0);
  const [closing, setClosing] = useState(false);

  const deliveryFee = deliveryMethod === 'delivery' ? 9.95 : 0;

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      setClosing(false);
      setSheetY(0);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  // Drag-to-dismiss handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = sheetRef.current;
    if (!el) return;
    // Only allow drag from handle area or when scrolled to top
    const scrollTop = el.querySelector('.momentum-scroll')?.scrollTop || 0;
    if (scrollTop > 0) return;
    dragRef.current = { startY: e.touches[0].clientY, currentY: 0, isDragging: true };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.isDragging) return;
    const dy = e.touches[0].clientY - dragRef.current.startY;
    if (dy < 0) return; // don't drag up
    dragRef.current.currentY = dy;
    setSheetY(dy);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    if (dragRef.current.currentY > 120) {
      // Dismiss
      setClosing(true);
      setSheetY(window.innerHeight);
      setTimeout(() => toggleCart(false), 300);
    } else {
      setSheetY(0);
    }
  }, [toggleCart]);

  const handleClose = () => {
    setClosing(true);
    setSheetY(window.innerHeight);
    setTimeout(() => toggleCart(false), 300);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Overlay */}
      <div
        className={`absolute inset-0 overlay transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] max-h-[88vh] flex flex-col safe-bottom"
        style={{
          boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
          transform: `translateY(${sheetY}px)`,
          transition: dragRef.current.isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25,1,0.5,1)',
          animation: !closing && sheetY === 0 ? 'slide-up 0.42s cubic-bezier(0.25,1,0.5,1)' : undefined,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="sheet-handle" />

        {/* Header */}
        <div className="px-4 pt-2 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-[var(--c-text)] tracking-tight">Your cart</h2>
            <p className="text-[13px] text-[var(--c-text-muted)] mt-0.5">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
              {totalItems > 0 && <span className="text-[var(--c-text-secondary)] font-medium"> · €{totalPrice.toFixed(2)}</span>}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-[32px] h-[32px] rounded-full bg-[var(--c-fill)] flex items-center justify-center active:bg-[var(--c-border)] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-secondary)" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Segmented control for delivery */}
        <div className="px-4 pb-3">
          <div className="segmented-control">
            <div
              className="segmented-thumb"
              style={{
                left: deliveryMethod === 'delivery' ? '2px' : '50%',
                width: 'calc(50% - 2px)',
              }}
            />
            {(['delivery', 'pickup'] as const).map(method => (
              <button
                key={method}
                data-active={deliveryMethod === method || undefined}
                onClick={() => setDeliveryMethod(method)}
              >
                {method === 'delivery' ? 'Deliver to boat' : 'Marina pickup'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-[var(--c-border)] mx-4" />

        {/* Items */}
        <div className="flex-1 overflow-y-auto momentum-scroll">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--c-text-muted)]">
              <div className="w-16 h-16 rounded-full bg-[var(--c-fill)] flex items-center justify-center mb-4 anim-float">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="font-semibold text-[var(--c-text)] text-[16px]">No items yet</p>
              <p className="text-[13px] mt-1 max-w-[200px] text-center">Browse products and add something to your cart</p>
            </div>
          ) : (
            <div className="px-4 py-2">
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 pt-3 pb-2 border-t border-[var(--c-border)] bg-white">
            <div className="flex items-center justify-between text-[14px] mb-1.5">
              <span className="text-[var(--c-text-secondary)]">Subtotal</span>
              <span className="font-semibold">€{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[14px] mb-3">
              <span className="text-[var(--c-text-secondary)]">
                {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
              </span>
              <span className={`font-semibold ${deliveryFee === 0 ? 'text-[var(--c-success)]' : ''}`}>
                {deliveryFee === 0 ? 'Free' : `€${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <button
              onClick={() => { toggleCart(false); router.push('/checkout'); }}
              className="btn-dark w-full h-[52px] rounded-2xl font-semibold text-[16px] flex items-center justify-center gap-2"
            >
              <span>Checkout</span>
              <span className="text-white/30">·</span>
              <span>€{(totalPrice + deliveryFee).toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Cart Item with swipe-to-delete ─── */
function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: { id: string; name: string; image: string; price: number; quantity: number };
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [removing, setRemoving] = useState(false);
  const dragStart = useRef(0);
  const isDragging = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - dragStart.current;
    if (dx > 0) return; // only left swipe
    setSwipeX(Math.max(dx, -80));
  };

  const onTouchEnd = () => {
    isDragging.current = false;
    if (swipeX < -50) {
      setSwipeX(-80);
    } else {
      setSwipeX(0);
    }
  };

  const handleDelete = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 250);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl mb-2 transition-all duration-250 ${
        removing ? 'opacity-0 h-0 mb-0' : ''
      }`}
      style={removing ? { transform: 'translateX(-100%)', maxHeight: 0 } : {}}
    >
      {/* Delete background */}
      <div className="absolute inset-0 swipe-delete-bg rounded-xl">
        <button onClick={handleDelete} className="ml-auto px-5 flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1.5 14a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 6" />
          </svg>
          Delete
        </button>
      </div>

      {/* Content */}
      <div
        className="relative bg-[var(--c-fill-secondary)] rounded-2xl px-3 py-3 flex gap-3"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.28s cubic-bezier(0.25,1,0.5,1)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-[56px] h-[56px] bg-white rounded-xl flex-shrink-0 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <img
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            className="w-full h-full object-contain p-1.5"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[var(--c-text)] line-clamp-2 leading-tight">
            {item.name}
          </p>
          <p className="text-[16px] font-bold text-[var(--c-text)] mt-1">
            €{(item.price * item.quantity).toFixed(2)}
          </p>
          {item.quantity > 1 && (
            <p className="text-[11px] text-[var(--c-text-muted)] mt-0.5">€{item.price.toFixed(2)} each</p>
          )}
        </div>

        {/* Stepper */}
        <div className="flex items-center self-center qty-stepper">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-[34px] h-[34px] flex items-center justify-center text-[var(--c-text-secondary)]"
          >
            {item.quantity === 1 ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-error)" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1.5 14a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 6" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
          <span className="qty-value">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-[34px] h-[34px] flex items-center justify-center text-[var(--c-accent)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
