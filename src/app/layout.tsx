import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/store/cart';

export const metadata: Metadata = {
  title: 'YachtDrop — Marine Supplies Delivered',
  description: 'Order boat parts and supplies for delivery directly to your boat in the marina.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'YachtDrop',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased overscroll-none" suppressHydrationWarning>
        <CartProvider>
          <main className="min-h-svh">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
