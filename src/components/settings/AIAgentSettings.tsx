'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare } from 'lucide-react';
import { PlatformMappingForm } from '../ai-agent/PlatformMappingForm';
import { PlatformIntegrationGuide } from '../ai-agent/PlatformIntegrationGuide';

interface BusinessSettings {
  enable_ai_agent?: boolean;
  ai_agent_provider?: string;
  ai_agent_api_key?: string;
  ai_agent_model?: string;
  ai_agent_temperature?: number;
  ai_agent_system_prompt?: string;
  ai_agent_enabled_platforms?: string[];
  ai_agent_auto_order?: boolean;
  ai_agent_response_delay_ms?: number;
}

interface AIAgentSettingsProps {
  localSettings: BusinessSettings;
  onSettingsChange: (settings: Partial<BusinessSettings>) => void;
  businessId: string | undefined;
}

export const AIAgentSettings: React.FC<AIAgentSettingsProps> = ({
  localSettings,
  onSettingsChange,
  businessId,
}) => {
  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/ai-agent/webhook` 
    : '/api/ai-agent/webhook';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Agent Assistant
        </CardTitle>
        <CardDescription>
          Enable AI-powered customer service that automatically responds to messages on WhatsApp, Instagram, TikTok, and Facebook
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable_ai_agent">Enable AI Agent</Label>
            <p className="text-sm text-muted-foreground">
              Automatically respond to customer messages using AI
            </p>
          </div>
          <Switch
            id="enable_ai_agent"
            checked={localSettings.enable_ai_agent || false}
            onCheckedChange={(checked) => onSettingsChange({ enable_ai_agent: checked })}
          />
        </div>

        {localSettings.enable_ai_agent && (
          <>
            <Separator />

            <div className="space-y-4">
              <div>
                <Label htmlFor="ai_agent_provider">AI Provider</Label>
                <Select
                  value={localSettings.ai_agent_provider || 'openai'}
                  onValueChange={(value) => onSettingsChange({ ai_agent_provider: value })}
                >
                  <SelectTrigger id="ai_agent_provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="google">Google (Gemini)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ai_agent_api_key">
                  API Key <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ai_agent_api_key"
                  type="password"
                  value={localSettings.ai_agent_api_key || ''}
                  onChange={(e) => onSettingsChange({ ai_agent_api_key: e.target.value })}
                  placeholder="sk-..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Your API key is encrypted and stored securely
                </p>
              </div>

              <div>
                <Label htmlFor="ai_agent_model">Model</Label>
                <Select
                  value={localSettings.ai_agent_model || 'gpt-4'}
                  onValueChange={(value) => onSettingsChange({ ai_agent_model: value })}
                >
                  <SelectTrigger id="ai_agent_model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ai_agent_temperature">
                  Temperature: {localSettings.ai_agent_temperature || 0.7}
                </Label>
                <input
                  id="ai_agent_temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localSettings.ai_agent_temperature || 0.7}
                  onChange={(e) => onSettingsChange({ ai_agent_temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Lower = more focused, Higher = more creative
                </p>
              </div>

              <div>
                <Label htmlFor="ai_agent_enabled_platforms">Enabled Platforms</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {['whatsapp', 'instagram', 'tiktok', 'facebook'].map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`platform-${platform}`}
                        checked={(localSettings.ai_agent_enabled_platforms || []).includes(platform)}
                        onChange={(e) => {
                          const current = localSettings.ai_agent_enabled_platforms || [];
                          const updated = e.target.checked
                            ? [...current, platform]
                            : current.filter(p => p !== platform);
                          onSettingsChange({ ai_agent_enabled_platforms: updated });
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`platform-${platform}`} className="capitalize cursor-pointer">
                        {platform === 'whatsapp' ? 'WhatsApp' : 
                         platform === 'instagram' ? 'Instagram' : 
                         platform === 'tiktok' ? 'TikTok' : 
                         'Facebook'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="ai_agent_system_prompt">System Prompt</Label>
                <Textarea
                  id="ai_agent_system_prompt"
                  value={localSettings.ai_agent_system_prompt || ''}
                  onChange={(e) => onSettingsChange({ ai_agent_system_prompt: e.target.value })}
                  placeholder="You are a helpful customer service agent..."
                  rows={6}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Define how the AI should behave and respond to customers
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai_agent_auto_order">Auto-Create Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow AI to create orders directly when customers request
                  </p>
                </div>
                <Switch
                  id="ai_agent_auto_order"
                  checked={localSettings.ai_agent_auto_order || false}
                  onCheckedChange={(checked) => onSettingsChange({ ai_agent_auto_order: checked })}
                />
              </div>

              <div>
                <Label htmlFor="ai_agent_response_delay_ms">
                  Response Delay: {localSettings.ai_agent_response_delay_ms || 1000}ms
                </Label>
                <input
                  id="ai_agent_response_delay_ms"
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={localSettings.ai_agent_response_delay_ms || 1000}
                  onChange={(e) => onSettingsChange({ ai_agent_response_delay_ms: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Simulate human-like response time (0 = instant)
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Webhook URL
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 break-all font-mono">
                      {webhookUrl}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Configure this webhook URL in your messaging platform (WhatsApp Business API, Instagram, TikTok, Facebook) to receive messages.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {businessId && (
              <div className="mt-4 space-y-4">
                <PlatformMappingForm businessId={businessId} />
                <PlatformIntegrationGuide 
                  businessId={businessId}
                  webhookUrl={webhookUrl}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

