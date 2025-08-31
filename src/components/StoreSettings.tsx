/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Store as StoreIcon, 
  Phone, 
  Mail, 
  Palette,
  Receipt,
  Upload,
  Calculator,
  Volume2,
  Clock
} from 'lucide-react';
import { useLanguages, useCurrencies, useCountries } from '../utils/hooks/useStoreData';

interface StoreWithRelations {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_active?: boolean;
  currency_id?: string;
  language_id?: string;
  country_id?: string;
  currency?: {
    id: string;
    name: string;
    symbol: string;
    code: string;
  };
  language?: {
    id: string;
    name: string;
    code: string;
    native_name: string;
  };
  country?: {
    id: string;
    name: string;
    code: string;
  };
}

interface StoreSettingsProps {
  storeId: string;
  store: StoreWithRelations | null;
  storeSettings: any; // TODO: Define proper StoreSettings type
  onSave?: (settings: Record<string, unknown>) => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({ storeId, store, storeSettings, onSave }) => {
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  // Initialize local settings with store data
  const [localSettings, setLocalSettings] = useState({
    name: store?.name || '',
    address: store?.address || '',
    city: store?.city || '',
    state: store?.state || '',
    postal_code: store?.postal_code || '',
    phone: store?.phone || '',
    email: store?.email || '',
    manager_name: store?.manager_name || '',
    country_id: store?.country_id || '',
    country: store?.country?.name || '',
    country_code: store?.country?.code || '',
    currency_id: store?.currency_id || storeSettings?.currency_id || '',
    currency: store?.currency?.code || '',
    currency_name: store?.currency?.name || '',
    currency_symbol: store?.currency?.symbol || '',
    language_id: store?.language_id || storeSettings?.language_id || '',
    language: store?.language?.code || '',
    language_name: store?.language?.name || '',
    language_native_name: store?.language?.name || '',
    primary_color: storeSettings?.primary_color || '#3B82F6',
    secondary_color: storeSettings?.secondary_color || '#10B981',
    accent_color: storeSettings?.accent_color || '#F59E0B',
    logo_url: storeSettings?.logo_url || '',
    receipt_header: storeSettings?.receipt_header || store?.name || 'Thank you for your purchase!',
    receipt_footer: storeSettings?.receipt_footer || 'Please come again!',
    return_policy: storeSettings?.return_policy || 'Returns accepted within 30 days with receipt.',
    contact_person: storeSettings?.contact_person || '',
    store_hours: storeSettings?.store_hours || '',
    store_promotion_info: storeSettings?.store_promotion_info || '',
    custom_receipt_message: storeSettings?.custom_receipt_message || '',
    allow_returns: storeSettings?.allow_returns ?? true,
    return_period_days: storeSettings?.return_period_days || 30,
    enable_tax: storeSettings?.enable_tax ?? false,
    tax_rate: storeSettings?.tax_rate || 0,
    enable_sounds: storeSettings?.enable_sounds ?? true
  });

  // Fetch countries, currencies, and languages from API
  const { data: countries = [], isLoading: isLoadingCountries } = useCountries();
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useCurrencies({ enabled: true });
  const { data: languages = [], isLoading: isLoadingLanguages } = useLanguages();

  const isLoadingRefs = isLoadingCountries || isLoadingCurrencies || isLoadingLanguages;

  // Update local settings when store or storeSettings change
  useEffect(() => {
    if (store || storeSettings) {
      setLocalSettings(prev => ({
        ...prev,
        name: store?.name || prev.name,
        address: store?.address || prev.address,
        city: store?.city || prev.city,
        state: store?.state || prev.state,
        postal_code: store?.postal_code || prev.postal_code,
        phone: store?.phone || prev.phone,
        email: store?.email || prev.email,
        manager_name: store?.manager_name || prev.manager_name,
        country_id: store?.country_id || prev.country_id,
        country: store?.country?.name || prev.country,
        country_code: store?.country?.code || prev.country_code,
        currency_id: store?.currency_id || storeSettings?.currency_id || prev.currency_id,
        currency: store?.currency?.code || prev.currency,
        currency_name: store?.currency?.name || prev.currency_name,
        currency_symbol: store?.currency?.symbol || prev.currency_symbol,
        language_id: store?.language_id || storeSettings?.language_id || prev.language_id,
        language: store?.language?.code || prev.language,
        language_name: store?.language?.name || prev.language_name,
        language_native_name: store?.language?.name || prev.language_native_name,
        primary_color: storeSettings?.primary_color || prev.primary_color,
        secondary_color: storeSettings?.secondary_color || prev.secondary_color,
        accent_color: storeSettings?.accent_color || prev.accent_color,
        logo_url: storeSettings?.logo_url || prev.logo_url,
        receipt_header: storeSettings?.receipt_header || store?.name || prev.receipt_header,
        receipt_footer: storeSettings?.receipt_footer || prev.receipt_footer,
        return_policy: storeSettings?.return_policy || prev.return_policy,
        contact_person: storeSettings?.contact_person || prev.contact_person,
        store_hours: storeSettings?.store_hours || prev.store_hours,
        store_promotion_info: storeSettings?.store_promotion_info || prev.store_promotion_info,
        custom_receipt_message: storeSettings?.custom_receipt_message || prev.custom_receipt_message,
        allow_returns: storeSettings?.allow_returns ?? prev.allow_returns,
        return_period_days: storeSettings?.return_period_days || prev.return_period_days,
        enable_tax: storeSettings?.enable_tax ?? prev.enable_tax,
        tax_rate: storeSettings?.tax_rate || prev.tax_rate,
        enable_sounds: storeSettings?.enable_sounds ?? prev.enable_sounds
      }));
    }
  }, [store, storeSettings]);

  const translate = (key: string) => {
    const translations: Record<string, string> = {
      'common.name': 'Name',
      'common.address': 'Address',
      'common.phone': 'Phone',
      'common.email': 'Email',
      'settings.currency': 'Currency',
      'settings.language': 'Language',
      'settings.enableTax': 'Enable Tax',
      'settings.taxRate': 'Tax Rate',
      'settings.enableSounds': 'Enable Sounds'
    };
    return translations[key] || key;
  };

  const getCurrentCurrencyInfo = () => {
    if (localSettings.currency_id) {
      const currency = currencies.find((c: { id: string; name: string; symbol: string; code: string }) => c.id === localSettings.currency_id);
      return currency ? { code: currency.code, name: currency.name, symbol: currency.symbol } : null;
    }
    return null;
  };

  const getCurrentLanguageInfo = () => {
    if (localSettings.language_id) {
      const language = languages.find((l: { id: string; name: string; code: string; native_name: string }) => l.id === localSettings.language_id);
      return language ? { code: language.code, name: language.name, nativeName: language.native_name } : null;
    }
    return null;
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const logoUrl = URL.createObjectURL(file);
      setLocalSettings(prev => ({...prev, logo_url: logoUrl}));
    }
  };

