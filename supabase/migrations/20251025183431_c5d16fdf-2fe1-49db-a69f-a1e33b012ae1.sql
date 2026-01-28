-- Add payment tracking and service charges to crop_sales
ALTER TABLE crop_sales
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
ADD COLUMN payment_method TEXT,
ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN buyer_id UUID REFERENCES auth.users(id),
ADD COLUMN service_charge_amount NUMERIC DEFAULT 0,
ADD COLUMN final_amount NUMERIC,
ADD COLUMN current_market_price NUMERIC;

-- Create platform charges configuration table
CREATE TABLE platform_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_type TEXT NOT NULL,
  charge_rate NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_charges ENABLE ROW LEVEL SECURITY;

-- Anyone can view platform charges
CREATE POLICY "Anyone can view platform charges"
ON platform_charges
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_platform_charges_updated_at
BEFORE UPDATE ON platform_charges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default platform service charges
INSERT INTO platform_charges (charge_type, charge_rate, description) VALUES
('service_fee', 2.5, 'Platform service fee for facilitating the transaction'),
('payment_processing', 1.5, 'Payment processing and transaction fee');

-- Create payment transactions table
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES crop_sales(id) NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_status TEXT DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transaction_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment transactions
CREATE POLICY "Users can view their own payment transactions"
ON payment_transactions
FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() IN (
  SELECT farmer_id FROM crop_sales WHERE id = sale_id
));

-- Users can insert payment transactions
CREATE POLICY "Users can insert payment transactions"
ON payment_transactions
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);