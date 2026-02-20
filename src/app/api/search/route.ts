import { NextRequest, NextResponse } from 'next/server';
import { scrapeSearch } from '@/lib/scraper';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await scrapeSearch(query);
    return NextResponse.json({ products }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
