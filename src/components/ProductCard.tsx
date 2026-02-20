'use client';

import { Product } from '@/lib/types';
import { useCart } from '@/store/cart';
import { useState, useRef } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const cartItem = items.find(i => i.id === product.id);
  const qty = cartItem?.quantity || 0;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const savePct = product.discount || (hasDiscount ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    setAdded(true);

    if (addBtnRef.current) {
      addBtnRef.current.style.transform = 'scale(1.2)';
      setTimeout(() => {
        if (addBtnRef.current) addBtnRef.current.style.transform = 'scale(1)';
      }, 180);
    }

    setTimeout(() => setAdded(false), 800);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (qty <= 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, qty - 1);
    }
  };

  const imgSrc = !imgError && product.image ? product.image : '/placeholder.svg';

  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden flex flex-col">
      {/* Image area */}
      <div className="relative aspect-[4/3.5] bg-gradient-to-br from-[#f7f7fa] via-[#f3f3f8] to-[#eeeef3] overflow-hidden">
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={imgSrc}
          alt={product.name}
          className={`card-img w-full h-full object-contain p-4 transition-all duration-500 ${
            imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          loading="lazy"
          onError={() => setImgError(true)}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Discount badge */}
        {savePct > 0 && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold text-white px-2 py-[3px] rounded-lg leading-none tracking-wide"
            style={{ background: 'linear-gradient(135deg, #ff453a, #ff6259)' }}
          >
            -{savePct}%
          </span>
        )}

        {/* Cart controls — bottom right */}
        <div className="absolute bottom-2 right-2 flex items-center">
          {qty > 0 && !added ? (
            /* Stepper: − qty + */
            <div className="qty-stepper">
              {/* Minus / Trash */}
              <button
                onClick={handleRemove}
                aria-label="Remove from cart"
              >
                {qty === 1 ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-error)" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-text)" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </button>

              {/* Quantity */}
              <span className="qty-value">{qty}</span>

              {/* Plus */}
              <button
                ref={addBtnRef}
                onClick={handleAdd}
                aria-label="Add one more"
                style={{ transitionTimingFunction: 'var(--ease-spring)', willChange: 'transform' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            /* Initial add button */
            <button
              ref={addBtnRef}
              onClick={handleAdd}
              className={`w-[36px] h-[36px] rounded-xl flex items-center justify-center transition-all duration-200 ${
                added
                  ? 'bg-[var(--c-success)] shadow-lg shadow-green-500/25'
                  : 'bg-[var(--c-dark)] shadow-lg shadow-black/15'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-spring)', willChange: 'transform' }}
              aria-label="Add to cart"
            >
              {added ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 'check-draw 0.3s ease forwards' }} />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-3 pt-2 pb-3 flex flex-col flex-1">
        <p className="text-[13px] font-medium text-[var(--c-text)] line-clamp-2 leading-[1.4] min-h-[2.3rem]">
          {product.name}
        </p>
        <div className="mt-auto pt-1.5 flex items-baseline gap-1.5">
          <span className="text-[17px] font-bold text-[var(--c-text)] tracking-tight">
            €{product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-[var(--c-text-muted)] line-through">
              €{product.originalPrice!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
