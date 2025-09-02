'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, ArrowLeft, RefreshCw, Bug, Search } from 'lucide-react';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showRefresh?: boolean;
  showGoBack?: boolean;
  showGoHome?: boolean;
  customActions?: React.ReactNode;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 500,
  title,
  message,
  showRefresh = true,
  showGoBack = true,
  showGoHome = true,
  customActions
}) => {
  const router = useRouter();

  const getDefaultTitle = (code: number) => {
    switch (code) {
      case 404:
        return 'Page Not Found';
      case 403:
        return 'Access Denied';
      case 500:
        return 'Server Error';
      case 503:
        return 'Service Unavailable';
      default:
        return 'Something Went Wrong';
    }
  };

  const getDefaultMessage = (code: number) => {
    switch (code) {
      case 404:
        return 'Sorry, we couldn\'t find the page you\'re looking for. It might have been moved, deleted, or you entered the wrong URL.';
      case 403:
        return 'You don\'t have permission to access this resource. Please contact your administrator if you believe this is an error.';
      case 500:
        return 'We\'re experiencing some technical difficulties. Our team has been notified and is working to fix the issue.';
      case 503:
        return 'The service is temporarily unavailable. Please try again in a few moments.';
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
  };

  const getIcon = (code: number) => {
    switch (code) {
      case 404:
        return <Search className="w-8 h-8 text-blue-600" />;
      case 403:
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 500:
      case 503:
        return <Bug className="w-8 h-8 text-red-600" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
    }
  };

  const getIconBgColor = (code: number) => {
    switch (code) {
      case 404:
        return 'bg-blue-100';
      case 403:
        return 'bg-yellow-100';
      case 500:
      case 503:
        return 'bg-red-100';
      default:
        return 'bg-red-100';
    }
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const errorTitle = title || getDefaultTitle(statusCode);
  const errorMessage = message || getDefaultMessage(statusCode);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className={`mx-auto mb-4 w-16 h-16 ${getIconBgColor(statusCode)} rounded-full flex items-center justify-center`}>
              {getIcon(statusCode)}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {errorTitle}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-500">
              <p>Error Code: {statusCode}</p>
            </div>
            
            {customActions ? (
              customActions
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {showGoHome && (
                  <Button 
                    onClick={handleGoHome}
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                )}
                
                {showGoBack && (
                  <Button 
                    variant="outline" 
                    onClick={handleGoBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                )}
              </div>
            )}
            
            {showRefresh && (
              <Button 
                variant="ghost" 
                onClick={handleRefresh}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            If you continue to experience issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};
