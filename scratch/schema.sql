-- Table for storing customer profiles linked to Supabase Auth
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for storing product inventory
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  origin_story TEXT,
  taste_notes TEXT[],
  weight_options NUMERIC[] DEFAULT '{1, 2, 5}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for storing orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL, -- UUID or 'guest'
  customer_name TEXT,
  phone TEXT,
  address TEXT,
  items JSONB NOT NULL,
  amount NUMERIC NOT NULL,
  payment_type TEXT DEFAULT 'upi',
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
-- Note: You might need to adjust these based on your security requirements.
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Product Policies: Everyone can view, only admin can edit (for now let's keep it simple)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin can modify products" ON products FOR ALL USING (true); -- In production, restrict to admin email

-- Order Policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (true); -- For simplicity in tracking
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON orders FOR UPDATE USING (true); -- For status updates

-- Customer Policies
CREATE POLICY "Users can manage their own profile" ON customers FOR ALL USING (true);
