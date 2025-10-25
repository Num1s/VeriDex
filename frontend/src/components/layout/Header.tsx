'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  X
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useWalletAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Asset Registry', href: '/', icon: Car },
    { name: 'Tokenize', href: '/mint', icon: Plus },
    ...(isAuthenticated ? [{ name: 'My Assets', href: '/profile', icon: User }] : []),
    ...(isAdmin ? [{ name: 'Verification', href: '/admin/verify', icon: Shield }] : []),
  ];

  return (
    <header className="bg-gradient-to-r from-purple-700 to-blue-700 shadow-lg border-b border-purple-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="text-purple-700 font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Veridex</h1>
                <p className="text-xs text-purple-200 -mt-1">RWA Hub</p>
              </div>
            </Link>
            <Badge className="hidden sm:inline-flex bg-green-500 text-white border-none font-semibold">
              ⚡ Gas-Free
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-purple-700 shadow-md'
                      : 'text-white hover:bg-white/20 hover:shadow-md'
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
              className="text-white hover:bg-white/20"
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
          <div className="md:hidden border-t border-purple-500 bg-purple-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-purple-700 shadow-md'
                        : 'text-white hover:bg-white/20'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Wallet Connect */}
              <div className="pt-4 border-t">
                <WalletConnect variant="compact" />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

