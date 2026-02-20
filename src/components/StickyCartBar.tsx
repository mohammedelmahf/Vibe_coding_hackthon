'use client';

import { useCart } from '@/store/cart';
import { useEffect, useState, useRef } from 'react';

export default function StickyCartBar() {
  const { totalItems, totalPrice, toggleCart } = useCart();
  const [visible, setVisible] = useState(false);
  const [countBounce, setCountBounce] = useState(false);
  const prevTotal = useRef(totalItems);

  useEffect(() => {
    if (totalItems > 0 && !visible) {
      setTimeout(() => setVisible(true), 100);
    } else if (totalItems === 0) {
      setVisible(false);
    }
  }, [totalItems, visible]);

  useEffect(() => {
    if (totalItems !== prevTotal.current && totalItems > 0) {
      setCountBounce(true);
      setTimeout(() => setCountBounce(false), 300);
    }
    prevTotal.current = totalItems;
  }, [totalItems]);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-3 safe-bottom pointer-events-none">
      <button
        onClick={() => toggleCart(true)}
        className={`w-full pointer-events-auto rounded-2xl px-5 h-[56px] flex items-center justify-between transition-all duration-500 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, #1c1c1e 0%, #2d2d30 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(255,255,255,0.08) inset',
          transitionTimingFunction: 'var(--ease-spring)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className={`badge text-white ${
              countBounce ? 'anim-count-pop' : ''
            }`}
            style={{ background: 'rgba(255,255,255,0.18)' }}
          >
            {totalItems}
          </span>
          <span className="text-white font-semibold text-[15px]">View cart</span>
        </div>
        <span className="text-white font-bold text-[17px] tracking-tight">€{totalPrice.toFixed(2)}</span>
      </button>
    </div>
  );
}
