'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { useBusinessSettings, useUpdateBusinessSettings } from '@/utils/hooks/businessSettings';
import { toast } from 'sonner';
import { AIAgentSettings } from './AIAgentSettings';

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

export const AIAgentSettingsPage: React.FC = () => {
  const { currentBusiness, user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    data: currentSettings,
    isLoading: isLoadingSettings,
    error: settingsError
  } = useBusinessSettings(currentBusiness?.id || '', { 
    enabled: !!currentBusiness?.id && user?.role === 'business_admin' 
  });

  const updateSettingsMutation = useUpdateBusinessSettings(currentBusiness?.id || '');

  const [localSettings, setLocalSettings] = useState<BusinessSettings>({
    enable_ai_agent: false,
    ai_agent_provider: 'openai',
    ai_agent_api_key: '',
    ai_agent_model: 'gpt-4',
    ai_agent_temperature: 0.7,
    ai_agent_system_prompt: 'You are a helpful customer service agent for a retail business. You help customers find products, check availability, get pricing, and answer questions about the business.',
    ai_agent_enabled_platforms: ['whatsapp'],
    ai_agent_auto_order: false,
    ai_agent_response_delay_ms: 1000
  });

  // Update localSettings when currentSettings changes
  useEffect(() => {
    if (currentSettings) {
      setLocalSettings({
        enable_ai_agent: currentSettings.enable_ai_agent ?? false,
        ai_agent_provider: currentSettings.ai_agent_provider || 'openai',
        ai_agent_api_key: currentSettings.ai_agent_api_key || '',
        ai_agent_model: currentSettings.ai_agent_model || 'gpt-4',
        ai_agent_temperature: currentSettings.ai_agent_temperature !== null && currentSettings.ai_agent_temperature !== undefined ? Number(currentSettings.ai_agent_temperature) : 0.7,
        ai_agent_system_prompt: currentSettings.ai_agent_system_prompt || 'You are a helpful customer service agent for a retail business. You help customers find products, check availability, get pricing, and answer questions about the business.',
        ai_agent_enabled_platforms: currentSettings.ai_agent_enabled_platforms || ['whatsapp'],
        ai_agent_auto_order: currentSettings.ai_agent_auto_order ?? false,
        ai_agent_response_delay_ms: currentSettings.ai_agent_response_delay_ms !== null && currentSettings.ai_agent_response_delay_ms !== undefined ? Number(currentSettings.ai_agent_response_delay_ms) : 1000
      });
    }
  }, [currentSettings]);

  // Handle errors from React Query
  useEffect(() => {
    if (settingsError) {
      setError(settingsError.message || 'Failed to load AI Agent settings');
    }
  }, [settingsError]);

  const handleSave = async () => {
    if (!currentBusiness?.id || user?.role !== 'business_admin') {
      toast.error('You do not have permission to update settings');
      return;
    }

    try {
      setError(null);
      
      const settingsToSave = {
        ...localSettings,
      };

      await updateSettingsMutation.mutateAsync(settingsToSave);
      
      toast.success('AI Agent settings saved successfully');
    } catch (error) {
      console.error('Error saving AI Agent settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save AI Agent settings';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isLoading = isLoadingSettings;
  const isSaving = updateSettingsMutation.isPending;

  if (user?.role !== 'business_admin') {
    return (
      <DashboardLayout
        title="AI Agent Settings"
        subtitle="Configure AI-powered customer service"
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="AI Agent Settings"
      subtitle="Configure AI-powered customer service for WhatsApp, Instagram, and TikTok"
      headerActions={
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading AI Agent settings...</p>
          </div>
        ) : (
          <AIAgentSettings
            localSettings={localSettings}
            onSettingsChange={(updates) => setLocalSettings({...localSettings, ...updates})}
            businessId={currentBusiness?.id}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

