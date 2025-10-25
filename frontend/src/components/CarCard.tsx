'use client';

import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { formatAddress, formatCarName, formatPrice, formatDate } from '../utils/formatters';
import { formatVerificationStatus, formatListingStatus } from '../utils/formatters';
import { Eye, ShoppingCart, User, Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CarCardProps {
  car: {
    id: string;
    tokenId?: number;
    vin: string;
    make: string;
    model: string;
    year: number;
    color?: string;
    mileage?: number;
    metadataURI?: string;
    images?: Array<{ url: string; hash: string; filename: string }>;
    verificationStatus: string;
    isListed?: boolean;
    listingPrice?: string;
    price?: string | number; // Added for marketplace listings
    ownerAddress: string;
    creator?: {
      id: string;
      walletAddress: string;
      firstName?: string;
      lastName?: string;
    };
    createdAt: string;
  };
  showOwner?: boolean;
  showPrice?: boolean;
  compact?: boolean;
  showTransfer?: boolean;
  onPurchase?: (carId: string) => void;
  onTransfer?: (carId: string) => void;
}

export default function CarCard({
  car,
  showOwner = true,
  showPrice = true,
  compact = false,
  showTransfer = false,
  onPurchase,
  onTransfer,
}: CarCardProps) {
  const verificationStatus = formatVerificationStatus(car.verificationStatus);
  const mainImage = car.images?.[0]?.url || '/placeholder-car.jpg';
  
  // Debug: log price data
  if (showPrice && typeof window !== 'undefined') {
    console.log(`💰 CarCard ${car.make} ${car.model} - price:`, car.price, 'listingPrice:', car.listingPrice);
  }

  if (compact) {
    return (
      <Card className="hover:shadow-xl transition-all border-2 border-gray-200 hover:border-purple-300 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={mainImage}
                alt={formatCarName(car)}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">
                  {formatCarName(car)}
                </h3>
                <Badge
                  className={`text-xs ${verificationStatus.color}`}
                  variant="outline"
                >
                  {verificationStatus.text}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground mb-2">
                VIN: {car.vin}
              </div>

              <div className="flex items-center justify-between">
                {showPrice && (car.listingPrice || car.price) && (
                  <div className="font-medium text-sm">
                    {formatPrice(car.listingPrice || car.price)}
                  </div>
                )}

                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/cars/${car.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>

                  {onPurchase && car.isListed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPurchase(car.id)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Transfer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-purple-400 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
          <Image
            src={mainImage}
            alt={formatCarName(car)}
            fill
            className="object-cover"
          />

          {/* Status badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge className={`${verificationStatus.color} font-semibold border-2`} variant="outline">
              {verificationStatus.text}
            </Badge>

            {car.isListed && (
              <Badge className="bg-green-600 text-white font-semibold border-2 border-green-500 shadow-md">
                Available
              </Badge>
            )}
          </div>

          {/* Price overlay */}
          {showPrice && (car.listingPrice || car.price) && (
            <div className="absolute bottom-2 right-2">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold px-4 py-2 shadow-xl border-2 border-white">
                {formatPrice(car.listingPrice || car.price)}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Car info */}
          <div>
            <h3 className="font-bold text-lg mb-1">
              {formatCarName(car)}
            </h3>

            <div className="text-sm text-muted-foreground space-y-1">
              <div>VIN: <span className="font-mono">{car.vin}</span></div>
              {car.mileage && (
                <div>Mileage: <span className="font-medium">{car.mileage.toLocaleString()} miles</span></div>
              )}
              {car.color && (
                <div>Color: <span className="font-medium">{car.color}</span></div>
              )}
            </div>
          </div>

          {/* Owner info */}
          {showOwner && car.creator && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>
                {car.creator.firstName || car.creator.lastName
                  ? `${car.creator.firstName || ''} ${car.creator.lastName || ''}`.trim()
                  : formatAddress(car.creator.walletAddress)
                }
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/cars/${car.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </Button>

            {onPurchase && car.isListed && (
              <Button
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={() => onPurchase(car.id)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            )}

            {showTransfer && onTransfer && (
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => onTransfer(car.id)}
              >
                <Send className="w-4 h-4 mr-2" />
                Transfer
              </Button>
            )}
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Token ID: {car.tokenId || 'Pending'}
            <br />
            Created: {formatDate(car.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

