'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Eye,
  EyeOff,
  Building2,
  User,
  MapPin,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import Logo from '@/components/common/Logo';

interface Country {
  id: string;
  name: string;
  code: string;
}

interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
}

interface Language {
  id: string;
  name: string;
  code: string;
  native_name: string;
}

const STEPS = [
  { id: 1, title: 'Account', icon: User },
  { id: 2, title: 'Business', icon: Building2 },
  { id: 3, title: 'Settings', icon: MapPin },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // User data
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    
    // Business data
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    countryId: '',
    currencyId: '',
    languageId: ''
  });

  // Reference data
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // Load reference data
  React.useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [countriesRes, currenciesRes, languagesRes] = await Promise.all([
          fetch('/api/countries'),
          fetch('/api/currencies'),
          fetch('/api/languages')
        ]);

        if (countriesRes.ok) {
          const countriesData = await countriesRes.json();
          setCountries(countriesData.countries || []);
        }

        if (currenciesRes.ok) {
          const currenciesData = await currenciesRes.json();
          setCurrencies(currenciesData.currencies || []);
        }

        if (languagesRes.ok) {
          const languagesData = await languagesRes.json();
          setLanguages(languagesData.languages || []);
        }
      } catch (error) {
        console.error('Failed to load reference data:', error);
      }
    };

    loadReferenceData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!formData.name.trim()) return 'Full name is required';
      if (!formData.username.trim()) return 'Username is required';
      if (formData.username.length < 3) return 'Username must be at least 3 characters';
      if (!formData.email.trim()) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) return 'Please enter a valid email';
      if (!formData.password) return 'Password is required';
      if (formData.password.length < 8) return 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    }
    
    if (step === 2) {
      if (!formData.businessName.trim()) return 'Business name is required';
      if (!formData.businessType) return 'Business type is required';
    }

    return null;
  };

  const handleNext = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Get Your FREE Website + SCIMS Account</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Complete in 3 simple steps
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            🎁 FREE ₦500,000 Website Included
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <span className={`mt-2 text-xs sm:text-sm font-medium ${
                        isActive ? 'text-primary' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            <CardTitle className="text-center">
              Step {currentStep} of {STEPS.length}: {STEPS.find(s => s.id === currentStep)?.title}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 1 && 'Create your account with email and password'}
              {currentStep === 2 && 'Tell us about your business'}
              {currentStep === 3 && 'Set your regional preferences'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Account Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password (min 8 characters)"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={togglePasswordVisibility}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={toggleConfirmPasswordVisibility}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        type="text"
                        placeholder="Enter your business name"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => handleInputChange('businessType', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail Store</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="pharmacy">Pharmacy</SelectItem>
                          <SelectItem value="service">Service Business</SelectItem>
                          <SelectItem value="hybrid">Hybrid Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessPhone">Business Phone</Label>
                      <Input
                        id="businessPhone"
                        type="tel"
                        placeholder="Enter business phone"
                        value={formData.businessPhone}
                        onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="businessEmail">Business Email</Label>
                      <Input
                        id="businessEmail"
                        type="email"
                        placeholder="Enter business email (optional)"
                        value={formData.businessEmail}
                        onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="businessAddress">Business Address</Label>
                      <Input
                        id="businessAddress"
                        type="text"
                        placeholder="Enter your business address (optional)"
                        value={formData.businessAddress}
                        onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Regional Settings */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    These settings can be changed later in your account settings.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={formData.countryId}
                        onValueChange={(value) => handleInputChange('countryId', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currencyId}
                        onValueChange={(value) => handleInputChange('currencyId', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.id} value={currency.id}>
                              {currency.name} ({currency.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={formData.languageId}
                        onValueChange={(value) => handleInputChange('languageId', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((language) => (
                            <SelectItem key={language.id} value={language.id}>
                              {language.native_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                
                <div className="flex-1 flex gap-4">
                  {currentStep < STEPS.length ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Get FREE Website + Create Account'
                      )}
                    </Button>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/auth/login')}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Already have an account?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
