'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import Logo from '@/components/common/Logo';
import { DemoUser } from "@/types/auth";
import { useRouter } from "next/navigation";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [isDemoModeEnabled, setIsDemoModeEnabled] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  // Load remembered username on mount
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('remembered_username');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, []);

  // Helper function to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Load platform settings and demo users
  useEffect(() => {
    const loadPlatformSettings = async () => {
      try {
        // Check if demo mode is enabled
        const settingsResponse = await fetch('/api/platform/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          const demoModeEnabled = settingsData.settings?.demo_mode === true;
          setIsDemoModeEnabled(demoModeEnabled);
          
          // Only load demo users if demo mode is enabled
          if (demoModeEnabled) {
            const demoResponse = await authAPI.getDemoUsers();
            if (demoResponse.success) {
              setDemoUsers(demoResponse.users || []);
            }
          } else {
            setDemoUsers([]);
          }
        }
      } catch (error) {
        console.error('Failed to load platform settings:', error);
        setIsDemoModeEnabled(false);
        setDemoUsers([]);
      }
    };

    loadPlatformSettings();
  }, []);

  const validateForm = (username: string, password: string): string | null => {
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) return "Username or Email is required";
    
    // Check if it's an email format
    const isEmail = trimmedUsername.includes('@');
    
    if (isEmail) {
      if (!isValidEmail(trimmedUsername)) {
        return "Please enter a valid email address";
      }
    } else {
      // Username validation
      if (trimmedUsername.length < 3) {
        return "Username must be at least 3 characters long";
      }
    }
    
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters long";
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm(username, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const result = await login(username.trim(), password);
      
      if (result.success) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('remembered_username', username.trim());
        } else {
          localStorage.removeItem('remembered_username');
        }
        
        // Redirect to dashboard after successful login
        router.replace('/dashboard');
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  const handleDemoLogin = async (demoUser: DemoUser) => {
    // Check if demo mode is enabled
    if (!isDemoModeEnabled) {
      setError("Demo mode is currently disabled. Please use your regular credentials to login.");
      return;
    }

    setUsername(demoUser.username);
    setPassword('123456');
    setError("");
    
    try {
      const result = await login(demoUser.username, '123456');
      
      if (result.success) {
        // Redirect to dashboard after successful demo login
        router.replace('/dashboard');
      } else {
        setError("Demo login failed. Please try manual login or contact administrator.");
      }
    } catch {
      setError("Demo login failed. Please try manual login or contact administrator.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl shadow-lg">
        <CardHeader className="text-center pb-6 pt-8 px-8">
          <div className="mx-auto mb-4">
            <Logo size="lg" />
          </div>
          <CardDescription className="text-base sm:text-lg">
            Complete Business Management + FREE ₦500,000 Website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-8 pb-8">
          <form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium">Username or Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={isLoading}
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-12 h-11 text-base"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Label htmlFor="remember-me" className="text-base font-normal cursor-pointer">
                Remember me
              </Label>
            </div>
            {error && (
              <Alert variant="destructive" className="py-4 border-2">
                <AlertDescription className="text-base font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Button
              variant="link"
              onClick={() => setIsForgotPasswordOpen(true)}
              disabled={isLoading}
              className="text-base text-blue-600 hover:text-blue-800 h-auto p-0"
            >
              Forgot your password?
            </Button>
          </div>
          
          {isDemoModeEnabled && demoUsers.length > 0 && (
            <div className="pt-4 border-t mt-4">
              <div className="mb-4">
                <Alert className="py-3 bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Demo Mode:</strong> Quick login with demo accounts for testing.
                  </AlertDescription>
                </Alert>
              </div>
              <p className="font-medium text-base mb-3">Demo Accounts:</p>
              <div className="space-y-3">
                {demoUsers.map((demoUser, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{demoUser.role}</div>
                      <div className="text-muted-foreground text-sm mt-1">
                        <span className="font-medium">User:</span> {demoUser.username} | 
                        <span className="font-medium ml-1">Pass:</span> <code className="bg-background px-1.5 py-0.5 rounded text-sm">123456</code>
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">
                        {demoUser.description}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin(demoUser)}
                      disabled={isLoading}
                      className="ml-3 h-8 px-4 text-sm"
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <strong>Note:</strong> Demo accounts use password <code className="bg-background px-1.5 py-0.5 rounded text-sm">123456</code>. 
                Regular users can login manually with their credentials.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ForgotPasswordDialog
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onBackToLogin={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}