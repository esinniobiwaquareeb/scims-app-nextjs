import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { 
  useBusinessSettings, 
  useCurrencies, 
  useLanguages, 
  useUpdateBusinessSettings 
} from '../utils/hooks/useStoreData';
import { Header } from './common/Header';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
// Dialog components not used in this component
import { toast } from 'sonner';
import { 
  Building, 
  Palette,
  Receipt,
  Upload,
  Save,
  Eye,
  Calculator,
  Shield,
  Globe,
  RefreshCw,
  Package,
  ChefHat,
  Wrench,
  Calendar
} from 'lucide-react';
import { 
  BUSINESS_TYPES, 
  BUSINESS_TYPE_LABELS, 
  BUSINESS_TYPE_DESCRIPTIONS,
  BUSINESS_TYPE_ICONS 
} from './common/BusinessTypeConstants';

interface BusinessSettingsProps {
  onBack: () => void;
}

interface BusinessSettings {
  currency_id?: string;
  currency_code?: string;
  currency_name?: string;
  currency_symbol?: string;
  language_id?: string;
  language_code?: string;
  language_name?: string;
  language_native_name?: string;
  taxRate: number;
  enableTax: boolean;
  allowReturns: boolean;
  returnPeriodDays: number;
  enableSounds: boolean;
  logo_url: string;
  receiptHeader: string;
  receiptFooter: string;
  returnPolicy: string;
  warrantyInfo: string;
  termsOfService: string;
  privacyPolicy: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  business_type?: string;
  enable_stock_tracking?: boolean;
  enable_inventory_alerts?: boolean;
  enable_restock_management?: boolean;
  enable_recipe_management?: boolean;
  enable_service_booking?: boolean;
  enable_menu_management?: boolean;
  enable_ingredient_tracking?: boolean;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
}

interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}

