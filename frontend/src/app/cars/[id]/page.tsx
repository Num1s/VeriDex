'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useWalletAuth } from '../../../hooks/useWalletAuth';
import { useGasless } from '../../../hooks/useGasless';
import { carsAPI, marketplaceAPI } from '../../../services/api';
import CreateListingModal from '../../../components/CreateListingModal';
import VerificationBadge from '../../../components/VerificationBadge';
import { formatAddress, formatCarName, formatDate, formatPrice } from '../../../utils/formatters';
import {
  Car,
  ArrowLeft,
  ShoppingCart,
  Edit,
  Copy,
  ExternalLink,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Palette,
  FileText,
  Image as ImageIcon,
  User,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;

  const { user, isAuthenticated, address } = useWalletAuth();
  const { listCar, purchaseCar } = useGasless();
  const [isOwner, setIsOwner] = useState(false);
  const [isListed, setIsListed] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch car details
  const { data: carResponse, isLoading, error: carError } = useQuery({
    queryKey: ['car', carId],
    queryFn: async () => {
      console.log('🔍 Fetching car details for ID:', carId);
      const response = await carsAPI.getCar(carId);
      console.log('🚗 Car API response:', response);
      console.log('🚗 Car data:', response?.data);
      return response;
    },
    enabled: !!carId,
  });

  // Debug logging
  useEffect(() => {
    if (carResponse) {
      console.log('📦 carResponse:', carResponse);
      console.log('📦 carResponse.data:', carResponse.data);
      console.log('📦 carResponse.data.data:', carResponse.data?.data);
    }
    if (carError) {
      console.error('❌ Car error:', carError);
    }
  }, [carResponse, carError]);

  const car = carResponse?.data?.data as any; // Car data from API response

  // Check ownership and listing status
  useEffect(() => {
    if (car) {
      // Use isOwner from API if available, otherwise calculate
      const ownerStatus = car.isOwner !== undefined 
        ? car.isOwner 
        : (address && car.ownerAddress ? car.ownerAddress.toLowerCase() === address.toLowerCase() : false);
      
      setIsOwner(ownerStatus);
      setIsListed(car.isListed || false);
      
      console.log('🔍 Car Detail - Owner status:', ownerStatus, 'Listed:', car.isListed);
    }
  }, [car, address]);

  const handleListCar = async () => {
    if (!car) return;

    try {
      const price = prompt('Enter listing price in ETH:');
      if (!price || isNaN(parseFloat(price))) return;

      await listCar({
        tokenId: car.tokenId?.toString() || car.id,
        price,
      });
    } catch (error) {
      console.error('List car error:', error);
    }
  };

  const handlePurchaseCar = async () => {
    if (!car) return;

    try {
      const useEscrow = confirm('Use escrow for this purchase? (Recommended for high-value transactions)');
      const price = prompt('Confirm purchase price in ETH:');
      if (!price || isNaN(parseFloat(price))) return;

      await purchaseCar({
        listingId: car.listingId?.toString() || car.id,
        price,
        useEscrow,
      });
    } catch (error) {
      console.error('Purchase car error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Car Not Found</h2>
            <p className="text-gray-600 mb-4">
              The requested car could not be found.
            </p>
            <Button onClick={() => router.push('/')}>
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const carImages = car.images && car.images.length > 0 ? car.images : [{ url: '/placeholder-car.jpg', filename: 'placeholder' }];
  const mainImage = carImages[selectedImageIndex]?.url || '/placeholder-car.jpg';
  const isVerified = car.verificationStatus === 'approved';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>

            <div className="flex items-center gap-2">
              <VerificationBadge status={car.verificationStatus} />
              {isOwner && (
                <Badge variant="outline">Owner</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-700">
                  <Image
                    src={mainImage}
                    alt={formatCarName(car)}
                    fill
                    className="object-contain"
                  />

                  {/* Status overlay */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <VerificationBadge status={car.verificationStatus} />
                    {car.isListed && (
                      <Badge className="bg-green-600 text-white font-semibold shadow-lg">
                        🟢 Available for Sale
                      </Badge>
                    )}
                  </div>

                  {/* Price overlay */}
                  {car.listingPrice && (
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold px-6 py-3 shadow-2xl border-2 border-white">
                        {formatPrice(car.listingPrice)}
                      </Badge>
                    </div>
                  )}

                  {/* Image counter */}
                  {carImages.length > 1 && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-black/70 text-white border-white">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {selectedImageIndex + 1} / {carImages.length}
                      </Badge>
                    </div>
                  )}

                  {/* Navigation arrows */}
                  {carImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? carImages.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                        aria-label="Previous image"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev === carImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                        aria-label="Next image"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {/* Image thumbnails */}
                {carImages.length > 1 && (
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {carImages.map((image: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-purple-600 shadow-lg scale-105'
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <Image
                            src={image.url}
                            alt={`${formatCarName(car)} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Car Header - Title and Main Info */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {car.year} {car.make} {car.model}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        VIN: {car.vin}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        Token ID: {car.tokenId || 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  {car.description && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Description</div>
                      <p className="text-gray-600 leading-relaxed">{car.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Car Details */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center gap-3 text-purple-900">
                  <Car className="w-6 h-6 text-purple-600" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Basic Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 mb-1">Make</div>
                      <div className="font-semibold text-gray-900">{car.make}</div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 mb-1">Model</div>
                      <div className="font-semibold text-gray-900">{car.model}</div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 mb-1">Year</div>
                      <div className="font-semibold text-gray-900">{car.year}</div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 mb-1">Color</div>
                      <div className="font-semibold text-gray-900">{car.color || 'Not specified'}</div>
                    </div>

                    {car.mileage !== null && car.mileage !== undefined && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          Mileage
                        </div>
                        <div className="font-semibold text-gray-900">{car.mileage.toLocaleString()} miles</div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 mb-1">Status</div>
                      <VerificationBadge status={car.verificationStatus} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                {(car.engineType || car.transmission || car.fuelType) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {car.engineType && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="text-xs font-medium text-blue-600 mb-1">Engine Type</div>
                          <div className="font-semibold text-gray-900">{car.engineType}</div>
                        </div>
                      )}

                      {car.transmission && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <div className="text-xs font-medium text-purple-600 mb-1">Transmission</div>
                          <div className="font-semibold text-gray-900">{car.transmission}</div>
                        </div>
                      )}

                      {car.fuelType && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                            <Fuel className="w-3 h-3" />
                            Fuel Type
                          </div>
                          <div className="font-semibold text-gray-900">{car.fuelType}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Owner Information */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Owner Information
                  </h3>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-sm text-gray-600 mb-1">Current Owner</div>
                    <div className="font-mono font-semibold text-gray-900">
                      {car.creator?.firstName || car.creator?.lastName
                        ? `${car.creator.firstName || ''} ${car.creator.lastName || ''}`.trim()
                        : formatAddress(car.ownerAddress)
                      }
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-mono">
                      {car.ownerAddress}
                    </div>
                  </div>
                </div>

                {/* Blockchain Information */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Blockchain Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Token ID</span>
                      <Badge variant="outline" className="font-mono">{car.tokenId || 'Pending'}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Network</span>
                      <Badge variant="outline">Linea Testnet</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Minted On</span>
                      <span className="text-sm font-medium">{formatDate(car.createdAt)}</span>
                    </div>

                    {car.metadataURI && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">Metadata URI</div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white px-2 py-1 rounded border flex-1 overflow-x-auto">
                            {car.metadataURI}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(car.metadataURI)}
                            title="Copy to clipboard"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(car.metadataURI, '_blank')}
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            {car.documents && car.documents.length > 0 && (
              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Documents ({car.documents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  {car.documents?.map((doc: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between gap-2 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="bg-blue-100 p-2 rounded">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {doc.name || doc.filename || `Document ${index + 1}`}
                          </div>
                          {doc.hash && (
                            <div className="text-xs text-gray-500 font-mono truncate">
                              {doc.hash.substring(0, 20)}...
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="flex-shrink-0"
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {isOwner && !isListed && isVerified && (
                  <CreateListingModal
                    car={{
                      id: car.id,
                      tokenId: car.tokenId,
                      make: car.make,
                      model: car.model,
                      year: car.year,
                      vin: car.vin,
                      verificationStatus: car.verificationStatus,
                    }}
                    trigger={
                      <Button className="w-full">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        List for Sale
                      </Button>
                    }
                    onSuccess={() => {
                      // Refresh car data
                      window.location.reload();
                    }}
                  />
                )}

                {isOwner && isListed && (
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Listing
                    </Button>
                    <Button variant="outline" className="w-full">
                      Cancel Listing
                    </Button>
                  </div>
                )}

                {!isOwner && car.isListed && (
                  <Button className="w-full" onClick={handlePurchaseCar}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase Car
                  </Button>
                )}

                {car.listingPrice && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(car.listingPrice)}
                    </div>
                    <div className="text-sm text-gray-600">Current Price</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Verification Status
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <VerificationBadge status={car.verificationStatus} />

                {car.verificationNotes && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Notes</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {car.verificationNotes}
                    </div>
                  </div>
                )}

                {car.verifiedAt && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Verified On</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(car.verifiedAt)}
                    </div>
                  </div>
                )}

                {car.verifiedBy && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Verified By</div>
                    <div className="text-sm text-gray-600">
                      {formatAddress(car.verifiedBy)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {car.mileage !== null && car.mileage !== undefined && (
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      Mileage
                    </span>
                    <span className="text-sm font-semibold">{car.mileage.toLocaleString()} mi</span>
                  </div>
                )}

                {car.engineType && (
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Settings className="w-4 h-4" />
                      Engine
                    </span>
                    <span className="text-sm font-semibold">{car.engineType}</span>
                  </div>
                )}

                {car.transmission && (
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Transmission</span>
                    <span className="text-sm font-semibold">{car.transmission}</span>
                  </div>
                )}

                {car.fuelType && (
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      Fuel Type
                    </span>
                    <span className="text-sm font-semibold">{car.fuelType}</span>
                  </div>
                )}

                {car.color && (
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Palette className="w-4 h-4" />
                      Color
                    </span>
                    <span className="text-sm font-semibold">{car.color}</span>
                  </div>
                )}

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Listed</span>
                    <Badge variant={car.isListed ? 'default' : 'secondary'} className="font-semibold">
                      {car.isListed ? '✓ Yes' : '✗ No'}
                    </Badge>
                  </div>

                  {car.isEscrow && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">In Escrow</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">
                        🔒 Protected
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  History
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Minted</span>
                  <span className="text-sm font-medium">
                    {formatDate(car.createdAt)}
                  </span>
                </div>

                {car.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Verified</span>
                    <span className="text-sm font-medium">
                      {formatDate(car.verifiedAt)}
                    </span>
                  </div>
                )}

                {car.listingPrice && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Listed</span>
                    <span className="text-sm font-medium">
                      {formatPrice(car.listingPrice)}
                    </span>
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-2 border-t">
                  Token ID: {car.tokenId || 'Pending'}
                  <br />
                  Blockchain: Linea Testnet
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

