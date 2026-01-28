-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE crop_category AS ENUM ('fruit', 'vegetable', 'flower');
CREATE TYPE listing_status AS ENUM ('available', 'sold');
CREATE TYPE language_type AS ENUM ('en', 'hi', 'ta', 'te', 'bn', 'mr');

-- Users profiles table (additional user data)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  language language_type DEFAULT 'en',
  selected_crop TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crops table
CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category crop_category NOT NULL,
  name TEXT NOT NULL UNIQUE,
  soil_type TEXT,
  water_needs TEXT,
  fertilizer TEXT,
  harvesting_tips TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crop varieties table
CREATE TABLE public.crop_varieties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
  variety_name TEXT NOT NULL,
  characteristics TEXT,
  growing_duration_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farm instructions (daily guide)
CREATE TABLE public.farm_instructions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_name TEXT NOT NULL,
  day INTEGER NOT NULL,
  task TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crop_name, day)
);

-- User progress tracking
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  current_day INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, crop_name)
);

-- Automation logs
CREATE TABLE public.automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT DEFAULT 'success',
  sensor_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Disease reports
CREATE TABLE public.disease_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crop TEXT,
  image_url TEXT,
  prediction TEXT,
  treatment TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market prices
CREATE TABLE public.market_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop TEXT NOT NULL,
  price_per_kg NUMERIC NOT NULL,
  location TEXT,
  trend TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market listings
CREATE TABLE public.market_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  status listing_status DEFAULT 'available',
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fertilizer calculations
CREATE TABLE public.fertilizer_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  land_area NUMERIC NOT NULL,
  fertilizer_type TEXT,
  fertilizer_liters NUMERIC,
  water_liters NUMERIC,
  estimated_cost NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbot conversations
CREATE TABLE public.chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizer_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Crops: Public read access
CREATE POLICY "Anyone can view crops" ON public.crops
  FOR SELECT USING (true);

-- Crop varieties: Public read access
CREATE POLICY "Anyone can view crop varieties" ON public.crop_varieties
  FOR SELECT USING (true);

-- Farm instructions: Public read access
CREATE POLICY "Anyone can view farm instructions" ON public.farm_instructions
  FOR SELECT USING (true);

-- User progress: Users can manage their own progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Automation logs: Users can view their own logs
CREATE POLICY "Users can view their own automation logs" ON public.automation_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own automation logs" ON public.automation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Disease reports: Users can manage their own reports
CREATE POLICY "Users can view their own disease reports" ON public.disease_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own disease reports" ON public.disease_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Market prices: Public read access
CREATE POLICY "Anyone can view market prices" ON public.market_prices
  FOR SELECT USING (true);

-- Market listings: Users can view all, manage their own
CREATE POLICY "Anyone can view market listings" ON public.market_listings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own listings" ON public.market_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON public.market_listings
  FOR UPDATE USING (auth.uid() = user_id);

-- Fertilizer calculations: Users can manage their own
CREATE POLICY "Users can view their own fertilizer calculations" ON public.fertilizer_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fertilizer calculations" ON public.fertilizer_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: Users can manage their own
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Chatbot conversations: Users can manage their own
CREATE POLICY "Users can view their own conversations" ON public.chatbot_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON public.chatbot_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.chatbot_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, location, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Farmer'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE((NEW.raw_user_meta_data->>'language')::language_type, 'en')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_conversations_updated_at BEFORE UPDATE ON public.chatbot_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();