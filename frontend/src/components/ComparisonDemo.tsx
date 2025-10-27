'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { formatPrice } from '../utils/formatters';
import { 
  CheckCircle, 
  X, 
  DollarSign, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface ComparisonDemoProps {
  className?: string;
}

export default function ComparisonDemo({ className }: ComparisonDemoProps) {
  const [selectedScenario, setSelectedScenario] = useState<'mint' | 'list' | 'purchase'>('mint');

  const scenarios = {
    mint: {
      title: 'Minting a Car NFT',
      description: 'Creating an NFT for your vehicle',
      traditionalCost: 15.50,
      autotokenCost: 0,
      savings: 15.50
    },
    list: {
      title: 'Listing a Car for Sale',
      description: 'Creating a marketplace listing',
      traditionalCost: 8.25,
      autotokenCost: 0,
      savings: 8.25
    },
    purchase: {
      title: 'Purchasing a Car',
      description: 'Buying a car from the marketplace',
      traditionalCost: 22.75,
      autotokenCost: 0,
      savings: 22.75
    }
  };

  const currentScenario = scenarios[selectedScenario];

  const features = [
    {
      feature: 'Gas Fees',
      traditional: 'High ($5-25 per transaction)',
      autotoken: 'Zero gas fees',
      traditionalIcon: X,
      autotokenIcon: CheckCircle,
      traditionalColor: 'text-red-600',
      autotokenColor: 'text-green-600'
    },
    {
      feature: 'Transaction Speed',
      traditional: 'Depends on network congestion',
      autotoken: 'Fast with meta-transactions',
      traditionalIcon: AlertTriangle,
      autotokenIcon: CheckCircle,
      traditionalColor: 'text-yellow-600',
      autotokenColor: 'text-green-600'
    },
    {
      feature: 'User Experience',
      traditional: 'Complex wallet interactions',
      autotoken: 'Simple, gas-free experience',
      traditionalIcon: X,
      autotokenIcon: CheckCircle,
      traditionalColor: 'text-red-600',
      autotokenColor: 'text-green-600'
    },
    {
      feature: 'Security',
      traditional: 'Standard blockchain security',
      autotoken: 'Enhanced with escrow options',
      traditionalIcon: Shield,
      autotokenIcon: Shield,
      traditionalColor: 'text-blue-600',
      autotokenColor: 'text-green-600'
    },
    {
      feature: 'Platform Fees',
      traditional: '2-5% + gas fees',
      autotoken: '2% only (no gas fees)',
      traditionalIcon: DollarSign,
      autotokenIcon: CheckCircle,
      traditionalColor: 'text-red-600',
      autotokenColor: 'text-green-600'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Platform Comparison
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Scenario Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Transaction Scenario:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(scenarios).map(([key, scenario]) => (
                <Button
                  key={key}
                  onClick={() => setSelectedScenario(key as any)}
                  variant={selectedScenario === key ? 'default' : 'outline'}
                  className={`h-auto p-4 text-left ${
                    selectedScenario === key 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="font-medium">{scenario.title}</div>
                    <div className="text-sm opacity-75">{scenario.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Cost Comparison */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Cost Comparison for {currentScenario.title}:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traditional Platform */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <X className="w-5 h-5" />
                    Traditional Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Gas Fees:</span>
                      <span className="font-bold text-red-600">
                        ${currentScenario.traditionalCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Platform Fee:</span>
                      <span className="font-medium">2-5%</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Cost:</span>
                        <span className="text-red-600">
                          ${currentScenario.traditionalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AutoToken Platform */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    AutoToken Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Gas Fees:</span>
                      <span className="font-bold text-green-600">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Platform Fee:</span>
                      <span className="font-medium">2% only</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Cost:</span>
                        <span className="text-green-600">$0.00</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Savings Highlight */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">You Save:</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  ${currentScenario.savings.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-green-700 mt-1">
                That's {((currentScenario.savings / currentScenario.traditionalCost) * 100).toFixed(0)}% savings per transaction!
              </div>
            </div>
          </div>

          {/* Feature Comparison */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Feature Comparison:</h3>
            <div className="space-y-3">
              {features.map((feature, index) => {
                const TraditionalIcon = feature.traditionalIcon;
                const AutoTokenIcon = feature.autotokenIcon;
                
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-800">{feature.feature}</div>
                    
                    <div className="flex items-center gap-2">
                      <TraditionalIcon className={`w-4 h-4 ${feature.traditionalColor}`} />
                      <span className={`text-sm ${feature.traditionalColor}`}>
                        {feature.traditional}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <AutoTokenIcon className={`w-4 h-4 ${feature.autotokenColor}`} />
                      <span className={`text-sm ${feature.autotokenColor}`}>
                        {feature.autotoken}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benefits Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Why Choose AutoToken?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Zero gas fees for all transactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Simple, user-friendly interface</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Secure escrow protection</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>VIN verification system</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Fast transaction processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Low platform fees (2% only)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

