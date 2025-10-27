'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { mockStats, mockTransactions } from '../data/mockData';
import { formatPrice } from '../utils/formatters';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Car, 
  CheckCircle, 
  Clock,
  AlertCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface SimulationStatsProps {
  className?: string;
}

export default function SimulationStats({ className }: SimulationStatsProps) {
  const [stats, setStats] = useState(mockStats);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update stats with some random variation
    setStats(prev => ({
      ...prev,
      totalListings: prev.totalListings + Math.floor(Math.random() * 3),
      activeListings: prev.activeListings + Math.floor(Math.random() * 2),
      totalVolume: (parseFloat(prev.totalVolume) + Math.random() * 2).toFixed(1),
      sellThroughRate: Math.min(100, prev.sellThroughRate + Math.floor(Math.random() * 5))
    }));
    
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Car className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <div className="text-sm text-gray-600">Total Cars</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{formatPrice(stats.totalVolume)}</div>
            <div className="text-sm text-gray-600">Total Volume</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sell-Through Rate</span>
                <span className="font-medium">{stats.sellThroughRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Price</span>
                <span className="font-medium">{formatPrice(stats.averagePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Transactions</span>
                <span className="font-medium">{stats.totalTransactions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Gas Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Gas Saved</span>
                <span className="font-medium text-green-600">0 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transactions</span>
                <span className="font-medium">{stats.totalTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Gas Fee</span>
                <span className="font-medium text-green-600">$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Live Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Stats
                  </>
                )}
              </Button>
              <div className="text-xs text-gray-500 text-center">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(transaction.status)}
                  <div>
                    <div className="font-medium text-sm">
                      {transaction.type === 'purchase' ? 'Purchase' : 
                       transaction.type === 'sale' ? 'Sale' : 'Listing'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {formatPrice(transaction.price)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Gas: {transaction.gasUsed} ETH
                    </div>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gas-Free Benefits */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Gas-Free Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Traditional Platform:</span>
                <span className="text-sm font-medium text-red-600">$15-60 gas fees</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">AutoToken Platform:</span>
                <span className="text-sm font-medium text-green-600">$0 gas fees</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Savings per transaction:</span>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Platform fee:</span>
                <span className="text-sm font-medium">2% only</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

