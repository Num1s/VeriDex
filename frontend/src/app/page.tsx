'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketplaceAPI } from '../services/api';
import CarCard from '../components/CarCard';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    year: '',
    minPrice: '',
    maxPrice: '',
    verificationStatus: '',
    limit: 20,
    offset: 0,
  });

  // Fetch active listings
  const { data: listingsResponse, isLoading, refetch } = useQuery({
    queryKey: ['active-listings', filters],
    queryFn: async () => {
      console.log('🔍 Fetching listings with filters:', filters);
      const response = await marketplaceAPI.getListings(filters);
      console.log('📦 Listings API response:', response);
      console.log('🚗 Total listings:', response?.data?.length || 0);
      return response;
    },
    enabled: true,
  });

  // Extract data from response (axios wraps it in .data)
  const listings = Array.isArray(listingsResponse?.data?.data) 
    ? listingsResponse.data.data 
    : (Array.isArray(listingsResponse?.data) ? listingsResponse.data : []);
  const totalListings = Array.isArray(listings) ? listings.length : 0;
  
  console.log('📊 Rendered listings count:', listings.length);
  console.log('📋 Listings array:', listings);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value,
      offset: 0, // Reset pagination
    }));
  };

  const clearFilters = () => {
    setFilters({
      make: '',
      model: '',
      year: '',
      minPrice: '',
      maxPrice: '',
      verificationStatus: '',
      limit: 20,
      offset: 0,
    });
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-4">
            🌐 Real-World Assets Hub
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tokenize Real Assets, Own Your Digital Future
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Transform physical assets into blockchain tokens. Transparent ownership, immutable records, zero gas fees.
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalListings}</div>
              <div className="text-sm text-gray-500">Tokenized Assets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0 ETH</div>
              <div className="text-sm text-gray-500">Gas Fees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-500">On-Chain Verified</div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/mint">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-5 h-5 mr-2" /> Tokenize Asset
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-purple-600 text-purple-700 hover:bg-purple-50 font-semibold shadow-md">
              Explore Registry
            </Button>
          </div>
        </div>

        {/* Asset Registry */}
        <Card className="mb-8 shadow-xl border-2 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Filter className="w-5 h-5 text-purple-600" />
              Asset Registry Filters
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Make</label>
                <Input
                  placeholder="e.g., Toyota"
                  value={filters.make}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <Input
                  placeholder="e.g., Camry"
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Input
                  type="number"
                  placeholder="e.g., 2020"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Verification</label>
                <Select
                  value={filters.verificationStatus}
                  onValueChange={(value) => handleFilterChange('verificationStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All cars" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cars</SelectItem>
                    <SelectItem value="approved">Verified only</SelectItem>
                    <SelectItem value="pending">Pending verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters} className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold">
                  Clear Filters
                </Button>
              </div>

              <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                Showing {listings.length} assets
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading cars...</p>
          </div>
        )}

        {/* Cars grid */}
        {!isLoading && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                showOwner={false}
                showPrice={true}
                compact={false}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && listings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No cars found
            </h3>
            <p className="text-gray-500 mb-6">
              {Object.values(filters).some(v => v) ?
                'Try adjusting your filters to see more results.' :
                'Be the first to list a car on AutoToken!'
              }
            </p>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>

              <Link href="/mint">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Mint Your Car
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Load more */}
        {listings.length >= filters.limit && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setFilters(prev => ({
                ...prev,
                offset: prev.offset + prev.limit,
              }))}
            >
              Load More Cars
            </Button>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
}