export const BusinessSettings: React.FC<BusinessSettingsProps> = ({ onBack }) => {
  const { currentBusiness, user } = useAuth();
  const { formatCurrency, translate, playSound } = useSystem();
  const { logActivity } = useActivityLogger();
  const [error, setError] = useState<string | null>(null);

  // Use React Query hooks for data fetching
  const {
    data: currentSettings,
    isLoading: isLoadingSettings,
    error: settingsError
  } = useBusinessSettings(currentBusiness?.id || '', { 
    enabled: !!currentBusiness?.id && user?.role === 'business_admin' 
  });

  const {
    data: currencies = [],
    isLoading: isLoadingCurrencies
  } = useCurrencies();

  const {
    data: languages = [],
    isLoading: isLoadingLanguages
  } = useLanguages();

  // Update business settings mutation
  const updateSettingsMutation = useUpdateBusinessSettings(currentBusiness?.id || '');

  // Combined loading states
  const isLoading = isLoadingSettings;
  const isLoadingRefs = isLoadingCurrencies || isLoadingLanguages;
  const isSaving = updateSettingsMutation.isPending;

  const [localSettings, setLocalSettings] = useState<BusinessSettings>({
    currency_id: '',
    currency_code: 'USD',
    currency_name: 'US Dollar',
    currency_symbol: '$',
    language_id: '',
    language_code: 'en',
    language_name: 'English',
    language_native_name: 'English',
    taxRate: 0,
    enableTax: true,
    allowReturns: true,
    returnPeriodDays: 30,
    enableSounds: true,
    logo_url: '',
    receiptHeader: 'Thank you for shopping with us!',
    receiptFooter: 'Returns accepted within 30 days with receipt.',
    returnPolicy: 'Returns accepted within 30 days with original receipt.',
    warrantyInfo: 'Standard manufacturer warranty applies.',
    termsOfService: '',
    privacyPolicy: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    business_type: 'retail',
    enable_stock_tracking: true,
    enable_inventory_alerts: true,
    enable_restock_management: true,
    enable_recipe_management: false,
    enable_service_booking: false,
    enable_menu_management: false,
    enable_ingredient_tracking: false
  });

  // Update localSettings when currentSettings changes
  useEffect(() => {
    if (currentSettings) {
      const transformedSettings: BusinessSettings = {
        currency_id: currentSettings.currency_id || '',
        currency_code: currentSettings.currency_code || 'USD',
        currency_name: currentSettings.currency_name || 'US Dollar',
        currency_symbol: currentSettings.currency_symbol || '$',
        language_id: currentSettings.language_id || '',
        language_code: currentSettings.language_code || 'en',
        language_name: currentSettings.language_name || 'English',
        language_native_name: currentSettings.language_native_name || 'English',
        taxRate: currentSettings.tax_rate || 0,
        enableTax: currentSettings.enable_tax !== undefined ? currentSettings.enable_tax : false,
        allowReturns: currentSettings.allow_returns !== undefined ? currentSettings.allow_returns : true,
        returnPeriodDays: currentSettings.return_period_days || 30,
        enableSounds: currentSettings.enable_sounds !== undefined ? currentSettings.enable_sounds : true,
        logo_url: currentSettings.logo_url || '',
        receiptHeader: currentSettings.receipt_header || 'Thank you for shopping with us!',
        receiptFooter: currentSettings.receipt_footer || 'Returns accepted within 30 days with receipt.',
        returnPolicy: currentSettings.return_policy || 'Returns accepted within 30 days with original receipt.',
        warrantyInfo: currentSettings.warranty_info || 'Standard manufacturer warranty applies.',
        termsOfService: currentSettings.terms_of_service || '',
        privacyPolicy: currentSettings.privacy_policy || '',
        primaryColor: currentSettings.primary_color || '#3B82F6',
        secondaryColor: currentSettings.secondary_color || '#10B981',
        accentColor: currentSettings.accent_color || '#F59E0B',
        business_type: currentSettings.business_type || 'retail',
        enable_stock_tracking: currentSettings.enable_stock_tracking || true,
        enable_inventory_alerts: currentSettings.enable_inventory_alerts || true,
        enable_restock_management: currentSettings.enable_restock_management || true,
        enable_recipe_management: currentSettings.enable_recipe_management || false,
        enable_service_booking: currentSettings.enable_service_booking || false,
        enable_menu_management: currentSettings.enable_menu_management || false,
        enable_ingredient_tracking: currentSettings.enable_ingredient_tracking || false
      };

      setLocalSettings(transformedSettings);
    }
  }, [currentSettings]);

  // Update localSettings when currencies or languages change
  useEffect(() => {
    if (currencies.length > 0 || languages.length > 0) {
      setLocalSettings(prev => ({
        ...prev,
        currency_code: currencies.find((c: Currency) => c.id === localSettings.currency_id)?.code || prev.currency_code,
        currency_name: currencies.find((c: Currency) => c.id === localSettings.currency_id)?.name || prev.currency_name,
        currency_symbol: currencies.find((c: Currency) => c.id === localSettings.currency_id)?.symbol || prev.currency_symbol,
        language_code: languages.find((l: Language) => l.id === localSettings.language_id)?.code || prev.language_code,
        language_name: languages.find((l: Language) => l.id === localSettings.language_id)?.name || prev.language_name,
        language_native_name: languages.find((l: Language) => l.id === localSettings.language_id)?.native_name || prev.language_native_name
      }));
    }
  }, [currencies, languages, localSettings.currency_id, localSettings.language_id]);

  // Handle errors from React Query
  useEffect(() => {
    if (settingsError) {
      setError(settingsError.message || 'Failed to load business settings');
    }
  }, [settingsError]);

  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  const handleSave = async () => {
    if (!currentBusiness?.id || user?.role !== 'business_admin') return;
    
    try {
      const settingsToSave = {
        ...localSettings,
        // Keep the foreign key IDs for database operations
        currency_id: localSettings.currency_id,
        language_id: localSettings.language_id
      };

      // Use the mutation hook - this will automatically invalidate cache on success
      await updateSettingsMutation.mutateAsync(settingsToSave);
      
      // Log activity
      logActivity('business_settings_update', 'Business Settings', `Updated business settings for ${currentBusiness.name}`, {
        businessId: currentBusiness.id,
        businessName: currentBusiness.name
      });
      playSound('success');
      setError(null);
      
      // Note: Cache invalidation is handled automatically by the mutation hook
      // The settings will automatically refresh with the updated data
    } catch (error: unknown) {
      console.error('Error saving business settings:', error);
      setError((error as Error).message || 'Failed to save business settings');
      playSound('error');
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setLocalSettings(prev => ({...prev, logo_url: base64String}));
        logActivity('business_settings_update', 'Business Settings', 'Business logo updated');
        playSound('click');
        toast.success('Business logo updated successfully!');
      };
      
      reader.onerror = () => {
        toast.error('Failed to read the image file');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error handling logo upload:', error);
      toast.error('Failed to upload logo');
    }
  };

  const handleRemoveLogo = () => {
    setLocalSettings(prev => ({...prev, logo_url: ''}));
    logActivity('business_settings_update', 'Business Settings', 'Business logo removed');
    playSound('click');
    toast.success('Business logo removed successfully!');
  };

  // Sound test function available for future use
  // const testSound = () => {
  //   playSound('click');
  //   toast.success('Sound test successful!');
  // };

  // Helper function to get current currency display info
  const getCurrentCurrencyInfo = () => {
    if (localSettings.currency_id) {
      const currency = currencies.find((c: Currency) => c.id === localSettings.currency_id);
      return currency ? { code: currency.code, name: currency.name, symbol: currency.symbol } : null;
    }
    return null;
  };

  // Helper function to get current language display info
  const getCurrentLanguageInfo = () => {
    if (localSettings.language_id) {
      const language = languages.find((l: Language) => l.id === localSettings.language_id);
      return language ? { code: language.code, name: language.name, nativeName: language.native_name } : null;
    }
    return null;
  };

  const ReceiptPreview = () => {
    const currentCurrency = getCurrentCurrencyInfo();
    
    return (
      <div className="max-w-sm mx-auto bg-white p-6 border-2 border-dashed border-gray-300 rounded-lg font-mono text-sm">
        <div className="text-center mb-4">
          {localSettings.logo_url && (
            <img 
              src={localSettings.logo_url} 
              alt="Business Logo" 
              className="w-16 h-16 mx-auto mb-2 object-contain" 
              onError={(e) => {
                console.error('Error loading logo in receipt preview:', e);
                // Hide the image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <h3 className="font-bold text-lg">{currentBusiness?.name}</h3>
          <p className="text-xs text-muted-foreground">Business Information</p>
        </div>
        
        <div className="border-t border-dashed border-gray-400 pt-2 mb-4">
          <p className="text-center text-xs italic">{localSettings.receiptHeader}</p>
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Product Name</span>
            <span>{currentCurrency ? formatCurrency(0.00, currentCurrency.code) : '$0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Product Name</span>
            <span>{currentCurrency ? formatCurrency(0.00, currentCurrency.code) : '$0.00'}</span>
          </div>
          <div className="border-t border-dashed border-gray-400 pt-1">
            <div className="flex justify-between">
              <span>{translate('common.subtotal')}:</span>
              <span>{currentCurrency ? formatCurrency(45.49, currentCurrency.code) : '$45.49'}</span>
            </div>
            {localSettings.enableTax && (
              <div className="flex justify-between">
                <span>{translate('common.tax')} ({localSettings.taxRate}%):</span>
                <span>{currentCurrency ? formatCurrency(45.49 * (localSettings.taxRate / 100), currentCurrency.code) : `$${(45.49 * (localSettings.taxRate / 100)).toFixed(2)}`}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>{translate('common.total')}:</span>
              <span>{currentCurrency ? formatCurrency(localSettings.enableTax ? 45.49 * (1 + localSettings.taxRate / 100) : 45.49, currentCurrency.code) : `$${(localSettings.enableTax ? 45.49 * (1 + localSettings.taxRate / 100) : 45.49).toFixed(2)}`}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 pt-2">
          <p className="text-center text-xs italic">{localSettings.receiptFooter}</p>
          <p className="text-center text-xs mt-2">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business settings...</p>
        </div>
      </div>
    );
  }

  if (!currentBusiness || user?.role !== 'business_admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Business Settings" subtitle="Access denied" showBackButton onBack={onBack} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Access Denied</h3>
              <p className="text-muted-foreground">Only business administrators can access business settings.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Business Settings"
        subtitle={`Configure business-wide settings for ${currentBusiness.name}`}
        showBackButton
        onBack={onBack}
      >
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              // Refetch all data
              window.location.reload(); // Simple refresh for now
            }}
            disabled={isLoading || isSaving}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowReceiptPreview(!showReceiptPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showReceiptPreview ? 'Hide Preview' : 'Preview Receipt'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Settings Info Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Business Settings Control All Stores</h4>
                <p className="text-sm text-blue-700 mb-2">
                  These settings apply to <strong>all stores</strong> in your business. They control:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Receipt header and footer messages</li>
                  <li>Tax rates and return policies</li>
                  <li>Business logo and brand colors</li>
                  <li>Currency and language defaults</li>
                  <li>Business policies and terms</li>
                </ul>
                <p className="text-sm text-blue-700 mt-2">
                  Individual stores can add local information but cannot override these core business settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-800 text-sm">{error}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className={`grid gap-8 ${showReceiptPreview ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          <div className={showReceiptPreview ? 'lg:col-span-2' : ''}>
            <Tabs defaultValue="system" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="receipt">Receipt</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
                <TabsTrigger value="business-type">Business Type</TabsTrigger>
              </TabsList>

              <TabsContent value="system">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Localization
                      </CardTitle>
                      <CardDescription>Currency, language, and regional settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Currency</Label>
                        <Select 
                          value={localSettings.currency_id || ''} 
                          onValueChange={(value) => {
                            const currency = currencies.find((c: Currency) => c.id === value);
                            setLocalSettings({
                              ...localSettings, 
                              currency_id: value,
                              currency_code: currency?.code || 'USD',
                              currency_name: currency?.name || 'US Dollar',
                              currency_symbol: currency?.symbol || '$'
                            });
                          }}
                          disabled={isLoadingRefs || currencies.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingRefs ? "Loading currencies..." : "Select currency"} />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency: Currency) => (
                              <SelectItem key={currency.id} value={currency.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{currency.symbol}</span>
                                  <span>{currency.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {currency.code}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isLoadingRefs && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Loading currencies...
                          </p>
                        )}
                        {!isLoadingRefs && currencies.length === 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            No currencies available. Please check your database connection.
                          </p>
                        )}
                        {!isLoadingRefs && localSettings.currency_id && currencies.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Selected: {getCurrentCurrencyInfo()?.name} 
                            ({getCurrentCurrencyInfo()?.symbol})
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Language</Label>
                        <Select 
                          value={localSettings.language_id || ''} 
                          onValueChange={(value) => {
                            const language = languages.find((l: Language) => l.id === value);
                            setLocalSettings({
                              ...localSettings, 
                              language_id: value,
                              language_code: language?.code || 'en',
                              language_name: language?.name || 'English',
                              language_native_name: language?.native_name || 'English'
                            });
                          }}
                          disabled={isLoadingRefs || languages.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingRefs ? "Loading languages..." : "Select language"} />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((language: Language) => (
                              <SelectItem key={language.id} value={language.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{language.native_name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {language.name}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isLoadingRefs && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Loading languages...
                          </p>
                        )}
                        {!isLoadingRefs && languages.length === 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            No languages available. Please check your database connection.
                          </p>
                        )}
                        {!isLoadingRefs && localSettings.language_id && languages.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Selected: {getCurrentLanguageInfo()?.name} 
                            ({getCurrentLanguageInfo()?.nativeName})
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Tax & Returns
                      </CardTitle>
                      <CardDescription>Configure tax calculation and return policies</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Enable Tax Calculation</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable tax calculation for all stores
                          </p>
                        </div>
                        <Switch
                          checked={localSettings.enableTax}
                          onCheckedChange={(checked) => setLocalSettings({...localSettings, enableTax: checked})}
                        />
                      </div>
                      
                      {localSettings.enableTax && (
                        <div>
                          <Label>Tax Rate (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={localSettings.taxRate}
                            onChange={(e) => setLocalSettings({...localSettings, taxRate: parseFloat(e.target.value) || 0})}
                            placeholder="0.00"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Allow Returns</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable return functionality for all stores
                          </p>
                        </div>
                        <Switch
                          checked={localSettings.allowReturns}
                          onCheckedChange={(checked) => setLocalSettings({...localSettings, allowReturns: checked})}
                        />
                      </div>
                      
                      {localSettings.allowReturns && (
                        <div>
                          <Label>Return Period (Days)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            value={localSettings.returnPeriodDays}
                            onChange={(e) => setLocalSettings({...localSettings, returnPeriodDays: parseInt(e.target.value) || 30})}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="branding">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Brand Colors
                      </CardTitle>
                      <CardDescription>Customize your business color scheme</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Primary Color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            value={localSettings.primaryColor}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              primaryColor: e.target.value
                            })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={localSettings.primaryColor}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              primaryColor: e.target.value
                            })}
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Secondary Color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            value={localSettings.secondaryColor}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              secondaryColor: e.target.value
                            })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={localSettings.secondaryColor}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              secondaryColor: e.target.value
                            })}
                            placeholder="#10B981"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Accent Color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            value={localSettings.accentColor}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              accentColor: e.target.value
                            })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={localSettings.accentColor}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              accentColor: e.target.value
                            })}
                            placeholder="#F59E0B"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Business Logo</CardTitle>
                      <CardDescription>Upload your business logo for receipts and branding</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {localSettings.logo_url ? (
                          <div>
                            <img 
                              src={localSettings.logo_url} 
                              alt="Business Logo" 
                              className="w-24 h-24 mx-auto object-contain mb-4"
                              onError={(e) => {
                                console.error('Error loading logo:', e);
                                // If image fails to load, remove it from settings
                                setLocalSettings(prev => ({...prev, logo_url: ''}));
                                toast.error('Failed to load logo image');
                              }}
                            />
                            <p className="text-sm text-muted-foreground mb-4">Current logo</p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground mb-4">No logo uploaded</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>
                            <Upload className="w-4 h-4 mr-2" />
                            {localSettings.logo_url ? 'Change Logo' : 'Upload Logo'}
                          </Button>
                          {localSettings.logo_url && (
                            <Button variant="outline" onClick={handleRemoveLogo} className="text-red-600 hover:text-red-800">
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recommended: PNG or JPG, max 2MB, square format (e.g., 200x200px)
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="receipt">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      Receipt Configuration
                    </CardTitle>
                    <CardDescription>Customize receipt header, footer, and branding</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Receipt Header Message</Label>
                      <Textarea
                        value={localSettings.receiptHeader}
                        onChange={(e) => setLocalSettings({...localSettings, receiptHeader: e.target.value})}
                        placeholder="Thank you for shopping with us!"
                        rows={2}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        This message appears at the top of all customer receipts
                      </p>
                    </div>
                    <div>
                      <Label>Receipt Footer Message</Label>
                      <Textarea
                        value={localSettings.receiptFooter}
                        onChange={(e) => setLocalSettings({...localSettings, receiptFooter: e.target.value})}
                        placeholder="Returns accepted within 30 days with receipt."
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        This message appears at the bottom of all customer receipts
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="policies">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Policies</CardTitle>
                    <CardDescription>Configure return policies and business rules</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Return Policy</Label>
                      <Textarea
                        value={localSettings.returnPolicy}
                        onChange={(e) => setLocalSettings({...localSettings, returnPolicy: e.target.value})}
                        placeholder="Returns accepted within 30 days with original receipt."
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        This policy applies to all stores and will appear on receipts
                      </p>
                    </div>

                    <div>
                      <Label>Warranty Information</Label>
                      <Textarea
                        value={localSettings.warrantyInfo}
                        onChange={(e) => setLocalSettings({...localSettings, warrantyInfo: e.target.value})}
                        placeholder="Standard manufacturer warranty applies."
                        rows={2}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Warranty information for customers
                      </p>
                    </div>

                    <div>
                      <Label>Terms of Service</Label>
                      <Textarea
                        value={localSettings.termsOfService}
                        onChange={(e) => setLocalSettings({...localSettings, termsOfService: e.target.value})}
                        placeholder="Enter your terms of service..."
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Legal terms that apply to all business transactions
                      </p>
                    </div>

                    <div>
                      <Label>Privacy Policy</Label>
                      <Textarea
                        value={localSettings.privacyPolicy}
                        onChange={(e) => setLocalSettings({...localSettings, privacyPolicy: e.target.value})}
                        placeholder="Enter your privacy policy..."
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        How customer data is handled and protected
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="business-type">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Business Type Configuration
                    </CardTitle>
                    <CardDescription>Configure your business type and feature preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Business Type Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Business Type
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="business-type">Select your business type</Label>
                        <Select 
                          value={localSettings.business_type || 'retail'} 
                          onValueChange={(value) => {
                            setLocalSettings({...localSettings, business_type: value});
                            // Reset feature flags based on new business type
                            const newSettings = { ...localSettings, business_type: value };
                            switch (value) {
                              case 'retail':
                                newSettings.enable_stock_tracking = true;
                                newSettings.enable_inventory_alerts = true;
                                newSettings.enable_restock_management = true;
                                newSettings.enable_recipe_management = false;
                                newSettings.enable_service_booking = false;
                                newSettings.enable_menu_management = false;
                                newSettings.enable_ingredient_tracking = false;
                                break;
                              case 'restaurant':
                                newSettings.enable_stock_tracking = false;
                                newSettings.enable_inventory_alerts = false;
                                newSettings.enable_restock_management = false;
                                newSettings.enable_recipe_management = true;
                                newSettings.enable_service_booking = false;
                                newSettings.enable_menu_management = true;
                                newSettings.enable_ingredient_tracking = true;
                                break;
                              case 'service':
                                newSettings.enable_stock_tracking = false;
                                newSettings.enable_inventory_alerts = false;
                                newSettings.enable_restock_management = false;
                                newSettings.enable_recipe_management = false;
                                newSettings.enable_service_booking = true;
                                newSettings.enable_menu_management = false;
                                newSettings.enable_ingredient_tracking = false;
                                break;
                              case 'hybrid':
                                newSettings.enable_stock_tracking = true;
                                newSettings.enable_inventory_alerts = true;
                                newSettings.enable_restock_management = true;
                                newSettings.enable_recipe_management = true;
                                newSettings.enable_service_booking = true;
                                newSettings.enable_menu_management = true;
                                newSettings.enable_ingredient_tracking = true;
                                break;
                              case 'pharmacy':
                                newSettings.enable_stock_tracking = true;
                                newSettings.enable_inventory_alerts = true;
                                newSettings.enable_restock_management = true;
                                newSettings.enable_recipe_management = false;
                                newSettings.enable_service_booking = false;
                                newSettings.enable_menu_management = false;
                                newSettings.enable_ingredient_tracking = false;
                                break;
                            }
                            setLocalSettings(newSettings);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(BUSINESS_TYPES).map(([, value]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{BUSINESS_TYPE_ICONS[value]}</span>
                                  <div>
                                    <div className="font-medium">{BUSINESS_TYPE_LABELS[value]}</div>
                                    <div className="text-sm text-muted-foreground">{BUSINESS_TYPE_DESCRIPTIONS[value]}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <Building className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">
                              {BUSINESS_TYPE_LABELS[localSettings.business_type as keyof typeof BUSINESS_TYPE_LABELS] || 'Retail Store'}
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                              {BUSINESS_TYPE_DESCRIPTIONS[localSettings.business_type as keyof typeof BUSINESS_TYPE_DESCRIPTIONS] || 'Traditional retail with inventory management'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Feature Configuration */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Wrench className="w-5 h-5" />
                        Feature Configuration
                      </h3>
                      
                      {/* Stock Management Features */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Stock Management
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label htmlFor="stock-tracking">Stock Tracking</Label>
                              <p className="text-sm text-muted-foreground">
                                Track product inventory levels and stock movements
                              </p>
                            </div>
                            <Switch
                              id="stock-tracking"
                              checked={localSettings.enable_stock_tracking || false}
                              onCheckedChange={(enabled) => setLocalSettings({...localSettings, enable_stock_tracking: enabled})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label htmlFor="inventory-alerts">Inventory Alerts</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when products are running low
                              </p>
                            </div>
                            <Switch
                              id="inventory-alerts"
                              checked={localSettings.enable_inventory_alerts || false}
                              onCheckedChange={(enabled) => setLocalSettings({...localSettings, enable_inventory_alerts: enabled})}
                              disabled={!localSettings.enable_stock_tracking}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label htmlFor="restock-management">Restock Management</Label>
                              <p className="text-sm text-muted-foreground">
                                Manage restock orders and supplier relationships
                              </p>
                            </div>
                            <Switch
                              id="restock-management"
                              checked={localSettings.enable_restock_management || false}
                              onCheckedChange={(enabled) => setLocalSettings({...localSettings, enable_restock_management: enabled})}
                              disabled={!localSettings.enable_stock_tracking}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Restaurant Features */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold flex items-center gap-2">
                          <ChefHat className="w-4 h-4" />
                          Restaurant Features
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label htmlFor="recipe-management">Recipe Management</Label>
                              <p className="text-sm text-muted-foreground">
                                Create and manage recipes for menu items
                              </p>
                            </div>
                            <Switch
                              id="recipe-management"
                              checked={localSettings.enable_recipe_management || false}
                              onCheckedChange={(enabled) => setLocalSettings({...localSettings, enable_recipe_management: enabled})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label htmlFor="menu-management">Menu Management</Label>
                              <p className="text-sm text-muted-foreground">
                                Manage restaurant menu and pricing
                              </p>
                            </div>
                            <Switch
                              id="menu-management"
                              checked={localSettings.enable_menu_management || false}
                              onCheckedChange={(enabled) => setLocalSettings({...localSettings, enable_menu_management: enabled})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label htmlFor="ingredient-tracking">Ingredient Tracking</Label>
                              <p className="text-sm text-muted-foreground">
                                Track ingredients used in recipes
                              </p>
                            </div>
                            <Switch
                              id="ingredient-tracking"
                              checked={localSettings.enable_ingredient_tracking || false}
                              onCheckedChange={(enabled) => setLocalSettings({...localSettings, enable_ingredient_tracking: enabled})}
                              disabled={!localSettings.enable_recipe_management}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Service Features */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Service Features
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label htmlFor="service-booking">Service Booking</Label>
                              <p className="text-sm text-muted-foreground">
                                Allow customers to book appointments and services
                              </p>
                            </div>
                            <Switch
                              id="service-booking"
                              checked={localSettings.enable_service_booking || false}
                              onCheckedChange={(enabled) => setLocalSettings({...localSettings, enable_service_booking: enabled})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {showReceiptPreview && (
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-center">Receipt Preview</CardTitle>
                  <CardDescription className="text-center">
                    Live preview of how receipts will appear
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReceiptPreview />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
