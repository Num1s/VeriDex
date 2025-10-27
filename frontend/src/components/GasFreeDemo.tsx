'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Zap, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Shield, 
  DollarSign,
  Play,
  RotateCcw
} from 'lucide-react';

interface GasFreeDemoProps {
  className?: string;
}

export default function GasFreeDemo({ className }: GasFreeDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'User Signs Intent',
      description: 'User signs transaction intent (not actual transaction)',
      icon: Shield,
      color: 'blue',
      gasUsed: '0',
      time: '1s'
    },
    {
      id: 2,
      title: 'Relayer Processes',
      description: 'Relayer service receives signed intent and processes it',
      icon: Zap,
      color: 'yellow',
      gasUsed: '0',
      time: '2s'
    },
    {
      id: 3,
      title: 'Smart Contract Executes',
      description: 'Smart contract executes function with relayer paying gas',
      icon: CheckCircle,
      color: 'green',
      gasUsed: '0',
      time: '3s'
    },
    {
      id: 4,
      title: 'Transaction Complete',
      description: 'User receives confirmation without spending gas',
      icon: DollarSign,
      color: 'purple',
      gasUsed: '0',
      time: '4s'
    }
  ];

  const handleStartDemo = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsRunning(false);
  };

  const getStepColor = (stepIndex: number, color: string) => {
    if (stepIndex < currentStep) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (stepIndex === currentStep) {
      return `bg-${color}-100 text-${color}-800 border-${color}-200`;
    } else {
      return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getIconColor = (stepIndex: number, color: string) => {
    if (stepIndex < currentStep) {
      return 'text-green-600';
    } else if (stepIndex === currentStep) {
      return `text-${color}-600`;
    } else {
      return 'text-gray-400';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Gas-Free Transaction Demo
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleStartDemo}
                disabled={isRunning}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isRunning ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Demo
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Transaction Progress</span>
              <span>{currentStep + 1} / {steps.length}</span>
            </div>
            <Progress value={(currentStep + 1) / steps.length * 100} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="relative">
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200">
                      <div 
                        className={`w-full h-full transition-all duration-500 ${
                          index < currentStep ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                  
                  <div className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                    isActive ? 'border-blue-300 bg-blue-50' : 
                    isCompleted ? 'border-green-300 bg-green-50' : 
                    'border-gray-200 bg-white'
                  }`}>
                    {/* Step Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive ? 'border-blue-400 bg-blue-100' :
                      isCompleted ? 'border-green-400 bg-green-100' :
                      'border-gray-300 bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${getIconColor(index, step.color)}`} />
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-semibold ${
                          isActive ? 'text-blue-900' :
                          isCompleted ? 'text-green-900' :
                          'text-gray-700'
                        }`}>
                          {step.title}
                        </h3>
                        <Badge className={getStepColor(index, step.color)}>
                          {isCompleted ? 'Completed' : isActive ? 'Active' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <p className={`text-sm mb-3 ${
                        isActive ? 'text-blue-700' :
                        isCompleted ? 'text-green-700' :
                        'text-gray-600'
                      }`}>
                        {step.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 font-medium">Gas: {step.gasUsed} ETH</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-500">Time: {step.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    {index < steps.length - 1 && (
                      <div className="flex-shrink-0">
                        <ArrowRight className={`w-5 h-5 ${
                          index < currentStep ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Transaction Complete!</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Gas Used:</span>
                <span className="font-medium text-green-600">0 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Cost:</span>
                <span className="font-medium text-green-600">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="font-medium">2% only</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
