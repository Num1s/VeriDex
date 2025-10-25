'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useGasless } from '../hooks/useGasless';
import { useToast } from '../hooks/useToast';
import { formatPrice, formatAddress } from '../utils/formatters';
import { Loader2, Info, Shield, ShoppingCart, User, Calendar } from 'lucide-react';

interface PurchaseModalProps {
  listing: {
    id: string;
    listingId: number;
    tokenId: number;
    price: string;
    seller: string;
    car: {
      make: string;
      model: string;
      year: number;
      vin: string;
      verificationStatus: string;
      images: string[];
    };
    createdAt: string;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function PurchaseModal({ listing, trigger, onSuccess }: PurchaseModalProps) {
  const [open, setOpen] = useState(false);
  const [useEscrow, setUseEscrow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { purchaseCar, isPurchasing } = useGasless();
  const { toast } = useToast();

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      await purchaseCar({
        listingId: listing.listingId.toString(),
        price: listing.price,
        useEscrow,
      });

      toast({
        title: 'Purchase Successful',
        description: 'Your car purchase has been completed successfully',
      });

      setOpen(false);
      setUseEscrow(false);
      onSuccess?.();
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Failed to complete purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const platformFee = parseFloat(listing.price) * 0.02; // 2%
  const totalAmount = parseFloat(listing.price) + platformFee;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Purchase Car
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Purchase Car</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Car Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vehicle</span>
                <span className="font-medium">{listing.car.year} {listing.car.make} {listing.car.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">VIN</span>
                <span className="font-mono text-xs">{listing.car.vin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Verified
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Seller</span>
                <span className="font-mono text-xs">{formatAddress(listing.seller)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Car Price</span>
                <span className="font-medium">{formatPrice(listing.price)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Platform Fee (2%)</span>
                <span>+{formatPrice(platformFee.toString())}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Amount</span>
                  <span className="text-green-600">{formatPrice(totalAmount.toString())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Option */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="escrow"
                checked={useEscrow}
                onCheckedChange={(checked) => setUseEscrow(!!checked)}
              />
              <Label htmlFor="escrow" className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Use Escrow Protection
              </Label>
            </div>
            
            {useEscrow && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Escrow Protection</p>
                    <p className="text-xs mt-1">
                      Your payment will be held securely until the car is delivered and verified. 
                      The seller will receive payment only after successful delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important</p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• Ensure you have sufficient ETH balance for the purchase</li>
                  <li>• Transaction fees will be covered by our gasless system</li>
                  <li>• You will receive the NFT ownership after successful purchase</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isLoading || isPurchasing}
              className="flex-1"
            >
              {isLoading || isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Confirm Purchase
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
