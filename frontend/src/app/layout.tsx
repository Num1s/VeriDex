import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AutoToken - Gas-Free Car Tokenization',
  description: 'Tokenize your car as an NFT with zero gas fees using Status Network and Linea zkEVM',
  keywords: ['blockchain', 'NFT', 'automotive', 'cars', 'tokenization', 'gasless', 'ethereum'],
  authors: [{ name: 'AutoToken Team' }],
  creator: 'AutoToken',
  publisher: 'AutoToken',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'AutoToken - Gas-Free Car Tokenization',
    description: 'Tokenize your car as an NFT with zero gas fees using Status Network and Linea zkEVM',
    url: '/',
    siteName: 'AutoToken',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AutoToken - Gas-Free Car Tokenization',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoToken - Gas-Free Car Tokenization',
    description: 'Tokenize your car as an NFT with zero gas fees using Status Network and Linea zkEVM',
    images: ['/og-image.jpg'],
    creator: '@autotoken',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}