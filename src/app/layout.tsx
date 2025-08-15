import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import '@/styles/globals.css';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'PhotoMemory AI - Transform Photos into Stunning Videos',
    template: '%s | PhotoMemory AI',
  },
  description:
    'Create beautiful, AI-generated videos from your photos with PhotoMemory AI. Transform your memories into cinematic experiences with just a few clicks.',
  keywords: [
    'AI video generation',
    'photo to video',
    'memory video',
    'photo slideshow',
    'AI video maker',
    'photo memories',
    'video creation',
  ],
  authors: [{ name: 'PhotoMemory AI Team' }],
  creator: 'PhotoMemory AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://photomemory-ai.vercel.app',
    title: 'PhotoMemory AI - Transform Photos into Stunning Videos',
    description:
      'Create beautiful, AI-generated videos from your photos with PhotoMemory AI.',
    siteName: 'PhotoMemory AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PhotoMemory AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhotoMemory AI - Transform Photos into Stunning Videos',
    description:
      'Create beautiful, AI-generated videos from your photos with PhotoMemory AI.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-dark-bg text-text-primary antialiased" suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}