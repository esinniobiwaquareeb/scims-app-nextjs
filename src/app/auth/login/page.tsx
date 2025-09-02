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
  CardTitle,
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

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  // Load demo users from API
  useEffect(() => {
    const loadDemoUsers = async () => {
      try {
        const response = await authAPI.getDemoUsers();
        if (response.success) {
          setDemoUsers(response.users || []);
        }
      } catch (error) {
        console.error('Failed to load demo users:', error);
        setDemoUsers([]);
      }
    };

    loadDemoUsers();
  }, []);

  const validateForm = (username: string, password: string): string | null => {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters long";
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
        // Redirect to dashboard after successful login
        router.replace('/dashboard');
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError("Login failed. Please try again.");
    }
  };

  const handleDemoLogin = async (demoUser: DemoUser) => {
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
    } catch (error) {
      setError("Demo login failed. Please try manual login or contact administrator.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3">
            <Logo size="lg" />
          </div>
          <CardDescription className="text-sm">
            Stock Control Inventory Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form 
            onSubmit={handleSubmit} 
            className="space-y-3"
            noValidate
          >
            <div className="space-y-1">
              <Label htmlFor="username" className="text-sm">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={isLoading}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10 h-9"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="py-3 border-2">
                <AlertDescription className="text-sm font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full h-9"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          {demoUsers.length > 0 && (
            <div className="pt-2 border-t">
              <div className="mb-3">
                <Alert className="py-2 bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800 text-xs">
                    <strong>Demo Mode:</strong> Quick login with demo accounts for testing.
                  </AlertDescription>
                </Alert>
              </div>
              <p className="font-medium text-sm mb-2">Demo Accounts:</p>
              <div className="space-y-2">
                {demoUsers.map((demoUser, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded border text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">{demoUser.role}</div>
                      <div className="text-muted-foreground text-xs">
                        <span className="font-medium">User:</span> {demoUser.username} | 
                        <span className="font-medium ml-1">Pass:</span> <code className="bg-background px-1 rounded text-xs">123456</code>
                      </div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {demoUser.description}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin(demoUser)}
                      disabled={isLoading}
                      className="ml-2 h-7 px-3 text-xs"
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                <strong>Note:</strong> Demo accounts use password <code className="bg-background px-1 rounded text-xs">123456</code>. 
                Regular users can login manually with their credentials.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}