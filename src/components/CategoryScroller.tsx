'use client';

import { Category } from '@/lib/types';
import { useRef, useEffect, useState } from 'react';

export default function CategoryScroller({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (slug: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Stagger reveal
    requestAnimationFrame(() => setShow(true));
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
    if (active) {
      const container = scrollRef.current;
      const scrollLeft = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const allItems = [
    { id: '__featured', name: 'Featured', slug: '' },
    ...categories,
  ];

  return (
    <div
      className={`bg-white border-b border-[var(--c-border)] transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        ref={scrollRef}
        className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar"
      >
        {allItems.map(item => {
          const isActive = item.slug === '' ? !activeCategory : activeCategory === item.slug;
          return (
            <button
              key={item.id}
              data-active={isActive || undefined}
              onClick={() => onSelect(item.slug)}
              className={`flex-shrink-0 px-4 h-[34px] rounded-full text-[13px] font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[var(--c-text)] text-white'
                  : 'text-[var(--c-text-secondary)] active:bg-[var(--c-fill)] bg-[var(--c-fill)]'
              }`}
              style={isActive ? { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' } : {}}
            >
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/60" />}
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
