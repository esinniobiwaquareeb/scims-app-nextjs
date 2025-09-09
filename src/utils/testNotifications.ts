import { createOrderNotification } from './notificationUtils';

// Test function to create sample order notifications
export async function createTestOrderNotification(
  storeId: string,
  businessId: string
): Promise<void> {
  const testOrders = [
    {
      orderId: `TEST-${Date.now()}-1`,
      customerName: 'John Doe',
      customerPhone: '+1234567890',
      customerAddress: '123 Main St, City, State',
      customerEmail: 'john.doe@example.com',
      totalAmount: 45.99,
      orderItems: [
        { name: 'Coffee Mug', quantity: 2, price: 12.99 },
        { name: 'T-Shirt', quantity: 1, price: 19.99 },
      ],
    },
    {
      orderId: `TEST-${Date.now()}-2`,
      customerName: 'Jane Smith',
      customerPhone: '+0987654321',
      customerAddress: '456 Oak Ave, City, State',
      customerEmail: 'jane.smith@example.com',
      totalAmount: 78.50,
      orderItems: [
        { name: 'Laptop Bag', quantity: 1, price: 45.00 },
        { name: 'Wireless Mouse', quantity: 1, price: 25.50 },
        { name: 'USB Cable', quantity: 2, price: 4.00 },
      ],
    },
    {
      orderId: `TEST-${Date.now()}-3`,
      customerName: 'Mike Johnson',
      customerPhone: '+1122334455',
      customerAddress: '789 Pine Rd, City, State',
      customerEmail: 'mike.johnson@example.com',
      totalAmount: 125.75,
      orderItems: [
        { name: 'Gaming Headset', quantity: 1, price: 89.99 },
        { name: 'Keyboard', quantity: 1, price: 35.76 },
      ],
    },
  ];

  // Create a random test order
  const randomOrder = testOrders[Math.floor(Math.random() * testOrders.length)];
  
  await createOrderNotification(randomOrder, storeId, businessId);
}

// Function to create multiple test notifications
export async function createMultipleTestNotifications(
  storeId: string,
  businessId: string,
  count: number = 3
): Promise<void> {
  for (let i = 0; i < count; i++) {
    await createTestOrderNotification(storeId, businessId);
    // Add a small delay between notifications
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
