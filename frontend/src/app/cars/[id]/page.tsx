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

  // Fetch car details
  const { data: carResponse, isLoading } = useQuery({
    queryKey: ['car', carId],
    queryFn: () => carsAPI.getCar(carId),
    enabled: !!carId,
  });

  const car = carResponse?.data as any; // Car data from API

  // Check ownership and listing status
  useEffect(() => {
    if (car && address && car.ownerAddress && car.isListed !== undefined) {
      setIsOwner(car.ownerAddress.toLowerCase() === address.toLowerCase());
      setIsListed(car.isListed || false);
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

  const mainImage = car.images?.[0]?.url || '/placeholder-car.jpg';
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
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
                  <Image
                    src={mainImage}
                    alt={formatCarName(car)}
                    fill
                    className="object-cover"
                  />

                  {/* Status overlay */}
                  <div className="absolute top-4 left-4">
                    <VerificationBadge status={car.verificationStatus} />
                  </div>

                  {car.isListed && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-600 text-white">Listed</Badge>
                    </div>
                  )}

                  {/* Price overlay */}
                  {car.listingPrice && (
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-black/80 text-white text-lg font-bold px-4 py-2">
                        {formatPrice(car.listingPrice)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Image thumbnails */}
                {car.images && car.images.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2 overflow-x-auto">
                      {car.images?.map((image: any, index: number) => (
                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={image.url}
                            alt={`${formatCarName(car)} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Car Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Car className="w-6 h-6" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">VIN</div>
                    <div className="font-mono text-sm">{car.vin}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">Token ID</div>
                    <div className="font-mono text-sm">{car.tokenId || 'Pending'}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">Make</div>
                    <div className="font-medium">{car.make}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">Model</div>
                    <div className="font-medium">{car.model}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">Year</div>
                    <div className="font-medium">{car.year}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">Color</div>
                    <div className="font-medium">{car.color || 'Not specified'}</div>
                  </div>

                  {car.mileage && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Mileage</div>
                      <div className="font-medium">{car.mileage.toLocaleString()} miles</div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium text-gray-500">Status</div>
                    <div className="flex items-center gap-2">
                      <VerificationBadge status={car.verificationStatus} size="sm" />
                    </div>
                  </div>
                </div>

                {car.description && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Description</div>
                    <div className="text-sm">{car.description}</div>
                  </div>
                )}

                {/* Owner Information */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Owner</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {car.creator?.firstName || car.creator?.lastName
                      ? `${car.creator.firstName || ''} ${car.creator.lastName || ''}`.trim()
                      : formatAddress(car.ownerAddress)
                    }
                  </div>
                </div>

                {/* Metadata URI */}
                {car.metadataURI && (
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">Metadata</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {car.metadataURI}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(car.metadataURI)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(car.metadataURI, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            {car.documents && car.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {car.documents?.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{doc.name || `Document ${index + 1}`}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
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
                  <Button className="w-full" onClick={handleListCar}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    List for Sale
                  </Button>
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

            {/* Car Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Specifications
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {car.engineType && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Engine</span>
                    <span className="text-sm font-medium">{car.engineType}</span>
                  </div>
                )}

                {car.transmission && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transmission</span>
                    <span className="text-sm font-medium">{car.transmission}</span>
                  </div>
                )}

                {car.fuelType && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fuel Type</span>
                    <span className="text-sm font-medium">{car.fuelType}</span>
                  </div>
                )}

                {car.location && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location</span>
                    <span className="text-sm font-medium">{car.location}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Listed</span>
                  <Badge variant={car.isListed ? 'default' : 'secondary'}>
                    {car.isListed ? 'Yes' : 'No'}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Escrow</span>
                  <Badge variant={car.isEscrow ? 'default' : 'secondary'}>
                    {car.isEscrow ? 'Yes' : 'No'}
                  </Badge>
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

