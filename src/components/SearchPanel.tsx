'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';

const QUICK_SEARCHES = ['Rope', 'Anchor', 'Paint', 'GPS', 'Fender', 'LED Light', 'Lifejacket', 'Epoxy'];

export default function SearchPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      document.body.style.overflow = '';
      setQuery(''); setResults([]); setSearched(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 350);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[var(--c-bg)]" style={{ animation: 'fade-in 0.2s ease' }}>
      {/* iOS-style search bar with Cancel */}
      <div className="bg-white px-4 pt-2 pb-2 safe-top border-b border-[var(--c-border)]">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => handleInput(e.target.value)}
              placeholder="Search products..."
              className="input-field !pl-9 !pr-9 !h-[38px] !rounded-xl !text-[15px] !bg-[var(--c-fill)]"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-[var(--c-text-muted)] flex items-center justify-center"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--c-accent)] text-[16px] font-medium flex-shrink-0 active:opacity-60 transition-opacity"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100svh-56px)] overflow-y-auto momentum-scroll pb-20">
        {loading && (
          <div className="flex justify-center py-12">
            <span className="loading-spinner" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--c-text-muted)]">
            <div className="w-14 h-14 rounded-full bg-[var(--c-fill)] flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p className="text-[16px] font-semibold text-[var(--c-text)]">
              No results for &ldquo;{query}&rdquo;
            </p>
            <p className="text-[14px] mt-1">Try a different search term</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="p-4">
            <p className="text-[13px] text-[var(--c-text-muted)] mb-3 font-semibold uppercase tracking-wider">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 gap-3.5">
              {results.map((product, i) => (
                <div key={product.id} className="anim-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !searched && (
          <div className="p-4">
            <p className="text-[13px] text-[var(--c-text-muted)] mb-3 font-semibold uppercase tracking-wider">
              Quick search
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map(term => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); doSearch(term); }}
                  className="px-4 h-[36px] bg-white rounded-full text-[14px] text-[var(--c-text)] font-medium active:scale-95 transition-transform flex items-center gap-1.5"
                  style={{ transitionTimingFunction: 'var(--ease-spring)', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
