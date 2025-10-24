'use client';

import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Car, Github, Twitter, Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">AutoToken</h3>
            </div>

            <p className="text-gray-400 text-sm">
              The world's first gas-free marketplace for tokenized cars.
              Built on Linea zkEVM and Status Network.
            </p>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                Gas-Free
              </Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                EIP-2771
              </Badge>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Marketplace
              </Link>
              <Link href="/mint" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Mint Car NFT
              </Link>
              <Link href="/profile" className="block text-gray-400 hover:text-white text-sm transition-colors">
                My Profile
              </Link>
              <Link href="/cars/search" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Search Cars
              </Link>
            </div>
          </div>

          {/* Technology */}
          <div>
            <h4 className="font-semibold mb-4">Technology</h4>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Linea zkEVM</div>
              <div className="text-gray-400 text-sm">Status Network</div>
              <div className="text-gray-400 text-sm">EIP-2771 Meta-Tx</div>
              <div className="text-gray-400 text-sm">IPFS Storage</div>
              <div className="text-gray-400 text-sm">OpenZeppelin</div>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <div className="space-y-2">
              <a
                href="https://github.com/autotoken"
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://twitter.com/autotoken"
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </a>
              <a
                href="https://docs.autotoken.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="w-4 h-4" />
                Documentation
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AutoToken. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/help" className="hover:text-white transition-colors">
              Help
            </Link>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-400">
            Made with <Heart className="w-4 h-4 text-red-500" /> for the future of mobility
          </div>
        </div>
      </div>
    </footer>
  );
}
