'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Instagram, 
  Music,
  Facebook,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformIntegrationGuideProps {
  businessId: string;
  webhookUrl: string;
}

export const PlatformIntegrationGuide: React.FC<PlatformIntegrationGuideProps> = ({ 
  businessId, 
  webhookUrl 
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Platform Integration Setup
        </CardTitle>
        <CardDescription>
          Follow these steps to connect your social media accounts and enable automatic AI responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="whatsapp" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="whatsapp" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="instagram" className="gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="gap-2">
              <Music className="w-4 h-4" />
              TikTok
            </TabsTrigger>
            <TabsTrigger value="facebook" className="gap-2">
              <Facebook className="w-4 h-4" />
              Facebook
            </TabsTrigger>
          </TabsList>

          {/* WhatsApp Setup */}
          <TabsContent value="whatsapp" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Prerequisites
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>WhatsApp Business Account</li>
                    <li>Meta Business Account</li>
                    <li>Access to Meta Business Manager</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Set Up WhatsApp Business API</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Meta Business Manager <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Navigate to WhatsApp Business Accounts</li>
                  <li>Create or select your WhatsApp Business Account</li>
                  <li>Complete the verification process</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Configure Webhook</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Webhook URL:</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {webhookUrl}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                      className="h-6 px-2"
                    >
                      {copied === 'Webhook URL' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>In Meta Business Manager, go to WhatsApp → Configuration → Webhooks</li>
                    <li>Click &quot;Edit&quot; next to Webhook URL</li>
                    <li>Paste the webhook URL above</li>
                    <li>Set Verify Token (use: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">your_verify_token</code>)</li>
                    <li>Subscribe to <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">messages</code> event</li>
                    <li>Click &quot;Verify and Save&quot;</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Test Integration</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Send a test message to your WhatsApp Business number to verify the integration works.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Instagram Setup */}
          <TabsContent value="instagram" className="space-y-4">
            <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-pink-900 dark:text-pink-100 mb-2">
                    Prerequisites
                  </p>
                  <ul className="text-xs text-pink-700 dark:text-pink-300 space-y-1 list-disc list-inside">
                    <li>Instagram Business Account</li>
                    <li>Facebook Page connected to Instagram</li>
                    <li>Meta Business Account</li>
                    <li>Instagram Graph API Access</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Set Up Instagram Business Account</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Convert your Instagram account to Business Account</li>
                  <li>Connect your Instagram to a Facebook Page</li>
                  <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Meta Developers <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Create a Facebook App with Instagram permissions</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Configure Webhook</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Webhook URL:</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {webhookUrl}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                      className="h-6 px-2"
                    >
                      {copied === 'Webhook URL' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>In Facebook App Dashboard, go to Messenger → Settings → Webhooks</li>
                    <li>Click &quot;Add Callback URL&quot;</li>
                    <li>Paste the webhook URL above</li>
                    <li>Set Verify Token</li>
                    <li>Subscribe to <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">messages</code> and <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">messaging_postbacks</code> events</li>
                    <li>Click &quot;Verify and Save&quot;</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Enable Instagram Messaging</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>In Instagram settings, enable &quot;Allow Access to Messages&quot;</li>
                  <li>Authorize the app to access your Instagram account</li>
                  <li>Test by sending a DM to your Instagram account</li>
                </ol>
              </div>
            </div>
          </TabsContent>

          {/* Facebook Setup */}
          <TabsContent value="facebook" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Prerequisites
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Facebook Business Page</li>
                    <li>Meta Business Account</li>
                    <li>Facebook App with Messenger permissions</li>
                    <li>Access to Meta Business Manager</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Set Up Facebook Business Page</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Meta Business Manager <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Create or select your Facebook Business Page</li>
                  <li>Ensure your page is verified and has Messenger enabled</li>
                  <li>Note your Page ID (found in Page Settings → About)</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Create Facebook App</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Meta Developers <ExternalLink className="w-3 h-4" /></a></li>
                  <li>Create a new app or select existing app</li>
                  <li>Add <strong>Messenger</strong> product to your app</li>
                  <li>Configure Messenger settings</li>
                  <li>Get your <strong>App ID</strong> and <strong>App Secret</strong></li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Configure Webhook</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Webhook URL:</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {webhookUrl}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                      className="h-6 px-2"
                    >
                      {copied === 'Webhook URL' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>In Facebook App Dashboard, go to <strong>Messenger</strong> → <strong>Settings</strong> → <strong>Webhooks</strong></li>
                    <li>Click <strong>&quot;Add Callback URL&quot;</strong> or <strong>&quot;Edit&quot;</strong></li>
                    <li>Paste the webhook URL above</li>
                    <li>Set <strong>Verify Token</strong> (use: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">your_verify_token</code>)</li>
                    <li>Subscribe to these events:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">messages</code></li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">messaging_postbacks</code></li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">messaging_optins</code></li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">messaging_deliveries</code></li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">messaging_reads</code></li>
                      </ul>
                    </li>
                    <li>Click <strong>&quot;Verify and Save&quot;</strong></li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 4: Link Page to App</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>In Messenger settings, go to <strong>Access Tokens</strong></li>
                  <li>Select your Facebook Page from the dropdown</li>
                  <li>Generate a <strong>Page Access Token</strong></li>
                  <li>Copy and save the token securely</li>
                  <li>Subscribe your page to the webhook</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 5: Map Your Facebook Page</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to <strong>AI Agent Settings</strong> → <strong>Platform Account Mapping</strong></li>
                  <li>Add a new mapping:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Platform: <strong>Facebook</strong></li>
                      <li>Platform Account ID: Your <strong>Facebook Page ID</strong></li>
                      <li>App ID: Your <strong>Facebook App ID</strong> (optional but recommended)</li>
                    </ul>
                  </li>
                  <li>Save the mapping</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 6: Test Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Send a test message to your Facebook Page through Messenger. The AI agent should respond automatically.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* TikTok Setup */}
          <TabsContent value="tiktok" className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                    Note
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    TikTok Business Messaging API is currently in beta. You may need to apply for access through TikTok for Business.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Apply for TikTok Business API Access</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to <a href="https://ads.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">TikTok for Business <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Create a TikTok Ads account</li>
                  <li>Apply for API access through the TikTok Developer Portal</li>
                  <li>Wait for approval (may take several days)</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Create TikTok App</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to <a href="https://developers.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">TikTok Developers <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Create a new app</li>
                  <li>Add &quot;Messaging&quot; capability</li>
                  <li>Complete app verification</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Configure Webhook</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Webhook URL:</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {webhookUrl}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                      className="h-6 px-2"
                    >
                      {copied === 'Webhook URL' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>In TikTok Developer Portal, go to your app → Webhooks</li>
                    <li>Add webhook endpoint</li>
                    <li>Paste the webhook URL above</li>
                    <li>Set webhook secret (for verification)</li>
                    <li>Subscribe to message events</li>
                    <li>Save configuration</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 4: Test Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Once approved and configured, test by sending a message to your TikTok Business account.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Important Notes
              </p>
              <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                <li>Webhook URL must be publicly accessible (HTTPS required)</li>
                <li>Keep your webhook verify token secure</li>
                <li>Test webhook delivery in your platform&apos;s webhook settings</li>
                <li>Monitor webhook logs for any delivery issues</li>
                <li>Ensure your AI agent is enabled in Business Settings before testing</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

