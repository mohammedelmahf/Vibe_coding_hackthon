import * as cheerio from 'cheerio';
import { Product, Category } from './types';

const BASE_URL = 'https://nautichandler.com/en';

// In-memory cache with TTL
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

async function fetchPage(url: string): Promise<string> {
  const cached = getCached<string>(`html:${url}`);
  if (cached) return cached;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    next: { revalidate: 300 }, // ISR: revalidate every 5 min
  });

  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  setCache(`html:${url}`, html);
  return html;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUrl($el: any, $: any): string {
  // Try multiple image source attributes - nautichandler uses lazy loading with data-original
  const img = $el.find('img').first();
  const src = img.attr('data-original') || img.attr('data-src') || img.attr('data-full-size-image-url') || img.attr('data-lazy-src') || '';

  // Fall back to src only if it's a real image (not SVG placeholder)
  const fallbackSrc = img.attr('src') || '';
  const finalSrc = src || (fallbackSrc.includes('data:image') ? '' : fallbackSrc);

  // Ensure absolute URL
  if (finalSrc.startsWith('//')) return `https:${finalSrc}`;
  if (finalSrc.startsWith('/')) return `https://nautichandler.com${finalSrc}`;
  if (finalSrc.startsWith('http')) return finalSrc;
  return finalSrc;
}

export async function scrapeProducts(categoryUrl: string, page = 1): Promise<{ products: Product[]; totalPages: number }> {
  const cacheKey = `products:${categoryUrl}:${page}`;
  const cached = getCached<{ products: Product[]; totalPages: number }>(cacheKey);
  if (cached) return cached;

  const url = page > 1 ? `${categoryUrl}?page=${page}` : categoryUrl;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const products: Product[] = [];

  // PrestaShop product miniature selectors
  $('article.product-miniature, .product-miniature, .js-product-miniature').each((_, el) => {
    const $el = $(el);
    const $link = $el.find('a.thumbnail, .product-thumbnail a, a').first();
    const productUrl = $link.attr('href') || '';
    const name = $el.find('.product-title a, h3 a, h2 a, .product-name a').first().text().trim()
      || $el.find('a[title]').first().attr('title')?.trim()
      || $link.attr('title')?.trim()
      || '';

    const image = extractImageUrl($el, $);

    // Extract prices
    const priceText = $el.find('.product-price-and-shipping .price, .price, [itemprop="price"]').first().text().trim();
    const regularPriceText = $el.find('.regular-price, .product-price-and-shipping .regular-price').first().text().trim();

    const price = parsePrice(priceText);
    const originalPrice = parsePrice(regularPriceText) || undefined;

    // Discount
    const discountText = $el.find('.discount-percentage, .discount-amount, .product-flag.discount').first().text().trim();
    const discount = parseDiscount(discountText);

    // Stock
    const stockEl = $el.find('.product-availability, .availability').first().text().trim();
    const stock = stockEl || 'In Stock';

    // ID from data attribute or URL
    const id = $el.attr('data-id-product') || extractIdFromUrl(productUrl);

    if (name && price > 0) {
      products.push({
        id,
        name,
        price,
        originalPrice,
        discount,
        image,
        url: productUrl,
        stock,
      });
    }
  });

  // If the miniature selector didn't work, try a more general approach
  if (products.length === 0) {
    // Try parsing product links from the page
    $('a[href*=".html"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      if (!href.includes('.html') || href.includes('content/')) return;

      const $parent = $el.closest('.product-miniature, .product-container, [class*="product"]');
      if ($parent.length === 0) return;

      const name = $el.attr('title')?.trim() || $el.text().trim();
      if (!name || name.length < 3) return;

      const image = extractImageUrl($parent, $);
      const priceText = $parent.find('.price').first().text().trim();
      const price = parsePrice(priceText);
      const regularPriceText = $parent.find('.regular-price').first().text().trim();

      const id = extractIdFromUrl(href);

      if (name && price > 0 && !products.find(p => p.id === id)) {
        products.push({
          id,
          name,
          price,
          originalPrice: parsePrice(regularPriceText) || undefined,
          image,
          url: href,
          stock: 'In Stock',
        });
      }
    });
  }

  // Extract total pages
  let totalPages = 1;
  $('nav.pagination .page-list a, .pagination a').each((_, el) => {
    const pageNum = parseInt($(el).text().trim(), 10);
    if (!isNaN(pageNum) && pageNum > totalPages) {
      totalPages = pageNum;
    }
  });

  const result = { products, totalPages };
  setCache(cacheKey, result);
  return result;
}

