'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { useGasless } from '../hooks/useGasless';
import { useToast } from '../hooks/useToast';
import { formatPrice } from '../utils/formatters';
import { Loader2, Info, Shield, DollarSign } from 'lucide-react';

interface CreateListingModalProps {
  car: {
    id: string;
    tokenId: number;
    make: string;
    model: string;
    year: number;
    vin: string;
    verificationStatus: string;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function CreateListingModal({ car, trigger, onSuccess }: CreateListingModalProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [useEscrow, setUseEscrow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { listCar, isListing } = useGasless();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price greater than 0',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await listCar({
        tokenId: car.tokenId.toString(),
        price,
      });

      toast({
        title: 'Listing Created',
        description: 'Your car has been listed for sale successfully',
      });

      setOpen(false);
      setPrice('');
      setUseEscrow(false);
      onSuccess?.();
    } catch (error) {
      console.error('Listing creation error:', error);
      toast({
        title: 'Listing Failed',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const platformFee = parseFloat(price) * 0.02; // 2%
  const netAmount = parseFloat(price) - platformFee;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <DollarSign className="w-4 h-4 mr-2" />
            List for Sale
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>List Car for Sale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Car Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Car Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vehicle</span>
                <span className="font-medium">{car.year} {car.make} {car.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">VIN</span>
                <span className="font-mono text-xs">{car.vin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Verified
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">Listing Price (ETH)</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

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
                      Recommended for high-value transactions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          {price && (
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Listing Price</span>
                    <span className="font-medium">{formatPrice(price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Platform Fee (2%)</span>
                    <span>-{formatPrice(platformFee.toString())}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>You Receive</span>
                      <span className="text-green-600">{formatPrice(netAmount.toString())}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
              type="submit"
              disabled={isLoading || isListing || !price}
              className="flex-1"
            >
              {isLoading || isListing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
