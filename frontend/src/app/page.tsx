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
      console.log('🚗 Total listings:', Array.isArray(response?.data) ? response.data.length : 0);
      return response;
    },
    enabled: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      <div className="bg-gradient-to-br from-gray-50 via-primary-50/20 to-accent-50/20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-800 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
            Decentralized Exchange · Verified Value
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Tokenize Real Assets, Own Your Digital Future
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Transform physical assets into blockchain tokens. Transparent ownership, immutable records, zero gas fees.
          </p>

          <div className="flex justify-center gap-12 mb-10">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">{totalListings}</div>
              <div className="text-sm text-gray-600 font-medium mt-1">Tokenized Assets</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-accent-600 to-accent-800 bg-clip-text text-transparent">0 ETH</div>
              <div className="text-sm text-gray-600 font-medium mt-1">Gas Fees</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">100%</div>
              <div className="text-sm text-gray-600 font-medium mt-1">On-Chain Verified</div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/mint">
              <Button size="lg" className="text-base px-8 py-6 h-auto gradient-mixed text-white shadow-primary hover:shadow-xl">
                <Plus className="w-5 h-5 mr-2" /> Tokenize Your Asset
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 h-auto">
              Explore Registry
            </Button>
          </div>
        </div>

        {/* Asset Registry */}
        <Card className="mb-8 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary-50/50 to-accent-50/50 border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-xl">
              <Filter className="w-5 h-5 text-primary-600" />
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

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>

              <Badge variant="secondary" className="text-sm px-4 py-1.5">
                Showing {listings.length} assets
              </Badge>
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