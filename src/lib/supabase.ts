import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not set. Orders will not be saved.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: window.localStorage,
      flowType: 'pkce'
    }
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type Customer = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  created_at?: string;
};

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedWeight?: number;
};

export type Order = {
  id?: string;
  customer_id?: string;
  customer_name: string;
  email?: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  payment_type: 'upi' | 'cod';
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  created_at?: string;
  upi_reference_id?: string;
};

export type ProductDB = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  origin_story: string;
  taste_notes: string[];
  weight_options: number[];
  stock?: number;
  created_at?: string;
};

export type AppNotification = {
  id?: string;
  user_id: string;
  order_id?: string;
  message: string;
  type: string;
  read?: boolean;
  created_at?: string;
};

export type CreditCustomer = {
  id?: string;
  customer_name: string;
  phone: string;
  order_id?: string | null;
  amount: number;
  note?: string | null;
  status?: 'pending' | 'paid';
  created_at?: string;
};

// ─── Profile functions ────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = no row found — this is NOT an error, user just has no profile yet
    if (error.code !== 'PGRST116') {
      console.error('getProfile error:', { code: error.code, message: error.message, hint: error.hint });
    }
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, profile: Omit<Customer, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase
    .from('customers')
    .upsert({ id: userId, ...profile }, { onConflict: 'id' });
  if (error) {
    console.error('updateProfile error:', { code: error.code, message: error.message, hint: error.hint });
    return false;
  }
  return true;
}

// ─── Order functions ──────────────────────────────────────────────────────────

export async function saveOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<string | null> {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select('id')
    .single();

  if (error) {
    console.error('Error saving order:', error.message, error.details, error.hint);
    return null;
  }
  return data?.id ?? null;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) { console.error('Error updating order status:', error.message); return false; }
  return true;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('Error fetching orders:', error.message); return []; }
  return data ?? [];
}

// ─── Product functions ────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<ProductDB[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
  return data || [];
}

export async function upsertProduct(product: Partial<ProductDB>): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .upsert(product);

  if (error) {
    console.error('Error upserting product:', error.message);
    return false;
  }
  return true;
}

export async function updateProduct(id: string, fields: Partial<Omit<ProductDB, 'id'>>): Promise<boolean> {
  console.log('supabase.updateProduct: id=', id, 'fields=', fields);
  const { error } = await supabase
    .from('products')
    .update(fields)
    .eq('id', id);

  if (error) {
    console.error('supabase.updateProduct ERROR:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return false;
  }
  console.log('supabase.updateProduct: success');
  return true;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error.message);
    return false;
  }
  return true;
}

// ─── Notification functions ───────────────────────────────────────────────────

export async function createNotification(notification: Omit<AppNotification, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase.from('notifications').insert(notification);
  if (error) {
    console.error('Error creating notification:', error.message);
    return false;
  }
  return true;
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error.message);
    return [];
  }
  return data ?? [];
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) {
    console.error('Error marking notification as read:', error.message);
    return false;
  }
  return true;
}

// ─── Credit Customer functions ──────────────────────────────────────────────────

export async function getCreditCustomers(): Promise<CreditCustomer[]> {
  const { data, error } = await supabase
    .from('credit_customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching credit customers:', error.message);
    return [];
  }
  return data ?? [];
}

export async function addCreditCustomer(credit: Omit<CreditCustomer, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase.from('credit_customers').insert(credit);
  if (error) {
    console.error('Error adding credit customer:', error.message);
    return false;
  }
  return true;
}

export async function updateCreditStatus(id: string, status: 'pending' | 'paid'): Promise<boolean> {
  const { error } = await supabase.from('credit_customers').update({ status }).eq('id', id);
  if (error) {
    console.error('Error updating credit status:', error.message);
    return false;
  }
  return true;
}

export async function deleteCreditCustomer(id: string): Promise<boolean> {
  const { error } = await supabase.from('credit_customers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting credit customer:', error.message);
    return false;
  }
  return true;
}
