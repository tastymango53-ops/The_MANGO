-- Table for storing customer profiles linked to Supabase Auth
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for storing orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL, -- Using text to allow 'guest' or UUID
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'Confirmed' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Example)
ALTER TABLE customers ENABLE CONTROL LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON customers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON customers FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE orders ENABLE CONTROL LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid()::text = customer_id);
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