export async function scrapeHomepage(): Promise<{ products: Product[]; categories: Category[] }> {
  const cached = getCached<{ products: Product[]; categories: Category[] }>('homepage');
  if (cached) return cached;

  const html = await fetchPage(BASE_URL);
  const $ = cheerio.load(html);
  const products: Product[] = [];

  // Extract featured/best seller products
  $('article.product-miniature, .product-miniature').each((_, el) => {
    const $el = $(el);
    const $link = $el.find('a').first();
    const productUrl = $link.attr('href') || '';
    const name = $el.find('.product-title a, h3 a, h5 a, h2 a').first().text().trim()
      || $link.attr('title')?.trim()
      || '';

    const image = extractImageUrl($el, $);
    const priceText = $el.find('.price').first().text().trim();
    const regularPriceText = $el.find('.regular-price').first().text().trim();
    const price = parsePrice(priceText);
    const discountText = $el.find('.discount-percentage, .discount-amount').first().text().trim();

    const id = $el.attr('data-id-product') || extractIdFromUrl(productUrl);

    if (name && price > 0) {
      products.push({
        id,
        name,
        price,
        originalPrice: parsePrice(regularPriceText) || undefined,
        discount: parseDiscount(discountText),
        image,
        url: productUrl,
        stock: $el.find('.product-availability').text().trim() || 'In Stock',
      });
    }
  });

  const result = {
    products,
    categories: getCategories(),
  };
  setCache('homepage', result);
  return result;
}

export async function scrapeSearch(query: string): Promise<Product[]> {
  const cacheKey = `search:${query}`;
  const cached = getCached<Product[]>(cacheKey);
  if (cached) return cached;

  const lowerQuery = query.toLowerCase();

  // First, try to search by scraping multiple categories in parallel
  // and filtering by the query term
  const categories = getCategories();

  // Determine which categories might be relevant based on keywords
  const categoryKeywords: Record<string, string[]> = {
    'anchoring-docking': ['anchor', 'dock', 'fender', 'mooring', 'cleat', 'chain', 'shackle'],
    'electrics-lighting': ['light', 'led', 'lamp', 'wire', 'cable', 'electric', 'bulb', 'switch', 'battery'],
    'electronics': ['gps', 'radar', 'chart', 'plotter', 'vhf', 'radio', 'instrument', 'display', 'sensor'],
    'fitting': ['fitting', 'hinge', 'latch', 'handle', 'rail', 'stanchion', 'pulpit'],
    'life-on-board': ['galley', 'kitchen', 'cabin', 'cushion', 'mattress', 'table', 'chair', 'grill'],
    'maintenance-cleaning': ['clean', 'polish', 'wax', 'wash', 'soap', 'teak', 'oil', 'grease', 'degreaser'],
    'motor': ['motor', 'engine', 'propeller', 'impeller', 'fuel', 'filter', 'oil', 'outboard'],
    'navigation': ['compass', 'binocular', 'flag', 'chart', 'map', 'navigation'],
    'painting': ['paint', 'antifouling', 'primer', 'varnish', 'brush', 'roller', 'epoxy', 'gelcoat', 'awlgrip'],
    'plumbing': ['pump', 'hose', 'valve', 'pipe', 'fitting', 'water', 'toilet', 'plumbing'],
    'ropes': ['rope', 'line', 'cord', 'braid', 'splice', 'halyard', 'sheet'],
    'safety': ['lifejacket', 'life jacket', 'flare', 'fire', 'extinguisher', 'safety', 'harness', 'buoy', 'raft'],
    'screws': ['screw', 'bolt', 'nut', 'washer', 'rivet', 'stainless'],
    'tools-machines': ['tool', 'drill', 'saw', 'wrench', 'screwdriver', 'sander', 'festool', 'machine'],
    'personal-equipment': ['clothing', 'shoe', 'boot', 'jacket', 'glove', 'hat', 'sunglasses', 'gear'],
    'inflatables': ['inflatable', 'dinghy', 'kayak', 'paddleboard', 'toy', 'tube'],
  };

  // Find matching categories or search all popular ones
  const matchingCategorySlugs: string[] = [];
  for (const [slug, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => lowerQuery.includes(kw) || kw.includes(lowerQuery))) {
      matchingCategorySlugs.push(slug);
    }
  }

  // If no match, scrape a few popular categories
  const slugsToSearch = matchingCategorySlugs.length > 0
    ? matchingCategorySlugs.slice(0, 3)
    : ['maintenance-cleaning', 'safety', 'anchoring-docking'];

  // Scrape in parallel
  const results = await Promise.allSettled(
    slugsToSearch.map(slug => {
      const cat = categories.find(c => c.slug === slug);
      if (!cat) return Promise.resolve({ products: [], totalPages: 0 });
      return scrapeProducts(cat.url, 1);
    })
  );

  // Combine all products
  let allProducts: Product[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allProducts = allProducts.concat(result.value.products);
    }
  }

  // Also include any homepage products
  try {
    const homepage = await scrapeHomepage();
    allProducts = allProducts.concat(homepage.products);
  } catch {}

  // Deduplicate by ID
  const seen = new Set<string>();
  const unique: Product[] = [];
  for (const p of allProducts) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      unique.push(p);
    }
  }

  // Filter by query
  const products = unique.filter(p =>
    p.name.toLowerCase().includes(lowerQuery)
  );

  setCache(cacheKey, products);
  return products;
}

