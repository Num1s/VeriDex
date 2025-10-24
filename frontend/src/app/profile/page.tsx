'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useWalletAuth } from '../../hooks/useWalletAuth';
import { useGasless } from '../../hooks/useGasless';
import { carsAPI, marketplaceAPI } from '../../services/api';
import CarCard from '../../components/CarCard';
import VerificationBadge from '../../components/VerificationBadge';
import { formatAddress, formatDate, formatPrice } from '../../utils/formatters';
import {
  Car,
  ShoppingBag,
  TrendingUp,
  User,
  Settings,
  Plus,
  Eye,
  Edit,
  Wallet,
  Calendar,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, address } = useWalletAuth();
  const { transactions } = useGasless();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user's cars
  const { data: carsResponse, isLoading: carsLoading } = useQuery({
    queryKey: ['user-cars'],
    queryFn: () => carsAPI.getUserCars(),
    enabled: isAuthenticated,
  });

  // Fetch user's listings
  const { data: listingsResponse, isLoading: listingsLoading } = useQuery({
    queryKey: ['user-listings'],
    queryFn: () => marketplaceAPI.getUserListings(),
    enabled: isAuthenticated,
  });

  const userCars = (carsResponse?.data as unknown as any[]) || [];
  const userListings = (listingsResponse?.data as unknown as any[]) || [];

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to view your profile.
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUserStats = () => {
    const totalCars = userCars.length;
    const verifiedCars = userCars.filter(car => car.verificationStatus === 'approved').length;
    const listedCars = userCars.filter(car => car.isListed).length;
    const activeListings = userListings.filter(listing => listing.status === 'active').length;

    return {
      totalCars,
      verifiedCars,
      listedCars,
      activeListings,
      reputationScore: user.reputationScore || 5.0,
    };
  };

  const stats = getUserStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/')}>
                ← Back to Marketplace
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/mint">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Mint Car
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.firstName?.[0] || user.lastName?.[0] || address?.[0]?.toUpperCase() || 'U'}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : formatAddress(address || '')
                    }
                  </h2>

                  <div className="flex items-center gap-2">
                    <VerificationBadge status={user.isVerified ? 'approved' : 'pending'} />
                    {user.kycStatus === 'approved' && (
                      <Badge variant="outline" className="text-green-600">
                        <Award className="w-3 h-3 mr-1" />
                        KYC Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Wallet className="w-4 h-4" />
                    {formatAddress(address || '')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Reputation: {stats.reputationScore}/5.0
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(user.createdAt || new Date(), { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/profile/edit">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Car className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stats.totalCars}</div>
              <div className="text-sm text-gray-600">Total Cars</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-green-600 bg-green-100 rounded-full flex items-center justify-center">
                ✓
              </div>
              <div className="text-2xl font-bold">{stats.verifiedCars}</div>
              <div className="text-sm text-gray-600">Verified Cars</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{stats.activeListings}</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">5.0</div>
              <div className="text-sm text-gray-600">Reputation</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cars">My Cars</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Cars */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Recent Cars
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {carsLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : userCars.length > 0 ? (
                    <div className="space-y-3">
                      {userCars.slice(0, 3).map((car) => (
                        <div key={car.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            🚗
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{car.make} {car.model}</div>
                            <div className="text-sm text-gray-600">{car.year}</div>
                          </div>
                          <VerificationBadge status={car.verificationStatus} size="sm" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No cars yet. <Link href="/mint" className="text-blue-600 hover:underline">Mint your first car!</Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.slice(0, 3).map((tx) => (
                        <div key={tx.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {tx.type === 'mint' ? '🏭' : tx.type === 'purchase' ? '🛒' : '📋'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium capitalize">{tx.type}</div>
                            <div className="text-sm text-gray-600">
                              {formatAddress(tx.contractAddress)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatDate(tx.createdAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No transactions yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  My Cars ({userCars.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {carsLoading ? (
                  <div className="text-center py-8">Loading cars...</div>
                ) : userCars.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userCars.map((car) => (
                      <CarCard
                        key={car.id}
                        car={car}
                        showOwner={false}
                        showPrice={false}
                        compact={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No cars yet</h3>
                    <p className="mb-4">Start by tokenizing your first car</p>
                    <Link href="/mint">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Mint Your First Car
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  My Listings ({userListings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listingsLoading ? (
                  <div className="text-center py-8">Loading listings...</div>
                ) : userListings.length > 0 ? (
                  <div className="space-y-4">
                    {userListings.map((listing) => (
                      <div key={listing.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              🚗
                            </div>
                            <div>
                              <div className="font-medium">
                                {listing.car?.make} {listing.car?.model} ({listing.car?.year})
                              </div>
                              <div className="text-sm text-gray-600">
                                VIN: {listing.car?.vin}
                              </div>
                              <div className="text-sm text-gray-600">
                                Listed: {formatDate(listing.createdAt)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {formatPrice(listing.price)}
                            </div>
                            <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                              {listing.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/cars/${listing.car?.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>

                          {listing.status === 'active' && (
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                    <p className="mb-4">List your verified cars for sale</p>
                    <Button variant="outline">
                      View Marketplace
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {tx.type === 'mint' ? '🏭' : tx.type === 'purchase' ? '🛒' : '📋'}
                        </div>

                        <div className="flex-1">
                          <div className="font-medium capitalize">{tx.type}</div>
                          <div className="text-sm text-gray-600">
                            {formatAddress(tx.contractAddress)}
                          </div>
                          {tx.amount && (
                            <div className="text-sm text-gray-600">
                              Amount: {formatPrice(tx.amount)}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatDate(tx.createdAt)}
                          </div>
                          <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                    <p className="mb-4">Your transaction history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
