'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Category } from '@/lib/types';
import Header from '@/components/Header';
import SearchPanel from '@/components/SearchPanel';
import CategoryScroller from '@/components/CategoryScroller';
import ProductCard from '@/components/ProductCard';
import SkeletonGrid from '@/components/SkeletonGrid';
import CartDrawer from '@/components/CartDrawer';
import StickyCartBar from '@/components/StickyCartBar';
import Toast from '@/components/Toast';
import DeliveryBanner from '@/components/DeliveryBanner';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    fetchProducts(null, 1, true);
  }, []);

  const fetchProducts = async (categorySlug: string | null, pageNum: number, reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (reset) {
      setLoading(true);
      setProducts([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const url = !categorySlug
        ? '/api/products?featured=true'
        : `/api/products?category=${categorySlug}&page=${pageNum}`;

      const res = await fetch(url);
      const data = await res.json();
      const newProducts = data.products || [];

      if (reset) {
        setProducts(newProducts);
        setCategories(data.categories || categories);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Fetch failed:', err);
    }

    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
    loadingRef.current = false;
  };

  const handleCategoryChange = (slug: string) => {
    const next = slug || null;
    setActiveCategory(next);
    setPage(1);
    fetchProducts(next, 1, true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(activeCategory, 1, true);
  };

  const loadMore = useCallback(() => {
    if (page < totalPages && activeCategory && !loadingRef.current) {
      const next = page + 1;
      setPage(next);
      fetchProducts(activeCategory, next, false);
    }
  }, [page, totalPages, activeCategory]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const sectionTitle = activeCategory
    ? categories.find(c => c.slug === activeCategory)?.name || 'Products'
    : 'Popular right now';

  return (
    <div className="min-h-svh bg-[var(--c-bg)] pb-24">
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchPanel isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
      <Toast />

      <DeliveryBanner />

      <div className="mt-2">
        <CategoryScroller
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategoryChange}
        />
      </div>

      {/* Section header */}
      <div className="px-4 mt-5 mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--c-text)] leading-tight tracking-tight">
            {sectionTitle}
          </h2>
          {!activeCategory && !loading && products.length > 0 && (
            <p className="text-[13px] text-[var(--c-text-muted)] mt-0.5">Curated for your voyage</p>
          )}
          {activeCategory && !loading && products.length > 0 && (
            <p className="text-[13px] text-[var(--c-text-muted)] mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        {!loading && products.length > 0 && (
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-1.5 text-[13px] font-semibold text-[var(--c-accent)] active:opacity-60 transition-opacity ${
              refreshing ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            {refreshing ? (
              <span className="loading-spinner inline-block" style={{ width: 14, height: 14 }} />
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                Refresh
              </>
            )}
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[var(--c-fill)] flex items-center justify-center mb-4 anim-float">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="font-bold text-[var(--c-text)] text-[17px]">Nothing here yet</p>
          <p className="text-[14px] text-[var(--c-text-muted)] mt-1 max-w-[200px]">Try browsing another category or use search</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 px-4">
          {products.map((product, i) => (
            <div
              key={`${product.id}-${i}`}
              className="anim-fade-in"
              style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Infinite scroll */}
      {activeCategory && page < totalPages && (
        <div ref={observerRef} className="py-8 flex justify-center">
          {loadingMore && <span className="loading-spinner" />}
        </div>
      )}

      <StickyCartBar />
    </div>
  );
}