export async function scrapeProductDetail(productUrl: string): Promise<Product | null> {
  const cacheKey = `detail:${productUrl}`;
  const cached = getCached<Product>(cacheKey);
  if (cached) return cached;

  const html = await fetchPage(productUrl);
  const $ = cheerio.load(html);

  const name = $('h1[itemprop="name"], h1.product-detail-name, h1').first().text().trim();
  const priceText = $('[itemprop="price"], .current-price .price, .product-price').first().text().trim();
  const price = parsePrice(priceText);
  const regularPriceText = $('.regular-price').text().trim();
  const description = $('[itemprop="description"], .product-description, #description .product-description').first().text().trim();
  const image = $('img.js-qv-product-cover, .product-cover img, .product-images img').first().attr('src')
    || $('img.js-qv-product-cover, .product-cover img').first().attr('data-src') || '';
  const stock = $('.product-availability').text().trim() || 'In Stock';

  if (!name) return null;

  const product: Product = {
    id: extractIdFromUrl(productUrl),
    name,
    price,
    originalPrice: parsePrice(regularPriceText) || undefined,
    image: image.startsWith('//') ? `https:${image}` : image,
    url: productUrl,
    stock,
    description,
  };

  setCache(cacheKey, product);
  return product;
}

function parsePrice(text: string): number {
  if (!text) return 0;
  // Handle €XX.XX or XX,XX € formats
  const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
  // If there are multiple dots, keep only the last as decimal
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    const decimal = parts.pop();
    return parseFloat(parts.join('') + '.' + decimal) || 0;
  }
  return parseFloat(cleaned) || 0;
}

function parseDiscount(text: string): number | undefined {
  const match = text.match(/-?(\d+)%/);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractIdFromUrl(url: string): string {
  const match = url.match(/\/(\d+)-/);
  return match ? match[1] : Math.random().toString(36).slice(2, 8);
}

export function getCategories(): Category[] {
  return [
    { id: '100799', name: 'Anchoring & Docking', slug: 'anchoring-docking', url: `${BASE_URL}/100799-anchoring-docking`, icon: '⚓' },
    { id: '100392', name: 'Electrics & Lighting', slug: 'electrics-lighting', url: `${BASE_URL}/100392-electricslighting`, icon: '💡' },
    { id: '190', name: 'Electronics', slug: 'electronics', url: `${BASE_URL}/190-electronics`, icon: '📡' },
    { id: '100396', name: 'Fitting', slug: 'fitting', url: `${BASE_URL}/100396-fitting`, icon: '🔧' },
    { id: '197', name: 'Life on Board', slug: 'life-on-board', url: `${BASE_URL}/197-life-on-board`, icon: '🚢' },
    { id: '100669', name: 'Maintenance', slug: 'maintenance-cleaning', url: `${BASE_URL}/100669-maintenance-cleaning-products`, icon: '🧹' },
    { id: '100393', name: 'Motor', slug: 'motor', url: `${BASE_URL}/100393-motor`, icon: '⚙️' },
    { id: '100329', name: 'Navigation', slug: 'navigation', url: `${BASE_URL}/100329-navigation`, icon: '🧭' },
    { id: '100390', name: 'Painting', slug: 'painting', url: `${BASE_URL}/100390-painting`, icon: '🎨' },
    { id: '100713', name: 'Plumbing', slug: 'plumbing', url: `${BASE_URL}/100713-plumbing`, icon: '🔩' },
    { id: '100395', name: 'Ropes', slug: 'ropes', url: `${BASE_URL}/100395-ropes`, icon: '🪢' },
    { id: '100389', name: 'Safety', slug: 'safety', url: `${BASE_URL}/100389-safety`, icon: '🦺' },
    { id: '100394', name: 'Screws', slug: 'screws', url: `${BASE_URL}/100394-screws`, icon: '🔩' },
    { id: '100391', name: 'Tools & Machines', slug: 'tools-machines', url: `${BASE_URL}/100391-tools-machines`, icon: '🛠️' },
    { id: '43', name: 'Clothing & Gear', slug: 'personal-equipment', url: `${BASE_URL}/43-personal-equipment`, icon: '👕' },
    { id: '100911', name: 'Inflatables & Toys', slug: 'inflatables', url: `${BASE_URL}/100911-inflatablewater-toys`, icon: '🏖️' },
  ];
}
