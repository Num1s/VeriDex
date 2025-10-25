'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Send, AlertCircle } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (newOwnerAddress: string) => Promise<void>;
  carInfo: {
    make: string;
    model: string;
    year: number;
    vin: string;
  };
}

export default function TransferModal({
  isOpen,
  onClose,
  onTransfer,
  carInfo,
}: TransferModalProps) {
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTransfer = async () => {
    setError('');
    
    // Validate address
    if (!newOwnerAddress) {
      setError('Please enter a wallet address');
      return;
    }

    if (newOwnerAddress.length !== 42 || !newOwnerAddress.startsWith('0x')) {
      setError('Invalid wallet address format');
      return;
    }

    try {
      setIsTransferring(true);
      await onTransfer(newOwnerAddress);
      setNewOwnerAddress('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full shadow-2xl border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Send className="w-5 h-5" />
              Transfer Ownership
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Car Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Asset Information</h4>
            <div className="text-sm space-y-1">
              <p className="text-gray-700">
                <span className="font-medium">Vehicle:</span> {carInfo.year} {carInfo.make} {carInfo.model}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">VIN:</span> {carInfo.vin}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900">Warning:</p>
              <p className="text-yellow-800">
                This action will permanently transfer ownership to the specified address. This cannot be undone.
              </p>
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              New Owner Wallet Address *
            </label>
            <Input
              type="text"
              placeholder="0x..."
              value={newOwnerAddress}
              onChange={(e) => setNewOwnerAddress(e.target.value)}
              className="font-mono text-sm border-2 border-gray-300 focus:border-purple-500"
              disabled={isTransferring}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the Ethereum wallet address of the new owner
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isTransferring}
              className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={isTransferring || !newOwnerAddress}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg"
            >
              {isTransferring ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Transferring...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Transfer Ownership
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

