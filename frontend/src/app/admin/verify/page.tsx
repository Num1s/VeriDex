'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useWalletAuth } from '../../../hooks/useWalletAuth';
import { useToast } from '../../../hooks/useToast';
import { carsAPI, gaslessAPI } from '../../../services/api';
import VerificationBadge from '../../../components/VerificationBadge';
import { formatAddress, formatDate, formatCarName } from '../../../utils/formatters';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
  FileText,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  TrendingUp,
  Settings,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PendingVerification {
  id: string;
  tokenId: number;
  requestId: number;
  vin: string;
  make: string;
  model: string;
  year: number;
  requesterAddress: string;
  documents: Array<{ url: string; name: string }>;
  images: Array<{ url: string; filename: string }>;
  createdAt: string;
  priority: string;
  estimatedValue?: string;
  riskScore?: number;
}

export default function AdminVerifyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useWalletAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCar, setSelectedCar] = useState<PendingVerification | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  // Mock pending verifications data (in real app, this would come from backend)
  const mockPendingVerifications: PendingVerification[] = [
    {
      id: '1',
      tokenId: 0,
      requestId: 1,
      vin: '1HGCM82633A123456',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      requesterAddress: '0x1234567890123456789012345678901234567890',
      documents: [
        { url: 'https://ipfs.io/ipfs/Qm123', name: 'Title Document' },
        { url: 'https://ipfs.io/ipfs/Qm456', name: 'Registration' },
      ],
      images: [
        { url: '/placeholder-car.jpg', filename: 'front.jpg' },
        { url: '/placeholder-car.jpg', filename: 'side.jpg' },
      ],
      createdAt: new Date().toISOString(),
      priority: 'high',
      estimatedValue: '25000',
      riskScore: 2.3,
    },
    {
      id: '2',
      tokenId: 1,
      requestId: 2,
      vin: '2HGCM82633A654321',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      requesterAddress: '0x0987654321098765432109876543210987654321',
      documents: [
        { url: 'https://ipfs.io/ipfs/Qm789', name: 'Title Document' },
      ],
      images: [
        { url: '/placeholder-car.jpg', filename: 'exterior.jpg' },
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      priority: 'normal',
      estimatedValue: '22000',
      riskScore: 1.5,
    },
  ];

  // Verify car mutation
  const verifyCarMutation = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: number; status: 'approved' | 'rejected'; notes: string }) => {
      // In real app, this would call the oracle contract
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: 'Verification Complete',
        description: 'Car verification has been processed successfully',
      });
      setSelectedCar(null);
      setVerificationNotes('');
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
    },
    onError: (error) => {
      toast({
        title: 'Verification Failed',
        description: 'Failed to process verification',
        variant: 'destructive',
      });
    },
  });

  // Check if user has admin/verifier access
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              This page is only accessible to verified administrators.
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleVerification = async (status: 'approved' | 'rejected') => {
    if (!selectedCar || !verificationNotes.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide verification notes',
        variant: 'destructive',
      });
      return;
    }

    await verifyCarMutation.mutateAsync({
      requestId: selectedCar.requestId,
      status,
      notes: verificationNotes,
    });
  };

  const filteredVerifications = mockPendingVerifications.filter(verification => {
    const matchesSearch = !searchQuery || 
      verification.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verification.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verification.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = filterPriority === 'all' || verification.priority === filterPriority;

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Shield className="w-3 h-3 mr-1" />
                Verifier
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {filteredVerifications.length} Pending
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{filteredVerifications.length}</div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-600">Approved Today</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-600">Rejected Today</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm text-gray-600">Approval Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Queue */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Verification Queue
                </CardTitle>

                {/* Filters */}
                <div className="flex gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by VIN, make, or model..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {filteredVerifications.map((verification) => (
                    <div
                      key={verification.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedCar?.id === verification.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCar(verification)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={verification.images[0]?.url || '/placeholder-car.jpg'}
                            alt={formatCarName(verification)}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">
                              {formatCarName(verification)}
                            </h3>

                            <Badge
                              variant={verification.priority === 'urgent' ? 'destructive' : 
                                      verification.priority === 'high' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {verification.priority}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <div>VIN: {verification.vin}</div>
                            <div>Requested by: {formatAddress(verification.requesterAddress)}</div>
                            <div>Submitted: {formatDate(verification.createdAt)}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          {verification.estimatedValue && (
                            <div className="text-sm font-medium">
                              Est. ${parseFloat(verification.estimatedValue).toLocaleString()}
                            </div>
                          )}
                          {verification.riskScore && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <AlertTriangle className="w-3 h-3" />
                              Risk: {verification.riskScore}/10
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredVerifications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No pending verifications</h3>
                      <p>All verification requests have been processed.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Verification Details
                </CardTitle>
              </CardHeader>

              <CardContent>
                {selectedCar ? (
                  <div className="space-y-6">
                    {/* Car Information */}
                    <div>
                      <h3 className="font-semibold mb-3">{formatCarName(selectedCar)}</h3>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">VIN:</span>
                          <span className="font-mono">{selectedCar.vin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Token ID:</span>
                          <span className="font-mono">{selectedCar.tokenId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Requester:</span>
                          <span className="font-mono">{formatAddress(selectedCar.requesterAddress)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority:</span>
                          <Badge
                            variant={selectedCar.priority === 'urgent' ? 'destructive' : 
                                    selectedCar.priority === 'high' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {selectedCar.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <h4 className="font-medium mb-2">Car Images</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedCar.images.map((image, index) => (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={image.url}
                              alt={image.filename}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h4 className="font-medium mb-2">Documents</h4>
                      <div className="space-y-2">
                        {selectedCar.documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm flex-1">{doc.name}</span>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    {selectedCar.riskScore && (
                      <div>
                        <h4 className="font-medium mb-2">Risk Assessment</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium">
                              Risk Score: {selectedCar.riskScore}/10
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {selectedCar.riskScore < 3 ? 'Low risk - Standard verification recommended' :
                             selectedCar.riskScore < 7 ? 'Medium risk - Additional checks recommended' :
                             'High risk - Thorough verification required'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verification Notes */}
                    <div>
                      <h4 className="font-medium mb-2">Verification Notes</h4>
                      <Textarea
                        placeholder="Add your verification notes here..."
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => handleVerification('approved')}
                        disabled={verifyCarMutation.isPending || !verificationNotes.trim()}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Verification
                      </Button>

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleVerification('rejected')}
                        disabled={verifyCarMutation.isPending || !verificationNotes.trim()}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Verification
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedCar(null);
                          setVerificationNotes('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Select a Car</h3>
                    <p>Choose a car from the list to start verification</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Statistics
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Car className="w-4 h-4 mr-2" />
                  Manage Escrows
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  User Management
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
