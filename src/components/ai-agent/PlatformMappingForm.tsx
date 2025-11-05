'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PlatformMapping {
  id?: string;
  platform: 'whatsapp' | 'instagram' | 'tiktok' | 'facebook';
  platform_account_id: string;
  platform_phone_number?: string;
  platform_username?: string;
  platform_app_id?: string;
  platform_secret?: string;
}

interface PlatformMappingFormProps {
  businessId: string;
}

export const PlatformMappingForm: React.FC<PlatformMappingFormProps> = ({ businessId }) => {
  const [mappings, setMappings] = useState<PlatformMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchMappings();
  }, [businessId]);

  const fetchMappings = async () => {
    try {
      const response = await fetch(`/api/ai-agent/platform-mapping?business_id=${businessId}`);
      const data = await response.json();

      if (data.success) {
        setMappings(data.mappings || []);
      }
    } catch (error) {
      console.error('Error fetching mappings:', error);
      toast.error('Failed to load platform mappings');
    } finally {
      setLoading(false);
    }
  };

  const addMapping = () => {
    setMappings([...mappings, {
      platform: 'whatsapp',
      platform_account_id: '',
    }]);
  };

  const updateMapping = (index: number, field: keyof PlatformMapping, value: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [field]: value };
    setMappings(updated);
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const saveMapping = async (mapping: PlatformMapping, index: number) => {
    if (!mapping.platform_account_id) {
      toast.error('Platform Account ID is required');
      return;
    }

    setSaving(`${index}`);

    try {
      const response = await fetch('/api/ai-agent/platform-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          ...mapping,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Platform mapping saved successfully');
        await fetchMappings(); // Refresh to get the saved ID
      } else {
        toast.error(data.error || 'Failed to save platform mapping');
      }
    } catch (error) {
      console.error('Error saving mapping:', error);
      toast.error('Failed to save platform mapping');
    } finally {
      setSaving(null);
    }
  };

  const deleteMapping = async (mappingId: string) => {
    if (!confirm('Are you sure you want to delete this platform mapping?')) {
      return;
    }

    try {
      const response = await fetch(`/api/ai-agent/platform-mapping?mapping_id=${mappingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Platform mapping deleted successfully');
        await fetchMappings();
      } else {
        toast.error(data.error || 'Failed to delete platform mapping');
      }
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast.error('Failed to delete platform mapping');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading platform mappings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Platform Account Mapping</CardTitle>
            <CardDescription>
              Link your platform accounts to your business so the AI agent can identify which business receives each message
            </CardDescription>
          </div>
          <Button onClick={addMapping} size="sm">
            Add Mapping
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mappings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No platform mappings configured</p>
            <p className="text-sm mt-2">Add a mapping to link your social media accounts</p>
          </div>
        ) : (
          mappings.map((mapping, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {mapping.platform}
                  </Badge>
                  {mapping.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMapping(mapping.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Platform Account ID *</Label>
                    <Input
                      value={mapping.platform_account_id}
                      onChange={(e) => updateMapping(index, 'platform_account_id', e.target.value)}
                      placeholder={
                        mapping.platform === 'whatsapp' 
                          ? 'WhatsApp Business Account ID'
                          : mapping.platform === 'instagram'
                          ? 'Instagram Page ID'
                          : mapping.platform === 'facebook'
                          ? 'Facebook Page ID'
                          : 'TikTok Business Account ID'
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {mapping.platform === 'whatsapp' 
                        ? 'Found in Meta Business Manager → WhatsApp → Business Account ID'
                        : mapping.platform === 'instagram'
                        ? 'Found in Meta Business Manager → Instagram → Page ID'
                        : mapping.platform === 'facebook'
                        ? 'Found in Facebook Page Settings → About → Page ID'
                        : 'Found in TikTok Developer Portal → Business Account ID'}
                    </p>
                  </div>

                  <div>
                    <Label>Platform</Label>
                    <Select
                      value={mapping.platform}
                      onValueChange={(value) => updateMapping(index, 'platform', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {mapping.platform === 'whatsapp' && (
                    <div>
                      <Label>Phone Number (Optional)</Label>
                      <Input
                        value={mapping.platform_phone_number || ''}
                        onChange={(e) => updateMapping(index, 'platform_phone_number', e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                  )}

                  {(mapping.platform === 'instagram' || mapping.platform === 'tiktok' || mapping.platform === 'facebook') && (
                    <div>
                      <Label>Username (Optional)</Label>
                      <Input
                        value={mapping.platform_username || ''}
                        onChange={(e) => updateMapping(index, 'platform_username', e.target.value)}
                        placeholder={mapping.platform === 'facebook' ? 'Page Username' : '@username'}
                      />
                    </div>
                  )}

                  <div>
                    <Label>App ID (Optional)</Label>
                    <Input
                      value={mapping.platform_app_id || ''}
                      onChange={(e) => updateMapping(index, 'platform_app_id', e.target.value)}
                      placeholder="Meta App ID / TikTok App ID"
                    />
                  </div>

                  <div>
                    <Label>Webhook Secret (Optional)</Label>
                    <Input
                      type="password"
                      value={mapping.platform_secret || ''}
                      onChange={(e) => updateMapping(index, 'platform_secret', e.target.value)}
                      placeholder="Webhook verification secret"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => saveMapping(mapping, index)}
                  disabled={saving === `${index}`}
                  className="w-full"
                >
                  {saving === `${index}` ? (
                    'Saving...'
                  ) : mapping.id ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Mapping
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Mapping
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                Why is this needed?
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Since SCIMS is a SaaS platform serving multiple businesses, we need to map each platform account 
                (WhatsApp Business Account, Instagram Page, TikTok Business Account) to the correct business. 
                This ensures messages are routed to the right AI agent configuration.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

