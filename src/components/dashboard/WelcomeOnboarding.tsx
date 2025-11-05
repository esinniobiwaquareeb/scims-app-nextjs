'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  X,
  Settings,
  Store,
  Package,
  Users,
  ShoppingCart,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SetupStatus {
  businessSettings: boolean;
  hasStores: boolean;
  hasProducts: boolean;
  hasStaff: boolean;
  hasFirstSale: boolean;
  storesCount: number;
  productsCount: number;
  staffCount: number;
  salesCount: number;
}

interface WelcomeOnboardingProps {
  onDismiss?: () => void;
}

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({ onDismiss }) => {
  const { user, currentBusiness } = useAuth();
  const router = useRouter();
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    const checkSetupStatus = async () => {
      // Only show for business admins
      if (!currentBusiness?.id || user?.role !== 'business_admin') {
        setIsLoading(false);
        setIsOpen(false);
        return;
      }

      // Check if already dismissed
      const dismissed = localStorage.getItem(`onboarding_dismissed_${currentBusiness.id}`);
      if (dismissed === 'true') {
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/business/${currentBusiness.id}/setup-status`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSetupStatus(data.setupStatus);
            setCompletionPercentage(data.completionPercentage);
            setIsSetupComplete(data.isSetupComplete);
            
            // Auto-dismiss if setup is complete (but allow manual dismissal)
            if (data.isSetupComplete) {
              // Don't auto-dismiss, let user see completion message
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch setup status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSetupStatus();
  }, [currentBusiness?.id, user?.role]);

  const handleDismiss = () => {
    setIsOpen(false);
    // Store dismissal in localStorage
    if (currentBusiness?.id) {
      localStorage.setItem(`onboarding_dismissed_${currentBusiness.id}`, 'true');
    }
    onDismiss?.();
  };

  const handleSkip = () => {
    handleDismiss();
  };

  const handleAction = (action: string) => {
    handleDismiss();
    router.push(action);
  };

  const steps = [
    {
      id: 'businessSettings',
      title: 'Configure Business Settings',
      description: 'Set up your business profile, currency, and branding',
      icon: Settings,
      action: '/business-settings',
      completed: setupStatus?.businessSettings || false,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20'
    },
    {
      id: 'stores',
      title: 'Add Your First Store',
      description: 'Create a store location to manage your inventory',
      icon: Store,
      action: '/stores',
      completed: setupStatus?.hasStores || false,
      count: setupStatus?.storesCount || 0,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20'
    },
    {
      id: 'products',
      title: 'Add Products',
      description: 'Start adding products to your inventory',
      icon: Package,
      action: '/products',
      completed: setupStatus?.hasProducts || false,
      count: setupStatus?.productsCount || 0,
      color: 'text-green-600 bg-green-50 dark:bg-green-950/20'
    },
    {
      id: 'staff',
      title: 'Invite Team Members',
      description: 'Add staff and cashiers to help manage your business',
      icon: Users,
      action: '/staff',
      completed: setupStatus?.hasStaff || false,
      count: setupStatus?.staffCount || 0,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20'
    },
    {
      id: 'firstSale',
      title: 'Make Your First Sale',
      description: 'Process a transaction using the POS system',
      icon: ShoppingCart,
      action: '/pos',
      completed: setupStatus?.hasFirstSale || false,
      color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/20'
    }
  ];

  const completedStepsCount = steps.filter(step => step.completed).length;
  const nextStep = steps.find(step => !step.completed);

  // Don't show if not business admin
  if (user?.role !== 'business_admin') {
    return null;
  }

  if (isLoading || !setupStatus) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b px-6 py-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute right-4 top-4 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-start gap-4 pr-8">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-1.5">
                Welcome to SCIMS, {user?.name || user?.username}!
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Let&apos;s get your business set up in just a few simple steps
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Setup Progress</span>
              <span className="text-sm font-medium text-primary">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2.5" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedStepsCount} of {steps.length} steps completed</span>
              {nextStep && (
                <span className="font-medium">Next: {nextStep.title}</span>
              )}
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.completed;
              const isNext = !isCompleted && step.id === nextStep?.id;
              
              return (
                <Card
                  key={step.id}
                  className={`group transition-all duration-200 hover:shadow-md ${
                    isCompleted
                      ? 'bg-muted/30 border-muted opacity-75'
                      : isNext
                      ? 'border-primary/50 bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isCompleted 
                          ? 'bg-green-100 dark:bg-green-950/30' 
                          : isNext
                          ? 'bg-primary/10 ring-2 ring-primary/20'
                          : step.color
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Icon className={`w-6 h-6 ${
                            isNext 
                              ? 'text-primary' 
                              : 'text-muted-foreground'
                          }`} />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-base mb-1 ${
                              isCompleted 
                                ? 'text-muted-foreground line-through' 
                                : 'text-foreground'
                            }`}>
                              {step.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                          {step.count !== undefined && step.count > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="shrink-0 font-semibold"
                            >
                              {step.count}
                            </Badge>
                          )}
                        </div>
                        
                        {!isCompleted && (
                          <Button
                            variant={isNext ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAction(step.action)}
                            className="mt-3 group-hover:shadow-sm"
                          >
                            {step.id === 'firstSale' ? 'Open POS' : 'Get Started'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Next Step CTA */}
          {nextStep && !isSetupComplete && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm text-foreground">Ready to continue?</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Complete <span className="font-medium text-foreground">{nextStep.title}</span> to move forward
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAction(nextStep.action)}
                    className="shrink-0 font-semibold"
                  >
                    Continue Setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Message */}
          {isSetupComplete && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border-green-200 dark:border-green-800 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-green-900 dark:text-green-100 mb-1">
                      🎉 Setup Complete!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You&apos;re all set! Start managing your business with SCIMS.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleDismiss}
                    className="shrink-0 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                  >
                    Got it!
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/docs/getting-started')}
              className="text-sm"
            >
              View Full Guide
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

