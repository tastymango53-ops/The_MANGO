import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are not set. Orders will not be saved to the database.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export type Customer = {
  id?: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  created_at?: string;
};

export type Order = {
  id?: string;
  customer_id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status?: string;
  created_at?: string;
};

/** Save a customer and return their ID */
export async function saveCustomer(data: Omit<Customer, 'id' | 'created_at'>): Promise<string | null> {
  const { data: customer, error } = await supabase
    .from('customers')
    .insert(data)
    .select('id')
    .single();

  if (error) {
    console.error('Error saving customer:', error.message);
    return null;
  }
  return customer.id;
}

/** Save an order linked to a customer */
export async function saveOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<string | null> {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select('id')
    .single();

  if (error) {
    console.error('Error saving order:', error.message);
    return null;
  }
  return data.id;
}
