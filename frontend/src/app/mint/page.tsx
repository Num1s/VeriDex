'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { useWalletAuth } from '../../hooks/useWalletAuth';
import { useGasless } from '../../hooks/useGasless';
import { useToast } from '../../hooks/useToast';
import UploadForm from '../../components/UploadForm';
import { Car, Loader2, Sparkles } from 'lucide-react';
import { carSchema } from '../../utils/validators';

const mintSchema = z.object({
  vin: z.string().min(17).max(17),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1900).max(new Date().getFullYear() + 2),
  color: z.string().optional(),
  mileage: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  description: z.string().max(500).optional(),
});

type MintFormData = z.infer<typeof mintSchema>;

export default function MintPage() {
  const router = useRouter();
  const { isAuthenticated, isConnected, address } = useWalletAuth();
  const { mintCar, isMinting } = useGasless();
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<MintFormData>({
    resolver: zodResolver(mintSchema),
    mode: 'onChange',
  });

  const watchedVin = watch('vin');

  // Redirect if wallet not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Wallet Connection Required</h2>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to mint a car NFT.
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect if not authenticated (wallet connected but not logged in)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              Your wallet is connected, but you need to sign in to the application to mint a car NFT.
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: MintFormData) => {
    try {
      await mintCar({
        carData: data,
        images,
      });

      toast({
        title: 'Car Minted Successfully!',
        description: 'Your car NFT has been created and submitted for verification.',
      });

      router.push('/profile');
    } catch (error) {
      console.error('Mint error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tokenize Your Car
          </h1>
          <p className="text-lg text-gray-600">
            Turn your car into a digital asset with zero gas fees
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mint Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Car Information
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* VIN */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Vehicle Identification Number (VIN) *
                  </label>
                  <Input
                    {...register('vin')}
                    placeholder="17-character VIN (e.g., 1HGCM82633A123456)"
                    className="font-mono"
                    maxLength={17}
                  />
                  {errors.vin && (
                    <p className="text-sm text-red-600 mt-1">{errors.vin.message}</p>
                  )}
                  {watchedVin && watchedVin.length === 17 && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Valid VIN format
                    </p>
                  )}
                </div>

                {/* Make & Model */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Make *
                    </label>
                    <Input
                      {...register('make')}
                      placeholder="e.g., Toyota"
                    />
                    {errors.make && (
                      <p className="text-sm text-red-600 mt-1">{errors.make.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Model *
                    </label>
                    <Input
                      {...register('model')}
                      placeholder="e.g., Camry"
                    />
                    {errors.model && (
                      <p className="text-sm text-red-600 mt-1">{errors.model.message}</p>
                    )}
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Year *
                  </label>
                  <Input
                    {...register('year', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear() + 2}
                  />
                  {errors.year && (
                    <p className="text-sm text-red-600 mt-1">{errors.year.message}</p>
                  )}
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color
                  </label>
                  <Input
                    {...register('color')}
                    placeholder="e.g., Blue"
                  />
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mileage (miles)
                  </label>
                  <Input
                    {...register('mileage', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g., 50000"
                    min="0"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Asking Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      {...register('price', { valueAsNumber: true })}
                      type="number"
                      placeholder="e.g., 25000"
                      min="0"
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Set your asking price if you plan to list it for sale
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    {...register('description')}
                    placeholder="Additional details about your car..."
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <UploadForm
                    onFilesChange={(files) => setImages(files)}
                    maxFiles={10}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || isMinting}
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Minting Car NFT...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Mint Car NFT (Gas-Free)
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Information Panel */}
          <div className="space-y-6">
            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Tokenize Your Car?</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">0</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Zero Gas Fees</h4>
                    <p className="text-sm text-gray-600">
                      Mint and trade cars without paying any gas fees
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-sm">∞</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Global Marketplace</h4>
                    <p className="text-sm text-gray-600">
                      Trade cars with buyers worldwide instantly
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Verified Ownership</h4>
                    <p className="text-sm text-gray-600">
                      Immutable proof of ownership on the blockchain
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                  <span className="text-sm">Valid 17-character VIN</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                  <span className="text-sm">Car make and model</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                  <span className="text-sm">Manufacturing year</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                  <span className="text-sm">Photos and additional details</span>
                </div>
              </CardContent>
            </Card>

            {/* Network Info */}
            <Card>
              <CardHeader>
                <CardTitle>Network Information</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Network:</span>
                  <Badge variant="outline">Linea Testnet</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Gas Fee:</span>
                  <Badge className="bg-green-600">Free</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Verification:</span>
                  <Badge variant="outline">Required</Badge>
                </div>

                <div className="text-xs text-gray-500 mt-3">
                  Your car will be submitted for verification before listing.
                  This process typically takes 24-48 hours.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

