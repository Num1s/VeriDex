'use client';

import Layout from '../../components/layout/Layout';
import SimulationModal from '../../components/SimulationModal';
import SimulationStats from '../../components/SimulationStats';
import GasFreeDemo from '../../components/GasFreeDemo';
import ComparisonDemo from '../../components/ComparisonDemo';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { mockCars, mockUsers, mockStats } from '../../data/mockData';
import { formatPrice, formatAddress } from '../../utils/formatters';
import { 
  Play, 
  Car, 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  Clock,
  AlertCircle,
  ShoppingCart,
  DollarSign as SaleIcon,
  List
} from 'lucide-react';

export default function SimulationPage() {
  const availableCars = mockCars.filter(car => car.verificationStatus === 'verified');
  const pendingCars = mockCars.filter(car => car.verificationStatus === 'pending');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Trading Simulation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Experience gas-free car trading with our interactive simulation
            </p>
            
            {/* Main Simulation Button */}
            <div className="flex justify-center mb-8">
              <SimulationModal 
                trigger={
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                    <Play className="w-6 h-6 mr-3" />
                    Start Trading Simulation
                  </Button>
                }
              />
            </div>
          </div>

          {/* Platform Stats */}
          <SimulationStats />

          {/* Gas-Free Demo */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How Gas-Free Transactions Work</h2>
            <GasFreeDemo />
          </div>

          {/* Platform Comparison */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Comparison</h2>
            <ComparisonDemo />
          </div>

          {/* Available Cars */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Cars for Simulation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCars.map((car) => (
                <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    {car.images[0] ? (
                      <img 
                        src={car.images[0]} 
                        alt={`${car.year} ${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200" style={{ display: car.images[0] ? 'none' : 'flex' }}>
                      <Car className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(car.verificationStatus)}>
                        {getStatusIcon(car.verificationStatus)}
                        <span className="ml-1 capitalize">{car.verificationStatus}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(car.price)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Mileage:</span>
                        <span>{car.mileage.toLocaleString()} miles</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Color:</span>
                        <span className="capitalize">{car.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Condition:</span>
                        <span className="capitalize">{car.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fuel:</span>
                        <span className="capitalize">{car.fuelType}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      VIN: {car.vin}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Simulation Users */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Simulation Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center" style={{ display: user.avatar ? 'none' : 'flex' }}>
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <div className="text-sm text-gray-600 font-mono">
                          {formatAddress(user.address)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Balance:</span>
                        <span className="font-medium">{formatPrice(user.balance)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purchases:</span>
                        <span className="font-medium">{user.totalPurchases}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sales:</span>
                        <span className="font-medium">{user.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reputation:</span>
                        <span className="font-medium">{user.reputation}/100</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Badge variant={user.verified ? "default" : "secondary"}>
                        {user.verified ? "✓ Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Simulation Features */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Simulation Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold text-lg mb-2">Purchase Simulation</h3>
                  <p className="text-sm text-gray-600">
                    Simulate buying cars with gas-free transactions. Experience the complete purchase flow.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <SaleIcon className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold text-lg mb-2">Sale Simulation</h3>
                  <p className="text-sm text-gray-600">
                    Simulate selling your cars. Set custom prices and see how the platform handles sales.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <List className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-semibold text-lg mb-2">Listing Simulation</h3>
                  <p className="text-sm text-gray-600">
                    Simulate listing cars for sale. Experience the gas-free listing process.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">How the Simulation Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Select Scenario</h3>
                  <p className="text-sm text-gray-600">
                    Choose between purchase, sale, or listing simulation
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Pick Car & User</h3>
                  <p className="text-sm text-gray-600">
                    Select a car and user from our mock data
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Set Parameters</h3>
                  <p className="text-sm text-gray-600">
                    Enter prices and configure transaction options
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">4</span>
                  </div>
                  <h3 className="font-semibold mb-2">Run Simulation</h3>
                  <p className="text-sm text-gray-600">
                    Execute the simulation and see real-time results
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
