'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/store/cart';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Header({ onSearchOpen }: { onSearchOpen: () => void }) {
  const { totalItems, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [prevTotal, setPrevTotal] = useState(totalItems);
  const [badgeBounce, setBadgeBounce] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (totalItems > prevTotal) {
      setBadgeBounce(true);
      setTimeout(() => setBadgeBounce(false), 300);
    }
    setPrevTotal(totalItems);
  }, [totalItems, prevTotal]);

  return (
    <header
      className={`sticky top-0 z-50 safe-top transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-[var(--c-border)] shadow-sm'
          : 'bg-white'
      }`}
    >
      {/* Main bar */}
      <div className="flex items-center justify-between px-4 h-[48px]">
        <div className="flex items-center gap-2.5">
          <div className="w-[32px] h-[32px] rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007aff, #5856d6)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 18l3-12h10l3 12" />
              <path d="M2 18h20" />
              <path d="M12 6V2" />
              <path d="M12 2l5 4" />
            </svg>
          </div>
          <span className="text-[18px] font-extrabold tracking-tight text-[var(--c-text)]">
            yacht<span className="bg-gradient-to-r from-[var(--c-accent)] to-[#5856d6] bg-clip-text text-transparent">drop</span>
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={onSearchOpen}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[var(--c-text-secondary)] active:bg-[var(--c-fill)] transition-colors"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          <button
            onClick={() => toggleCart(true)}
            className="relative w-[38px] h-[38px] rounded-full flex items-center justify-center text-[var(--c-text-secondary)] active:bg-[var(--c-fill)] transition-colors"
            aria-label="Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalItems > 0 && (
              <span
                className={`badge absolute -top-0.5 -right-0.5 bg-[var(--c-accent)] text-white shadow-sm ${
                  badgeBounce ? 'anim-count-pop' : ''
                }`}
                style={{ boxShadow: '0 2px 6px rgba(0,122,255,0.35)' }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Greeting row — only when not scrolled */}
      {!scrolled && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <p className="text-[13px] text-[var(--c-text-muted)]">
            {getGreeting()} <span className="text-[var(--c-text-secondary)] font-medium">· Palma de Mallorca</span>
          </p>
        </div>
      )}
    </header>
  );
}
