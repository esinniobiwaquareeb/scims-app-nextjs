import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MessageSquare, Mail, Send, Smartphone, Receipt, Link, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const CommunicationShowcase = () => {
  const communicationFlow = [
    {
      step: 1,
      title: 'Complete Sale',
      description: 'Customer purchases items at your store',
      icon: Receipt,
      color: 'bg-blue-500'
    },
    {
      step: 2,
      title: 'Choose Delivery',
      description: 'Send receipt via WhatsApp, SMS, or Email',
      icon: Send,
      color: 'bg-green-500'
    },
    {
      step: 3,
      title: 'Customer Receives',
      description: 'Instant receipt with purchase details',
      icon: Smartphone,
      color: 'bg-purple-500'
    },
    {
      step: 4,
      title: 'Digital Record',
      description: 'Customer gets link to view receipt online',
      icon: Link,
      color: 'bg-orange-500'
    }
  ];

  const communicationMethods = [
    {
      name: 'WhatsApp Business',
      icon: MessageSquare,
      color: 'bg-green-600',
      features: [
        'Instant receipt delivery',
        'Business profile integration',
        'Customer communication',
        'Order notifications'
      ],
      description: 'Send receipts and communicate directly with customers via WhatsApp'
    },
    {
      name: 'SMS Integration',
      icon: Send,
      color: 'bg-blue-600',
      features: [
        'Receipt notifications',
        'Link to online receipt',
        'Low-cost delivery',
        'Works on any phone'
      ],
      description: 'Reliable SMS delivery with receipt links for customer records'
    },
    {
      name: 'Email Receipts',
      icon: Mail,
      color: 'bg-purple-600',
      features: [
        'Professional receipts',
        'Detailed transaction info',
        'Easy record keeping',
        'PDF attachments'
      ],
      description: 'Professional email receipts with complete transaction details'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Communication Flow */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-8">Smart Receipt Delivery</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {communicationFlow.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card className="text-center hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">{step.step}</div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              
              {index < communicationFlow.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 transform -translate-y-1/2">
                  <div className="w-full h-0.5 bg-border"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Communication Methods */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-8">Multiple Communication Channels</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {communicationMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-16 h-16 ${method.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{method.name}</CardTitle>
                  <p className="text-muted-foreground">{method.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {method.features.map((feature, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Receipt Sample */}
      <div className="bg-muted/30 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-center mb-8">Sample Digital Receipt</h3>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 border">
            <div className="text-center mb-4">
              <h4 className="font-bold text-lg">Adebayo Electronics</h4>
              <p className="text-sm text-muted-foreground">Lagos, Nigeria</p>
              <p className="text-xs text-muted-foreground">Receipt #R001234</p>
            </div>
            
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span>Samsung TV 43&rdquo;</span>
                <span>₦180,000</span>
              </div>
              <div className="flex justify-between">
                <span>HDMI Cable</span>
                <span>₦3,500</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₦183,500</span>
              </div>
            </div>
            
            <div className="text-center text-xs text-muted-foreground mb-4">
              <p>Thank you for shopping with us!</p>
              <p>View online: scims.app/receipt/R001234</p>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <MessageSquare className="w-3 h-3 mr-1" />
                WhatsApp
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Send className="w-3 h-3 mr-1" />
                SMS
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Mail className="w-3 h-3 mr-1" />
                Email
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};