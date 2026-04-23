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
  email: string;
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
    selectedWeight?: number;
  }>;
  total: number;
  status?: string;
  created_at?: string;
};

/** Fetch user profile from customers table */
export async function getProfile(userId: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
  return data;
}

/** Update or create user profile */
export async function updateProfile(userId: string, profile: Omit<Customer, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase
    .from('customers')
    .upsert({ id: userId, ...profile });

  if (error) {
    console.error('Error updating profile:', error.message);
    return false;
  }
  return true;
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