  const testSound = () => {
    console.log('Sound test');
  };

  const ReceiptPreview = () => {
    return (
      <div className="max-w-sm mx-auto bg-white p-6 border-2 border-dashed border-gray-300 rounded-lg font-mono text-sm">
        <div className="text-center mb-4">
          {localSettings.logo_url && (
            <img src={localSettings.logo_url} alt="Store Logo" className="w-16 h-16 mx-auto mb-2 object-contain" />
          )}
          <h3 className="font-bold text-lg">{localSettings.name}</h3>
          <p className="text-xs">{localSettings.address}</p>
          <p className="text-xs">{localSettings.city}, {localSettings.state} {localSettings.postal_code}</p>
          <p className="text-xs">{localSettings.phone}</p>
        </div>
        
        <div className="border-t border-dashed border-gray-400 pt-2 mb-4">
          <p className="text-center text-xs italic">{localSettings.receipt_header}</p>
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Product Name</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Product Name</span>
            <span>$0.00</span>
          </div>
          <div className="border-t border-dashed border-gray-400 pt-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>$45.49</span>
            </div>
            {localSettings.enable_tax && (
              <div className="flex justify-between">
                <span>Tax ({localSettings.tax_rate}%):</span>
                <span>${(45.49 * (localSettings.tax_rate / 100)).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${(localSettings.enable_tax ? 45.49 * (1 + localSettings.tax_rate / 100) : 45.49).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 pt-2">
          <p className="text-center text-xs italic">{localSettings.receipt_footer}</p>
          <p className="text-center text-xs mt-2">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Store Settings</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowReceiptPreview(!showReceiptPreview)}
          >
            {showReceiptPreview ? 'Hide Preview' : 'Preview Receipt'}
          </Button>
          <Button onClick={() => onSave?.(localSettings)}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className={`grid gap-8 ${showReceiptPreview ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={showReceiptPreview ? 'lg:col-span-2' : ''}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="local">Local Info</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="receipt">Receipt</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <StoreIcon className="w-5 h-5" />
                      Store Information
                    </CardTitle>
                    <CardDescription>Basic store details and identification</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="storeName">{translate('common.name')}</Label>
                      <Input
                        id="storeName"
                        value={localSettings.name}
                        onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})}
                        placeholder="Enter store name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="storeAddress">{translate('common.address')}</Label>
                      <Input
                        id="storeAddress"
                        value={localSettings.address}
                        onChange={(e) => setLocalSettings({...localSettings, address: e.target.value})}
                        placeholder="Street address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={localSettings.city}
                          onChange={(e) => setLocalSettings({...localSettings, city: e.target.value})}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          value={localSettings.state}
                          onChange={(e) => setLocalSettings({...localSettings, state: e.target.value})}
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={localSettings.postal_code}
                          onChange={(e) => setLocalSettings({...localSettings, postal_code: e.target.value})}
                          placeholder="Postal code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <select
                          value={localSettings.country_id || ""}
                          onChange={(e) => {
                            const country = countries.find((c: { id: string; name: string; code: string }) => c.id === e.target.value);
                            setLocalSettings({
                              ...localSettings,
                              country_id: e.target.value,
                              country: country?.name || '',
                              country_code: country?.code || ''
                            });
                          }}
                          className="w-full p-2 border rounded-md"
                          disabled={isLoadingCountries || countries.length === 0}
                        >
                          <option value="">Select country</option>
                          {countries.map((country: { id: string; name: string; code: string }) => (
                            <option key={country.id} value={country.id}>
                              {country.name} ({country.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="managerName">Manager Name</Label>
                      <Input
                        id="managerName"
                        value={localSettings.manager_name || ""}
                        onChange={(e) => setLocalSettings({...localSettings, manager_name: e.target.value})}
                        placeholder="Store manager name"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Localization</CardTitle>
                    <CardDescription>Currency, language, and regional settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>{translate('settings.currency')}</Label>
                                              <select
                          value={localSettings.currency_id || ""}
                          onChange={(e) => {
                            const currency = currencies.find((c: { id: string; name: string; symbol: string; code: string }) => c.id === e.target.value);
                            setLocalSettings({
                              ...localSettings,
                              currency_id: e.target.value,
                              currency: currency?.code || '',
                              currency_name: currency?.name || '',
                              currency_symbol: currency?.symbol || ''
                            });
                          }}
                          className="w-full p-2 border rounded-md"
                          disabled={isLoadingCurrencies || currencies.length === 0}
                        >
                          <option value="">Select currency</option>
                          {currencies.map((currency: { id: string; name: string; symbol: string; code: string }) => (
                            <option key={currency.id} value={currency.id}>
                              {currency.symbol} {currency.name} ({currency.code})
                            </option>
                          ))}
                        </select>
                    </div>
                    <div>
                      <Label>{translate('settings.language')}</Label>
                      <select
                        value={localSettings.language_id || ""}
                        onChange={(e) => {
                          const language = languages.find((l: { id: string; name: string; code: string; native_name: string }) => l.id === e.target.value);
                          setLocalSettings({
                            ...localSettings,
                            language_id: e.target.value,
                            language: language?.code || '',
                            language_name: language?.name || '',
                            language_native_name: language?.native_name || ''
                          });
                        }}
                        className="w-full p-2 border rounded-md"
                        disabled={isLoadingLanguages || languages.length === 0}
                      >
                        <option value="">Select language</option>
                        {languages.map((language: { id: string; name: string; code: string; native_name: string }) => (
                          <option key={language.id} value={language.id}>
                            {language.native_name} ({language.name})
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>Store contact details for customers and receipts</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">{translate('common.phone')} Number</Label>
                      <Input
                        id="phone"
                        value={localSettings.phone}
                        onChange={(e) => setLocalSettings({...localSettings, phone: e.target.value})}
                        placeholder="+1-555-123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{translate('common.email')} Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={localSettings.email}
                        onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})}
                        placeholder="store@example.com"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                    <div className="text-center">
                      <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Contact Information</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This information will appear on receipts and customer communications.
                      </p>
                      <div className="text-sm space-y-1">
                        {localSettings.phone && (
                          <p><Phone className="w-4 h-4 inline mr-2" />{localSettings.phone}</p>
                        )}
                        {localSettings.email && (
                          <p><Mail className="w-4 h-4 inline mr-2" />{localSettings.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="local">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Local Store Information
                  </CardTitle>
                  <CardDescription>Store-specific information that can be customized locally</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contact_person">Local Contact Information</Label>
                      <Textarea
                        id="contact_person"
                        value={localSettings.contact_person || ""}
                        onChange={(e) => setLocalSettings({...localSettings, contact_person: e.target.value})}
                        placeholder="Store manager contact, local phone extensions, etc."
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Local contact details specific to this store
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="store_hours">Store Hours</Label>
                      <Textarea
                        id="store_hours"
                        value={localSettings.store_hours || ""}
                        onChange={(e) => setLocalSettings({...localSettings, store_hours: e.target.value})}
                        placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM, Sun: Closed"
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Operating hours for this specific location
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="store_promotion_info">Local Promotions</Label>
                    <Textarea
                      id="store_promotion_info"
                      value={localSettings.store_promotion_info || ""}
                      onChange={(e) => setLocalSettings({...localSettings, store_promotion_info: e.target.value})}
                      placeholder="Local deals, store-specific offers, etc."
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Promotions or deals specific to this store location
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="return_policy">Local Return Policy Override</Label>
                    <Textarea
                      id="return_policy"
                      value={localSettings.return_policy || ""}
                      onChange={(e) => setLocalSettings({...localSettings, return_policy: e.target.value})}
                      placeholder="Leave empty to use business default policy"
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Optional: Override business return policy for this store (leave empty to use business default)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Brand Colors
                    </CardTitle>
                    <CardDescription>Customize your store&apos;s color scheme</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={localSettings.primary_color}
                          onChange={(e) => setLocalSettings({...localSettings, primary_color: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={localSettings.primary_color}
                          onChange={(e) => setLocalSettings({...localSettings, primary_color: e.target.value})}
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={localSettings.secondary_color}
                          onChange={(e) => setLocalSettings({...localSettings, secondary_color: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={localSettings.secondary_color}
                          onChange={(e) => setLocalSettings({...localSettings, secondary_color: e.target.value})}
                          placeholder="#10B981"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="accentColor"
                          type="color"
                          value={localSettings.accent_color}
                          onChange={(e) => setLocalSettings({...localSettings, accent_color: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={localSettings.accent_color}
                          onChange={(e) => setLocalSettings({...localSettings, accent_color: e.target.value})}
                          placeholder="#F59E0B"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Store Logo</CardTitle>
                    <CardDescription>Upload your store logo for receipts and branding</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {localSettings.logo_url ? (
                        <div>
                          <img
                            src={localSettings.logo_url}
                            alt="Store Logo"
                            className="w-24 h-24 mx-auto object-contain mb-4"
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
                      <Button variant="outline" onClick={() => document.getElementById("logo-upload")?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
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
                    Local Receipt Customization
                  </CardTitle>
                  <CardDescription>Add store-specific messages and local information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Business-Level Settings</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Receipt header, footer, and policies are managed at the business level. 
                      Contact your business administrator to change these settings.
                    </p>
                    <div className="text-sm space-y-1">
                      <p><strong>Header:</strong> {localSettings.receipt_header}</p>
                      <p><strong>Footer:</strong> {localSettings.receipt_footer}</p>
                      <p><strong>Return Policy:</strong> {localSettings.return_policy}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="customReceiptMessage">Custom Store Message</Label>
                    <Textarea
                      id="customReceiptMessage"
                      value={localSettings.custom_receipt_message || ""}
                      onChange={(e) => setLocalSettings({...localSettings, custom_receipt_message: e.target.value})}
                      placeholder="Add a store-specific message (optional)"
                      rows={2}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      This message will be added below the business footer on receipts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="policies">
              <Card>
                <CardHeader>
                  <CardTitle>Store Policies</CardTitle>
                  <CardDescription>Configure return policies and business rules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Allow Returns</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable return functionality for this store
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.allow_returns}
                      onCheckedChange={(checked) => setLocalSettings({...localSettings, allow_returns: checked})}
                    />
                  </div>
                  
                  {localSettings.allow_returns && (
                    <div>
                      <Label htmlFor="returnPeriod">Return Period (Days)</Label>
                      <Input
                        id="returnPeriod"
                        type="number"
                        min="1"
                        max="365"
                        value={localSettings.return_period_days}
                        onChange={(e) => setLocalSettings({...localSettings, return_period_days: parseInt(e.target.value) || 30})}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Number of days customers have to return items
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          {translate('settings.enableTax')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable tax calculation for this store
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.enable_tax}
                        onCheckedChange={(checked) => setLocalSettings({...localSettings, enable_tax: checked})}
                      />
                    </div>

                    {localSettings.enable_tax && (
                      <div>
                        <Label htmlFor="taxRate">{translate('settings.taxRate')}</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={localSettings.tax_rate}
                          onChange={(e) => setLocalSettings({...localSettings, tax_rate: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Tax rate as a percentage (e.g., 8.25 for 8.25%)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system behavior and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        {translate('settings.enableSounds')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable sound effects for POS interactions
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testSound}
                        disabled={!localSettings.enable_sounds}
                      >
                        Test Sound
                      </Button>
                      <Switch
                        checked={localSettings.enable_sounds}
                        onCheckedChange={(checked) => setLocalSettings({...localSettings, enable_sounds: checked})}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Current Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Returns:</span>
                        <Badge variant={localSettings.allow_returns ? "default" : "secondary"}>
                          {localSettings.allow_returns ? "Allowed" : "Not Allowed"}
                        </Badge>
                      </div>
                      {localSettings.allow_returns && (
                        <div className="flex justify-between">
                          <span>Return Period:</span>
                          <span>{localSettings.return_period_days} days</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Tax Calculation:</span>
                        <Badge variant={localSettings.enable_tax ? "default" : "secondary"}>
                          {localSettings.enable_tax ? `${localSettings.tax_rate}%` : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Sound Effects:</span>
                        <Badge variant={localSettings.enable_sounds ? "default" : "secondary"}>
                          {localSettings.enable_sounds ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Currency:</span>
                        <span>{localSettings.currency_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Language:</span>
                        <span>{localSettings.language_name}</span>
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
    </div>
  );
};
