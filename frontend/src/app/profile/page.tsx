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
import TransferModal from '../../components/TransferModal';
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
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);

  // Debug logging
  useEffect(() => {
    console.log('👤 Profile Page - User:', user);
    console.log('🔐 Is Authenticated:', isAuthenticated);
    console.log('💰 Wallet Address:', address);
  }, [user, isAuthenticated, address]);

  // Fetch user's cars
  const { data: carsResponse, isLoading: carsLoading, refetch: refetchCars, error: carsError } = useQuery({
    queryKey: ['user-cars'],
    queryFn: async () => {
      console.log('📍 Fetching cars for address:', address);
      const response = await carsAPI.getUserCars();
      console.log('🚗 Cars API response:', response);
      console.log('🚗 Cars API response.data:', response.data);
      console.log('🚗 Cars API response.data.data:', response.data?.data);
      return response;
    },
    enabled: isAuthenticated,
  });
  
  // Debug cars data
  useEffect(() => {
    if (carsResponse) {
      console.log('🔍 carsResponse:', carsResponse);
      console.log('🔍 carsResponse.data:', carsResponse.data);
      console.log('🔍 carsResponse.data.data:', carsResponse.data?.data);
    }
    if (carsError) {
      console.error('❌ Cars error:', carsError);
    }
  }, [carsResponse, carsError]);

  // Handle transfer
  const handleTransferClick = (carId: string) => {
    const car = userCars.find((c: any) => c.id === carId);
    if (car) {
      setSelectedCar(car);
      setTransferModalOpen(true);
    }
  };

  const handleTransfer = async (newOwnerAddress: string) => {
    if (!selectedCar) return;
    
    try {
      await carsAPI.transferOwnership(selectedCar.id, newOwnerAddress);
      // Refresh cars list
      refetchCars();
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  };

  // Fetch user's listings
  const { data: listingsResponse, isLoading: listingsLoading } = useQuery({
    queryKey: ['user-listings'],
    queryFn: () => marketplaceAPI.getUserListings(),
    enabled: isAuthenticated,
  });

  const userCars = Array.isArray(carsResponse?.data?.data) ? carsResponse.data.data : [];
  const userListings = Array.isArray(listingsResponse?.data?.data) ? listingsResponse.data.data : [];

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to view your tokenized assets.
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
    const safeUserCars = Array.isArray(userCars) ? userCars : [];
    const safeUserListings = Array.isArray(userListings) ? userListings : [];

    const totalCars = safeUserCars.length;
    const verifiedCars = safeUserCars.filter(car => car.verificationStatus === 'approved').length;
    const listedCars = safeUserCars.filter(car => car.isListed).length;
    const activeListings = safeUserListings.filter(listing => listing.status === 'active').length;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-accent-50/20">
      {/* Header */}
      <header className="gradient-mixed shadow-lg border-b border-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/')} className="text-white hover:bg-white/20">
                ← Back to Registry
              </Button>
              <h1 className="text-2xl font-bold text-white">My Assets</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/mint">
                <Button className="bg-white text-purple-700 hover:bg-gray-100 font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Tokenize Asset
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8 shadow-md">
          <CardContent className="p-6 bg-gradient-to-r from-primary-50/30 to-accent-50/30">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-primary">
                {user.firstName?.[0] || user.lastName?.[0] || address?.[0]?.toUpperCase() || 'U'}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : formatAddress(address || '')
                    }
                  </h2>

                  <div className="flex items-center gap-2">
                    <VerificationBadge status={user.isVerified ? 'approved' : 'pending'} />
                    {user.kycStatus === 'approved' && (
                      <Badge variant="outline" className="text-green-700 bg-green-50 border-green-300 font-semibold">
                        <Award className="w-3 h-3 mr-1" />
                        KYC Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                    <Wallet className="w-4 h-4 text-purple-600" />
                    {formatAddress(address || '')}
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                    <Award className="w-4 h-4 text-yellow-600" />
                    Reputation: {stats.reputationScore}/5.0
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Joined {formatDate(user.createdAt || new Date(), { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/profile/edit">
                  <Button variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold">
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
          <Card className="shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all">
            <CardContent className="p-6 text-center">
              <Car className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-3xl font-bold text-gray-900">{stats.totalCars}</div>
              <div className="text-sm font-medium text-gray-600">Total Assets</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-green-100 hover:border-green-300 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-green-600 bg-green-100 rounded-full flex items-center justify-center">
                ✓
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.verifiedCars}</div>
              <div className="text-sm font-medium text-gray-600">Verified</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-all">
            <CardContent className="p-6 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-3xl font-bold text-gray-900">{stats.activeListings}</div>
              <div className="text-sm font-medium text-gray-600">Listed</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-orange-100 hover:border-orange-300 transition-all">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-3xl font-bold text-gray-900">5.0</div>
              <div className="text-sm font-medium text-gray-600">Reputation</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-purple-100 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold">Overview</TabsTrigger>
            <TabsTrigger value="cars" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold">My Assets</TabsTrigger>
            <TabsTrigger value="listings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold">Listed</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold">Activity</TabsTrigger>
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
            <Card className="shadow-xl border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Car className="w-5 h-5 text-purple-600" />
                  My Assets ({userCars.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                {carsLoading ? (
                  <div className="text-center py-8">Loading cars...</div>
                ) : userCars.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userCars.map((car) => (
                      <CarCard
                        key={car.id}
                        car={car}
                        showOwner={false}
                        showPrice={true}
                        showTransfer={true}
                        compact={false}
                        onTransfer={handleTransferClick}
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

      {/* Transfer Modal */}
      {selectedCar && (
        <TransferModal
          isOpen={transferModalOpen}
          onClose={() => {
            setTransferModalOpen(false);
            setSelectedCar(null);
          }}
          onTransfer={handleTransfer}
          carInfo={{
            make: selectedCar.make,
            model: selectedCar.model,
            year: selectedCar.year,
            vin: selectedCar.vin,
          }}
        />
      )}
    </div>
  );
}
