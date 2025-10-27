'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import WalletConnect from '../WalletConnect';
import { useWalletAuth } from '../../hooks/useWalletAuth';
import {
  Car,
  Plus,
  User,
  ShoppingBag,
  Shield,
  Menu,
  X,
  Zap,
  Play
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useWalletAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Asset Registry', href: '/', icon: Car },
    { name: 'Tokenize', href: '/mint', icon: Plus },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Simulation', href: '/simulation', icon: Play },
    ...(isAuthenticated ? [{ name: 'My Assets', href: '/profile', icon: User }] : []),
    ...(isAdmin ? [{ name: 'Verification', href: '/admin/verify', icon: Shield }] : []),
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                <Image 
                  src="/logo.png" 
                  alt="VeriDex Logo" 
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  VeriDex
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide -mt-1">
                  DECENTRALIZED EXCHANGE
                </p>
              </div>
            </Link>
            <Badge className="hidden sm:inline-flex bg-accent-100 text-accent-700 border border-accent-300 font-semibold px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Gas-Free
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-primary'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Wallet Connect */}
          <div className="hidden md:block">
            <WalletConnect />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-gray-50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Wallet Connect */}
              <div className="pt-4 border-t border-gray-300">
                <WalletConnect variant="compact" />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

