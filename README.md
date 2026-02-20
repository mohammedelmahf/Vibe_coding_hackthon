# YachtDrop

Marine supplies delivered directly to your boat. A modern PWA built for sailors and marina staff to browse, search, and order boat parts and accessories with same-day delivery to 12+ marinas.

## Features

- **Product Catalog** — Browse featured products or filter by category with infinite scroll
- **Search** — Instant full-text search with quick-search chips
- **Cart** — Drag-to-dismiss bottom sheet, swipe-to-delete items, quantity stepper
- **Checkout** — 3-step flow with boat delivery or marina pickup, multiple payment methods (card, Apple Pay, Google Pay, PayPal)
- **PWA** — Installable, standalone mode, safe-area support for notched devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript 5 |
| Data | Server-side scraping with Cheerio |
| State | React Context + useReducer, localStorage persistence |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Home — catalog grid
│   ├── checkout/page.tsx # 3-step checkout flow
│   ├── api/products/     # Product scraping endpoint
│   └── api/search/       # Search endpoint
├── components/
│   ├── Header.tsx        # Sticky header with greeting
│   ├── ProductCard.tsx   # Card with inline qty stepper
│   ├── CartDrawer.tsx    # Bottom-sheet cart
│   ├── SearchPanel.tsx   # Full-screen search overlay
│   ├── CategoryScroller.tsx
│   ├── DeliveryBanner.tsx
│   ├── StickyCartBar.tsx
│   ├── Toast.tsx
│   └── SkeletonGrid.tsx
├── store/cart.tsx        # Cart state management
└── lib/
    ├── types.ts          # TypeScript interfaces
    └── scraper.ts        # Product data scraper
```

## License

ISC
