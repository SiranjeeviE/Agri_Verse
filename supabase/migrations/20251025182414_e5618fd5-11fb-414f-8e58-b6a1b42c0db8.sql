-- Create enum for selling types
CREATE TYPE public.selling_type AS ENUM ('immediate', 'profit_timing');

-- Create enum for sale status
CREATE TYPE public.sale_status AS ENUM ('pending', 'matched', 'completed', 'cancelled');

-- Create crop_commissions table
CREATE TABLE public.crop_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crop_preservation table
CREATE TABLE public.crop_preservation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL UNIQUE,
  preservation_tips TEXT NOT NULL,
  storage_temperature TEXT,
  storage_duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crop_sales table
CREATE TABLE public.crop_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL,
  crop_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price_per_kg NUMERIC NOT NULL CHECK (price_per_kg > 0),
  selling_type public.selling_type NOT NULL DEFAULT 'immediate',
  target_price NUMERIC,
  target_date TIMESTAMP WITH TIME ZONE,
  status public.sale_status NOT NULL DEFAULT 'pending',
  commission_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor_connections table
CREATE TABLE public.vendor_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL,
  vendor_name TEXT NOT NULL,
  vendor_contact TEXT NOT NULL,
  connection_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT
);

-- Create sales_analytics table
CREATE TABLE public.sales_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  sale_date DATE NOT NULL,
  total_quantity NUMERIC NOT NULL,
  total_value NUMERIC NOT NULL,
  average_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crop_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_preservation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crop_commissions (publicly readable)
CREATE POLICY "Anyone can view crop commissions"
ON public.crop_commissions
FOR SELECT
USING (true);

-- RLS Policies for crop_preservation (publicly readable)
CREATE POLICY "Anyone can view preservation details"
ON public.crop_preservation
FOR SELECT
USING (true);

-- RLS Policies for crop_sales
CREATE POLICY "Users can view all crop sales"
ON public.crop_sales
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own crop sales"
ON public.crop_sales
FOR INSERT
WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Users can update their own crop sales"
ON public.crop_sales
FOR UPDATE
USING (auth.uid() = farmer_id);

CREATE POLICY "Users can delete their own crop sales"
ON public.crop_sales
FOR DELETE
USING (auth.uid() = farmer_id);

-- RLS Policies for vendor_connections
CREATE POLICY "Anyone can view vendor connections"
ON public.vendor_connections
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert vendor connections"
ON public.vendor_connections
FOR INSERT
WITH CHECK (true);

-- RLS Policies for sales_analytics (publicly readable)
CREATE POLICY "Anyone can view sales analytics"
ON public.sales_analytics
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_crop_commissions_updated_at
BEFORE UPDATE ON public.crop_commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crop_sales_updated_at
BEFORE UPDATE ON public.crop_sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample crop commissions
INSERT INTO public.crop_commissions (crop_name, commission_rate) VALUES
('Rice', 5.0),
('Wheat', 4.5),
('Maize', 4.0),
('Cotton', 6.0),
('Sugarcane', 5.5);

-- Insert sample preservation details
INSERT INTO public.crop_preservation (crop_name, preservation_tips, storage_temperature, storage_duration) VALUES
('Rice', 'Store in airtight containers in cool, dry place. Keep away from moisture and pests.', '10-15°C', '12-18 months'),
('Wheat', 'Keep in moisture-proof bags. Ensure good ventilation and protect from insects.', '10-15°C', '8-12 months'),
('Maize', 'Dry thoroughly before storage. Use sealed containers and check regularly for pests.', '10-15°C', '6-12 months'),
('Cotton', 'Store in dry, well-ventilated area. Protect from moisture and contamination.', '15-20°C', '12 months'),
('Sugarcane', 'Best sold fresh. If storing, keep in cool shade with proper moisture.', '15-20°C', '2-3 days');