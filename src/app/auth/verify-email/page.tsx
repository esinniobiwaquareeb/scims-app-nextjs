'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  RefreshCw,
} from 'lucide-react';
import Logo from '@/components/common/Logo';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string;
    name: string;
  } | null>(null);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  const handleVerification = React.useCallback(async (verificationToken?: string) => {
    const tokenToUse = verificationToken || token;
    if (!tokenToUse) {
      setError('No verification token provided');
      return;
    }

    setIsVerifying(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToUse }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Email verified successfully! You can now log in to your account.');
        setUser(result.user);
      } else {
        setError(result.error || 'Email verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setError('Email verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }, [token]);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      // Auto-verify if token is present
      handleVerification(tokenParam);
    }
  }, [searchParams, handleVerification]);



  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address to resend the verification email.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message || 'Verification email has been sent. Please check your inbox and click the verification link.');
      } else {
        setError(result.error || 'Failed to resend verification email. Please try again.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4">
            <Logo size="xl" />
          </div>
          <CardTitle className="text-xl">Email Verification</CardTitle>
          <CardDescription className="text-sm">
            Verify your email address to complete your SCIMS registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerifying && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                Verifying your email address...
              </p>
            </div>
          )}

          {success && !isVerifying && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
              {user && (
                <div className="text-sm text-muted-foreground">
                  <p>Welcome, <strong>{user.name}</strong>!</p>
                  <p>Your account is now ready to use.</p>
                </div>
              )}
              <Button
                onClick={handleGoToLogin}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          )}

          {error && !isVerifying && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              <div className="space-y-4">
                {token && (
                  <Button
                    onClick={() => handleVerification()}
                    variant="outline"
                    className="w-full"
                    disabled={!token}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                <div className="space-y-2">
                  <Label htmlFor="resend-email">Email Address</Label>
                  <Input
                    id="resend-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGoToLogin}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}

          {!isVerifying && !success && !error && !token && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Please check your email for a verification link.</p>
                <p>Click the link in the email to verify your account.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="resend-email-no-token">Email Address</Label>
                  <Input
                    id="resend-email-no-token"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGoToLogin}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>Having trouble? Contact our support team for assistance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
