-- Fix RLS policies for security issues

-- 1. Fix market_listings: Restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view market listings" ON public.market_listings;
CREATE POLICY "Authenticated users can view market listings"
ON public.market_listings
FOR SELECT
TO authenticated
USING (true);

-- 2. Fix crop_sales: Users can only view their own sales/purchases
DROP POLICY IF EXISTS "Users can view all crop sales" ON public.crop_sales;
CREATE POLICY "Users can view their own sales or purchases"
ON public.crop_sales
FOR SELECT
TO authenticated
USING (auth.uid() = farmer_id OR auth.uid() = buyer_id);

-- 3. Fix vendor_connections: Require authentication and restrict access
DROP POLICY IF EXISTS "Anyone can insert vendor connections" ON public.vendor_connections;
DROP POLICY IF EXISTS "Anyone can view vendor connections" ON public.vendor_connections;

CREATE POLICY "Authenticated users can create vendor connections"
ON public.vendor_connections
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create security definer function for vendor connections access
CREATE OR REPLACE FUNCTION public.can_view_vendor_connection(sale_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM crop_sales 
    WHERE id = sale_uuid 
    AND (farmer_id = auth.uid() OR buyer_id = auth.uid())
  );
$$;

CREATE POLICY "Users can view relevant vendor connections"
ON public.vendor_connections
FOR SELECT
TO authenticated
USING (public.can_view_vendor_connection(sale_id));

-- 4. Improve payment_transactions policy with security definer function
DROP POLICY IF EXISTS "Users can view their own payment transactions" ON public.payment_transactions;

CREATE OR REPLACE FUNCTION public.is_payment_participant(payment_sale_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM crop_sales 
    WHERE id = payment_sale_id 
    AND (farmer_id = auth.uid() OR buyer_id = auth.uid())
  );
$$;

CREATE POLICY "Users can view their payment transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id OR public.is_payment_participant(sale_id));