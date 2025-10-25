'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { Car, Github, Twitter, Globe, Shield, Zap, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/logo.png" 
                  alt="VeriDex Logo" 
                  fill
                  className="object-contain p-1 bg-white"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  VeriDex
                </h3>
                <p className="text-xs text-gray-500 font-medium tracking-wide">
                  DECENTRALIZED EXCHANGE
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Decentralized marketplace for Real World Assets (RWA). 
              Built on Linea zkEVM with gas-free transactions and verified value.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-accent-900/50 text-accent-300 border border-accent-700 font-medium px-3 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
              <Badge className="bg-primary-900/50 text-primary-300 border border-primary-700 font-medium px-3 py-1">
                <Zap className="w-3 h-3 mr-1" />
                Gas-Free
              </Badge>
              <Badge className="bg-gray-800 text-gray-300 border border-gray-700 font-medium px-3 py-1">
                EIP-2771
              </Badge>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wide">Platform</h4>
            <div className="space-y-3">
              <Link href="/" className="block text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Asset Registry
              </Link>
              <Link href="/mint" className="block text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Tokenize Asset
              </Link>
              <Link href="/profile" className="block text-gray-400 hover:text-primary-400 text-sm transition-colors">
                My Portfolio
              </Link>
              <Link href="/marketplace" className="block text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Marketplace
              </Link>
            </div>
          </div>

          {/* Technology */}
          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wide">Technology</h4>
            <div className="space-y-3 text-sm">
              <div className="text-gray-400 flex items-center gap-2">
                <Shield className="w-3 h-3 text-primary-400" />
                Linea zkEVM
              </div>
              <div className="text-gray-400 flex items-center gap-2">
                <Zap className="w-3 h-3 text-accent-400" />
                EIP-2771 Meta-Tx
              </div>
              <div className="text-gray-400">IPFS Storage</div>
              <div className="text-gray-400">OpenZeppelin</div>
              <div className="text-gray-400">Pinata Gateway</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} VeriDex. All rights reserved.
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                Privacy
              </Link>
              <span className="text-gray-700">|</span>
              <Link href="/terms" className="hover:text-primary-400 transition-colors">
                Terms
              </Link>
              <span className="text-gray-700">|</span>
              <Link href="/help" className="hover:text-primary-400 transition-colors">
                Help
              </Link>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500">
              Built with <Shield className="w-3 h-3 text-primary-400" /> by the community
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

