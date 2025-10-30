'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/useToast';
import { formatPrice, formatAddress } from '../utils/formatters';
import { 
  mockCars, 
  mockUsers, 
  mockStats, 
  simulatePurchase, 
  simulateSale, 
  simulateListing,
  MockCar,
  MockTransaction,
  MockUser
} from '../data/mockData';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Car, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Play,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

interface SimulationModalProps {
  trigger?: React.ReactNode;
}

export default function SimulationModal({ trigger }: SimulationModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('purchase');
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [customPrice, setCustomPrice] = useState('');
  const [simulationResults, setSimulationResults] = useState<MockTransaction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const { toast } = useToast();

  // Filter cars based on verification status
  const availableCars = mockCars.filter(car => car.verificationStatus === 'verified');
  const pendingCars = mockCars.filter(car => car.verificationStatus === 'pending');

  const handleSimulatePurchase = async () => {
    if (!selectedCar || !selectedUser) {
      toast({
        title: 'Missing Information',
        description: 'Please select both a car and a user for the simulation',
        variant: 'destructive',
      });
      return;
    }

    setIsSimulating(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const car = mockCars.find(c => c.id === selectedCar);
      const user = mockUsers.find(u => u.id === selectedUser);
      
      if (!car || !user) {
        throw new Error('Car or user not found');
      }

      const transaction = simulatePurchase(selectedCar, user.address);
      setSimulationResults(prev => [...prev, transaction]);
      
      toast({
        title: 'Purchase Simulated',
        description: `Successfully simulated purchase of ${car.year} ${car.make} ${car.model} by ${user.name}`,
      });

      setShowResults(true);
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: 'Simulation Failed',
        description: 'Failed to simulate purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateSale = async () => {
    if (!selectedCar || !selectedUser || !customPrice) {
      toast({
        title: 'Missing Information',
        description: 'Please select a car, user, and enter a price for the simulation',
        variant: 'destructive',
      });
      return;
    }

    setIsSimulating(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const car = mockCars.find(c => c.id === selectedCar);
      const user = mockUsers.find(u => u.id === selectedUser);
      
      if (!car || !user) {
        throw new Error('Car or user not found');
      }

      const transaction = simulateSale(selectedCar, user.address, customPrice);
      setSimulationResults(prev => [...prev, transaction]);
      
      toast({
        title: 'Sale Simulated',
        description: `Successfully simulated sale of ${car.year} ${car.make} ${car.model} by ${user.name} for ${formatPrice(customPrice)}`,
      });

      setShowResults(true);
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: 'Simulation Failed',
        description: 'Failed to simulate sale. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateListing = async () => {
    if (!selectedCar || !selectedUser || !customPrice) {
      toast({
        title: 'Missing Information',
        description: 'Please select a car, user, and enter a price for the simulation',
        variant: 'destructive',
      });
      return;
    }

    setIsSimulating(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const car = mockCars.find(c => c.id === selectedCar);
      const user = mockUsers.find(u => u.id === selectedUser);
      
      if (!car || !user) {
        throw new Error('Car or user not found');
      }

      const transaction = simulateListing(selectedCar, user.address, customPrice);
      setSimulationResults(prev => [...prev, transaction]);
      
      toast({
        title: 'Listing Simulated',
        description: `Successfully simulated listing of ${car.year} ${car.make} ${car.model} by ${user.name} for ${formatPrice(customPrice)}`,
      });

      setShowResults(true);
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: 'Simulation Failed',
        description: 'Failed to simulate listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const resetSimulation = () => {
    setSimulationResults([]);
    setShowResults(false);
    setSelectedCar('');
    setSelectedUser('');
    setCustomPrice('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Play className="w-4 h-4 mr-2" />
            Simulate Trading
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Trading Simulation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{mockStats.totalListings}</div>
                <div className="text-sm text-gray-600">Total Cars</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{mockStats.activeListings}</div>
                <div className="text-sm text-gray-600">Available</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{formatPrice(mockStats.totalVolume)}</div>
                <div className="text-sm text-gray-600">Total Volume</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{mockStats.totalUsers}</div>
                <div className="text-sm text-gray-600">Users</div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="purchase">Simulate Purchase</TabsTrigger>
              <TabsTrigger value="sale">Simulate Sale</TabsTrigger>
              <TabsTrigger value="listing">Simulate Listing</TabsTrigger>
            </TabsList>

            {/* Purchase Simulation */}
            <TabsContent value="purchase" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Purchase Simulation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchase-car">Select Car to Purchase</Label>
                      <Select value={selectedCar} onValueChange={setSelectedCar}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a car" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCars.map((car) => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.year} {car.make} {car.model} - {formatPrice(car.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchase-user">Select Buyer</Label>
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a buyer" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({formatAddress(user.address)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedCar && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Selected Car Details</h4>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            ✓ Verified
                          </Badge>
                        </div>
                        {(() => {
                          const car = mockCars.find(c => c.id === selectedCar);
                          return car ? (
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Vehicle:</span>
                                <span className="font-medium">{car.year} {car.make} {car.model}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Price:</span>
                                <span className="font-medium text-green-600">{formatPrice(car.price)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Mileage:</span>
                                <span>{car.mileage.toLocaleString()} miles</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Condition:</span>
                                <span className="capitalize">{car.condition}</span>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  <Button 
                    onClick={handleSimulatePurchase}
                    disabled={!selectedCar || !selectedUser || isSimulating}
                    className="w-full"
                  >
                    {isSimulating ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Simulating Purchase...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Simulate Purchase
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sale Simulation */}
            <TabsContent value="sale" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Sale Simulation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sale-car">Select Car to Sell</Label>
                      <Select value={selectedCar} onValueChange={setSelectedCar}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a car" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCars.map((car) => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.year} {car.make} {car.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sale-user">Select Seller</Label>
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a seller" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({formatAddress(user.address)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sale-price">Sale Price (ETH)</Label>
                    <Input
                      id="sale-price"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Enter sale price"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleSimulateSale}
                    disabled={!selectedCar || !selectedUser || !customPrice || isSimulating}
                    className="w-full"
                  >
                    {isSimulating ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Simulating Sale...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Simulate Sale
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Listing Simulation */}
            <TabsContent value="listing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Listing Simulation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="listing-car">Select Car to List</Label>
                      <Select value={selectedCar} onValueChange={setSelectedCar}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a car" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCars.map((car) => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.year} {car.make} {car.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="listing-user">Select Owner</Label>
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an owner" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({formatAddress(user.address)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="listing-price">Listing Price (ETH)</Label>
                    <Input
                      id="listing-price"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Enter listing price"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleSimulateListing}
                    disabled={!selectedCar || !selectedUser || !customPrice || isSimulating}
                    className="w-full"
                  >
                    {isSimulating ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Simulating Listing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Simulate Listing
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Simulation Results */}
          {simulationResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Simulation Results
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResults(!showResults)}
                    >
                      {showResults ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showResults ? 'Hide' : 'Show'} Results
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetSimulation}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {showResults && (
                <CardContent>
                  <div className="space-y-4">
                    {simulationResults.map((transaction, index) => {
                      const car = mockCars.find(c => c.id === transaction.carId);
                      const user = mockUsers.find(u => u.address === transaction.seller || u.address === transaction.buyer);
                      
                      return (
                        <Card key={transaction.id} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(transaction.status)}
                                <span className="font-medium">
                                  {transaction.type === 'purchase' ? 'Purchase' : 
                                   transaction.type === 'sale' ? 'Sale' : 'Listing'} Simulation
                                </span>
                              </div>
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Car:</span>
                                  <span className="font-medium">
                                    {car ? `${car.year} ${car.make} ${car.model}` : 'Unknown'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Price:</span>
                                  <span className="font-medium text-green-600">
                                    {formatPrice(transaction.price)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">User:</span>
                                  <span className="font-medium">
                                    {user ? user.name : 'Unknown'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Gas Used:</span>
                                  <span className="font-medium text-green-600">
                                    {transaction.gasUsed} (Gasless!)
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Platform Fee:</span>
                                  <span className="font-medium">
                                    {formatPrice(transaction.fees.platformFee)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Transaction Hash:</span>
                                  <span className="font-mono text-xs">
                                    {transaction.transactionHash?.substring(0, 10)}...
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-xs text-gray-500">
                                Simulated at: {new Date(transaction.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


