export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: {
    street: string;
    area: string;
    city: string;
  };
  pricePerLiter: number;
  subscription: {
    type: 'daily' | 'alternate' | 'custom';
    defaultQuantity: number;
    customDays?: number[];
    // 🌟 New properties added here:
    milkVariant: 'NICE' | 'DELITE';
    paymentMode: 'postpaid' | 'token';
    remainingTokens: number;
  };
  isActive: boolean;
  createdAt?: string;
}

export interface DeliveryLog {
  _id: string;
  customerId: Customer;
  date: string;
  deliveredQuantity: number;
  status: 'pending' | 'delivered' | 'skipped';
  notes: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  category: 'Dairy' | 'Spices' | 'Sweets' | 'Groceries' | 'Other';
  price: number;
  unit: string;
  stockAvailable: number;
  isActive: boolean;
}
