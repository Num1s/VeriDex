'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketplaceAPI } from '../../services/api';
import Layout from '../../components/layout/Layout';
import ListingTable from '../../components/ListingTable';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useWalletAuth } from '../../hooks/useWalletAuth';
import { useGasless } from '../../hooks/useGasless';
import { useToast } from '../../hooks/useToast';
import { formatPrice } from '../../utils/formatters';
import { ShoppingBag, TrendingUp, DollarSign, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MarketplacePage() {
  const { isAuthenticated } = useWalletAuth();
  const { purchaseCar } = useGasless();
  const { toast } = useToast();

  // Fetch marketplace data
  const { data: listingsResponse, isLoading: listingsLoading } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: () => marketplaceAPI.getListings(),
    enabled: true,
  });

  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['marketplace-stats'],
    queryFn: () => marketplaceAPI.getStats(),
    enabled: true,
  });

  const listings = (listingsResponse?.data as unknown as any[]) || [];
  const stats = (statsResponse?.data as unknown as any) || {};

  const handlePurchase = async (listing: any) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please connect your wallet to purchase cars',
        variant: 'destructive',
      });
      return;
    }

    try {
      const useEscrow = confirm(
        'Use escrow for this purchase?\n\nEscrow provides additional security for high-value transactions.'
      );

      await purchaseCar({
        listingId: listing.listingId.toString(),
        price: listing.price,
        useEscrow,
      });
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Car Marketplace
            </h1>
            <p className="text-lg text-gray-600">
              Buy and sell verified cars with zero gas fees
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{stats.totalListings || 0}</div>
                <div className="text-sm text-gray-600">Total Listings</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{stats.activeListings || 0}</div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">
                  {stats.totalVolume ? formatPrice(stats.totalVolume) : '0 ETH'}
                </div>
                <div className="text-sm text-gray-600">Total Volume</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{stats.sellThroughRate || 0}%</div>
                <div className="text-sm text-gray-600">Sell-Through Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Active Listings */}
          <div className="mb-8">
            <ListingTable
              listings={listings}
              showActions={true}
              onPurchase={handlePurchase}
              isLoading={listingsLoading}
            />
          </div>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How AutoToken Works</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Mint Your Car</h3>
                  <p className="text-sm text-gray-600">
                    Create an NFT representing your car with VIN verification
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Get Verified</h3>
                  <p className="text-sm text-gray-600">
                    Our team verifies your car's authenticity and details
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">List & Trade</h3>
                  <p className="text-sm text-gray-600">
                    List your verified car for sale or buy from others
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">4</span>
                  </div>
                  <h3 className="font-semibold mb-2">Trade Gas-Free</h3>
                  <p className="text-sm text-gray-600">
                    All transactions are gasless using meta-transactions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

