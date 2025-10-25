'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatAddress } from '../utils/formatters';
import { gaslessAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface TransactionTrackerProps {
  txHash: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'error';

interface TransactionData {
  hash: string;
  status: TransactionStatus;
  blockNumber?: number;
  gasUsed?: string;
  fromAddress: string;
  toAddress?: string;
  methodName: string;
  isGasless: boolean;
  relayerAddress?: string;
  createdAt: string;
  confirmedAt?: string;
  error?: string;
}

export default function TransactionTracker({ 
  txHash, 
  onComplete, 
  onError,
  autoRefresh = true,
  refreshInterval = 3000 
}: TransactionTrackerProps) {
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransactionStatus = useCallback(async () => {
    try {
      const response = await gaslessAPI.getTransactionStatus(txHash);
      const txData = response.data as unknown as TransactionData;
      
      setTransaction(txData);
      setError(null);

      // Handle completion
      if (txData.status === 'confirmed') {
        onComplete?.();
        toast({
          title: 'Transaction Confirmed',
          description: 'Your transaction has been successfully confirmed',
        });
      } else if (txData.status === 'failed' || txData.status === 'error') {
        onError?.(txData.error || 'Transaction failed');
        toast({
          title: 'Transaction Failed',
          description: txData.error || 'Transaction failed to complete',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to fetch transaction status:', err);
      setError('Failed to fetch transaction status');
    } finally {
      setIsLoading(false);
    }
  }, [txHash, onComplete, onError, toast]);

  useEffect(() => {
    if (!txHash) return;

    fetchTransactionStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchTransactionStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [txHash, autoRefresh, refreshInterval, fetchTransactionStatus]);

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getExplorerUrl = (hash: string) => {
    // This would be configured based on the network
    return `https://sepolia.linea.build/tx/${hash}`;
  };

  if (isLoading && !transaction) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading transaction status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !transaction) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transaction Status</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(transaction.status)}
            {getStatusBadge(transaction.status)}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transaction Hash */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Transaction Hash</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm">{formatAddress(transaction.hash)}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(getExplorerUrl(transaction.hash), '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Status</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(transaction.status)}
            <span className="text-sm capitalize">{transaction.status}</span>
          </div>
        </div>

        {/* Block Number */}
        {transaction.blockNumber && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Block Number</span>
            <span className="text-sm font-mono">{transaction.blockNumber.toLocaleString()}</span>
          </div>
        )}

        {/* Gas Used */}
        {transaction.gasUsed && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Gas Used</span>
            <span className="text-sm font-mono">{parseInt(transaction.gasUsed).toLocaleString()}</span>
          </div>
        )}

        {/* Method */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Method</span>
          <span className="text-sm font-mono">{transaction.methodName}</span>
        </div>

        {/* From Address */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">From</span>
          <span className="text-sm font-mono">{formatAddress(transaction.fromAddress)}</span>
        </div>

        {/* To Address */}
        {transaction.toAddress && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">To</span>
            <span className="text-sm font-mono">{formatAddress(transaction.toAddress)}</span>
          </div>
        )}

        {/* Gasless Info */}
        {transaction.isGasless && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium">Gasless Transaction</span>
            </div>
            {transaction.relayerAddress && (
              <div className="mt-1 text-xs text-blue-600">
                Relayer: {formatAddress(transaction.relayerAddress)}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {transaction.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2 text-red-800">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium">Error</div>
                <div className="text-xs mt-1">{transaction.error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Created</span>
            <span className="text-sm">{new Date(transaction.createdAt).toLocaleString()}</span>
          </div>
          {transaction.confirmedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Confirmed</span>
              <span className="text-sm">{new Date(transaction.confirmedAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchTransactionStatus}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
