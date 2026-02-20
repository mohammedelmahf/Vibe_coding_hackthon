import { NextRequest, NextResponse } from 'next/server';
import { scrapeProducts, scrapeHomepage, getCategories } from '@/lib/scraper';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const featured = searchParams.get('featured');

  try {
    if (featured === 'true') {
      const data = await scrapeHomepage();
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
      });
    }

    if (!categorySlug) {
      return NextResponse.json({ categories: getCategories() });
    }

    const categories = getCategories();
    const category = categories.find(c => c.slug === categorySlug);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const data = await scrapeProducts(category.url, page);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [], totalPages: 0 },
      { status: 500 }
    );
  }
}
