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
        title: 'Asset Token Created!',
        description: 'Your asset has been tokenized and submitted to the registry for verification.',
      });

      router.push('/profile');
    } catch (error) {
      console.error('Mint error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-4">
            🌐 Veridex RWA Hub
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tokenize Your Real-World Asset
          </h1>
          <p className="text-lg text-gray-600">
            Create a blockchain-verified digital twin of your physical asset
          </p>
          <p className="text-sm text-gray-500 mt-2">
            MVP Focus: Automotive Assets • Zero Gas Fees • Immutable Ownership Records
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tokenization Form */}
          <Card className="shadow-xl border-2 border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Car className="w-5 h-5 text-purple-600" />
                Asset Information
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                Enter details to create an immutable ownership record
              </p>
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

                {/* Asset Value */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estimated Asset Value (USD)
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
                    Optional: Current market value for reference and future transfers
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
                  className="w-full text-lg py-6 gradient-mixed text-white shadow-primary hover:shadow-xl transition-all font-bold h-auto"
                  disabled={!isValid || isMinting}
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Asset Token...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Tokenize Asset (Gas-Free)
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Information Panel */}
          <div className="space-y-6">
            {/* Benefits */}
            <Card className="shadow-xl border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-purple-900">Why Tokenize Real-World Assets?</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">0</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Zero Gas Fees</h4>
                    <p className="text-sm text-gray-600">
                      Create and transfer ownership records without transaction costs
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-sm">🔗</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Blockchain Verified</h4>
                    <p className="text-sm text-gray-600">
                      Immutable ownership records stored permanently on-chain
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold text-sm">🌐</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Global Registry</h4>
                    <p className="text-sm text-gray-600">
                      Access and verify asset ownership from anywhere
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="shadow-xl border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-purple-900">Requirements</CardTitle>
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
            <Card className="shadow-xl border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-purple-900">Network Information</CardTitle>
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
                  Your asset will be submitted for verification before being added to the registry.
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

