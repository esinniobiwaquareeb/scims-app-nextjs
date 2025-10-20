import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { usePlatformSettings, useSystemHealth, useUpdatePlatformSettings } from '@/utils/hooks/useStoreData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Settings, 
  Globe, 
  DollarSign, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Database,
  Wrench,
  Eye,
  EyeOff,
  Save,
  Loader2,
  RefreshCw,
  Phone,
  MessageCircle,
  ShieldOff
} from 'lucide-react';
interface PlatformSettingsProps {
  onBack: () => void;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

interface PlatformSettingsData {
  platform_name: string;
  platform_version: string;
  default_currency: string;
  default_language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  demo_mode: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  allow_username_login: boolean;
  require_email_verification: boolean;
  session_timeout: number;
  max_login_attempts: number;
  platform_phone?: string;
  platform_whatsapp?: string;
  platform_email?: string;
  platform_website?: string;
  enable_pay_on_delivery?: boolean;
  enable_online_payment?: boolean;
  enable_platform_access?: boolean;
  payment_methods?: string[];
  supported_currencies: Currency[];
  supported_languages: Language[];
}

export const PlatformSettings: React.FC<PlatformSettingsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState<PlatformSettingsData | null>(null);

  // Use React Query hooks for data fetching
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings
  } = usePlatformSettings({ 
    enabled: user?.role === 'superadmin' 
  });

  const {
    data: health,
    isLoading: isLoadingHealth,
    error: healthError,
    refetch: refetchHealth
  } = useSystemHealth({ 
    enabled: user?.role === 'superadmin' 
  });

  // Update platform settings mutation
  const updateSettingsMutation = useUpdatePlatformSettings();

  // Combined loading states
  const loading = isLoadingSettings || isLoadingHealth;
  const saving = updateSettingsMutation.isPending;

  // Update localSettings when settings changes
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;

    try {
      // Use the mutation hook - this will automatically invalidate cache on success
      await updateSettingsMutation.mutateAsync(localSettings);
      
      // Note: Cache invalidation is handled automatically by the mutation hook
      // The settings will automatically refresh with the updated data
    } catch (error) {
      console.error('Error saving platform settings:', error);
      // Error handling is done in the mutation hook
    }
  };

  const resetToDefaults = () => {
    if (!settings) return;
    
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      const defaultSettings: PlatformSettingsData = {
        ...settings,
        demo_mode: false,
        maintenance_mode: false,
        default_currency: 'USD',
        default_language: 'en',
        timezone: 'UTC',
        date_format: 'MM/dd/yyyy',
        time_format: '12h',
        session_timeout: 480,
        max_login_attempts: 5,
        allow_username_login: true,
        require_email_verification: false,
        platform_phone: '+1-800-SCIMS-01',
        platform_whatsapp: '+1-800-SCIMS-01',
        platform_email: 'support@scims.app',
        platform_website: 'https://scims.app',
        enable_pay_on_delivery: true,
        enable_online_payment: false,
        payment_methods: ['pay_on_delivery']
      };
      setLocalSettings(defaultSettings);
      toast.info('Settings reset to defaults');
    }
  };

  const handleInputChange = (field: keyof PlatformSettingsData, value: string | number | boolean | '12h' | '24h') => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, [field]: value });
  };

  if (loading || !localSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading platform settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Platform Settings"
        subtitle="Configure SCIMS system-wide settings and preferences"
        showBackButton
        onBack={onBack}
        showLogout={false}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
        {/* Error Display */}
        {(settingsError || healthError) && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-800 text-sm font-medium mb-1">Failed to load platform data</p>
                  {settingsError && (
                    <p className="text-red-700 text-xs">Settings: {settingsError?.message || 'Unknown error'}</p>
                  )}
                  {healthError && (
                    <p className="text-red-700 text-xs">Health: {healthError?.message || 'Unknown error'}</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    refetchSettings();
                    refetchHealth();
                  }}
                  disabled={loading}
                >
                  <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mutation Status */}
        {saving && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <p className="text-blue-800 text-sm">Saving platform settings...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium capitalize">{health?.status || 'Unknown'}</span>
                  </div>
                </div>
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Demo Mode</p>
                  <Badge variant={localSettings.demo_mode ? "secondary" : "outline"}>
                    {localSettings.demo_mode ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                {localSettings.demo_mode ? (
                  <Eye className="w-8 h-8 text-orange-600" />
                ) : (
                  <EyeOff className="w-8 h-8 text-gray-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                  <Badge variant={localSettings.maintenance_mode ? "destructive" : "outline"}>
                    {localSettings.maintenance_mode ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {localSettings.maintenance_mode ? (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                ) : (
                  <Wrench className="w-8 h-8 text-gray-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Access</p>
                  <Badge variant={localSettings.enable_platform_access ? "secondary" : "outline"}>
                    {localSettings.enable_platform_access ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                {localSettings.enable_platform_access ? (
                  <Shield className="w-8 h-8 text-green-600" />
                ) : (
                  <ShieldOff className="w-8 h-8 text-gray-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-medium">{localSettings.platform_version}</p>
                </div>
                <Database className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="localization">Localization</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Configuration</CardTitle>
                  <CardDescription>Basic platform settings and information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={localSettings.platform_name}
                      onChange={(e) => handleInputChange('platform_name', e.target.value)}
                      placeholder="SCIMS"
                    />
                  </div>
                  <div>
                    <Label htmlFor="platformVersion">Version</Label>
                    <Input
                      id="platformVersion"
                      value={localSettings.platform_version}
                      onChange={(e) => handleInputChange('platform_version', e.target.value)}
                      placeholder="1.0.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select 
                      value={localSettings.timezone} 
                      onValueChange={(value) => handleInputChange('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operation Modes</CardTitle>
                  <CardDescription>Control platform operational states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Demo Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable demo mode with sample data and limited functionality
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.demo_mode}
                      onCheckedChange={(checked) => handleInputChange('demo_mode', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Put the platform in maintenance mode (blocks all users except super admin)
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.maintenance_mode}
                      onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Platform Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable platform access for all users
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.enable_platform_access}
                      onCheckedChange={(checked) => handleInputChange('enable_platform_access', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="localization">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Currency Settings
                  </CardTitle>
                  <CardDescription>Configure default currency and formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Default Currency</Label>
                    <Select 
                      value={localSettings.default_currency} 
                      onValueChange={(value) => handleInputChange('default_currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {localSettings.supported_currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span>{currency.symbol}</span>
                              <span>{currency.name} ({currency.code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Supported Currencies</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {localSettings.supported_currencies.map((currency) => (
                        <Badge key={currency.code} variant="secondary">
                          {currency.symbol} {currency.code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language Settings
                  </CardTitle>
                  <CardDescription>Configure default language and formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Default Language</Label>
                    <Select 
                      value={localSettings.default_language} 
                      onValueChange={(value) => handleInputChange('default_language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {localSettings.supported_languages.map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            <div className="flex items-center gap-2">
                              <span>{language.nativeName}</span>
                              <span className="text-muted-foreground">({language.name})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date Format</Label>
                    <Select 
                      value={localSettings.date_format} 
                      onValueChange={(value) => handleInputChange('date_format', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/dd/yyyy">MM/dd/yyyy (US)</SelectItem>
                        <SelectItem value="dd/MM/yyyy">dd/MM/yyyy (UK)</SelectItem>
                        <SelectItem value="yyyy-MM-dd">yyyy-MM-dd (ISO)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Format</Label>
                    <Select 
                      value={localSettings.time_format} 
                      onValueChange={(value) => handleInputChange('time_format', value as '12h' | '24h')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Authentication Settings
                  </CardTitle>
                  <CardDescription>Configure user authentication and security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Allow Username Login</Label>
                      <p className="text-sm text-muted-foreground">
                        Users can login with username instead of email
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.allow_username_login}
                      onCheckedChange={(checked) => handleInputChange('allow_username_login', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        New users must verify their email before accessing the system
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.require_email_verification}
                      onCheckedChange={(checked) => handleInputChange('require_email_verification', checked)}
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min="1"
                      max="10"
                      value={localSettings.max_login_attempts}
                      onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value) || 5)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Account will be temporarily locked after this many failed attempts
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Session Management
                  </CardTitle>
                  <CardDescription>Configure user session settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="30"
                      max="1440"
                      value={localSettings.session_timeout}
                      onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value) || 480)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Users will be automatically logged out after this period of inactivity
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Current Settings:</strong><br />
                      Session timeout: {localSettings.session_timeout} minutes<br />
                      Max login attempts: {localSettings.max_login_attempts}<br />
                      Username login: {localSettings.allow_username_login ? 'Enabled' : 'Disabled'}<br />
                      Email verification: {localSettings.require_email_verification ? 'Required' : 'Optional'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Platform Contact Information
                  </CardTitle>
                  <CardDescription>Configure platform contact details for support and communication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="platformPhone">Platform Phone</Label>
                    <Input
                      id="platformPhone"
                      value={localSettings.platform_phone || ''}
                      onChange={(e) => handleInputChange('platform_phone', e.target.value)}
                      placeholder="+1-800-SCIMS-01"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Main platform support phone number
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="platformEmail">Platform Email</Label>
                    <Input
                      id="platformEmail"
                      type="email"
                      value={localSettings.platform_email || ''}
                      onChange={(e) => handleInputChange('platform_email', e.target.value)}
                      placeholder="support@scims.app"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Main platform support email address
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="platformWebsite">Platform Website</Label>
                    <Input
                      id="platformWebsite"
                      value={localSettings.platform_website || ''}
                      onChange={(e) => handleInputChange('platform_website', e.target.value)}
                      placeholder="https://scims.app"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Official platform website URL
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp Integration
                  </CardTitle>
                  <CardDescription>Configure WhatsApp support and messaging</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="platformWhatsApp">WhatsApp Number</Label>
                    <Input
                      id="platformWhatsApp"
                      value={localSettings.platform_whatsapp || ''}
                      onChange={(e) => handleInputChange('platform_whatsapp', e.target.value)}
                      placeholder="+1-800-SCIMS-01"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      WhatsApp number for platform support (include country code)
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">WhatsApp Integration</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      This number will be used in the storefront footer for customer support. 
                      Customers can click to start a WhatsApp conversation with platform support.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Configure available payment methods for storefronts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Pay on Delivery</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow customers to pay when their order is delivered
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.enable_pay_on_delivery ?? true}
                      onCheckedChange={(checked) => handleInputChange('enable_pay_on_delivery', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Online Payment</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow customers to pay online with cards or digital wallets
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.enable_online_payment ?? false}
                      onCheckedChange={(checked) => handleInputChange('enable_online_payment', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Payment Configuration</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      These settings control which payment methods are available to customers on storefronts. 
                      At least one payment method must be enabled.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Payment Settings
                  </CardTitle>
                  <CardDescription>Additional payment configuration options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Available Payment Methods</Label>
                    <div className="mt-2 space-y-2">
                      {localSettings.payment_methods?.map((method, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="capitalize">{method.replace('_', ' ')}</span>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      )) || (
                        <p className="text-sm text-muted-foreground">No payment methods configured</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Current Status</span>
                    </div>
                    <p className="text-sm text-green-700">
                      {localSettings.enable_pay_on_delivery && localSettings.enable_online_payment
                        ? 'Both payment methods are enabled'
                        : localSettings.enable_pay_on_delivery
                        ? 'Only pay on delivery is enabled'
                        : localSettings.enable_online_payment
                        ? 'Only online payment is enabled'
                        : 'No payment methods are enabled'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Platform status and system details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Platform Version:</p>
                      <p className="text-muted-foreground">{localSettings.platform_version}</p>
                    </div>
                    <div>
                      <p className="font-medium">Database Status:</p>
                      <Badge variant={health?.services?.database === 'operational' ? 'default' : 'destructive'}>
                        {health?.services?.database || 'Unknown'}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Storage Status:</p>
                      <Badge variant={health?.services?.storage === 'operational' ? 'default' : 'destructive'}>
                        {health?.services?.storage || 'Unknown'}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Auth Status:</p>
                      <Badge variant={health?.services?.auth === 'operational' ? 'default' : 'destructive'}>
                        {health?.services?.auth || 'Unknown'}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Last Check:</p>
                      <p className="text-muted-foreground">
                        {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">System Status:</p>
                      <Badge variant={health?.status === 'healthy' ? 'default' : 'destructive'}>
                        {health?.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Actions</CardTitle>
                  <CardDescription>Administrative system operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Backup feature not implemented')}>
                    <Database className="w-4 h-4 mr-2" />
                    Generate System Backup
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Cache clear feature not implemented')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Clear System Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    refetchSettings();
                    refetchHealth();
                    toast.info('Running system health check...');
                  }}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Run System Health Check
                  </Button>
                  <Button variant="destructive" className="w-full justify-start" onClick={() => toast.warning('Restart feature not implemented')}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Restart System Services
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Maintenance Configuration
                </CardTitle>
                <CardDescription>Configure maintenance mode settings and messaging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Maintenance Mode Status</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, only super administrators can access the system
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.maintenance_mode}
                    onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                  />
                </div>

                {localSettings.maintenance_mode && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Maintenance Mode Active</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      The platform is currently in maintenance mode. Regular users cannot access the system.
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={localSettings.maintenance_message}
                    onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
                    placeholder="Enter the message to display to users during maintenance..."
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This message will be displayed to users when they try to access the system during maintenance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};