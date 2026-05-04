-- Supabase Database Schema for Glassmorphic Kitchen Pal

-- Enable Row Level Security (RLS) for security
-- You can adjust these policies based on your authentication needs

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  className TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fruit', 'vegetable', 'food', 'container')),
  emoji TEXT,
  color TEXT,
  quantity INTEGER DEFAULT 1,
  confidence REAL,
  addedAt BIGINT NOT NULL,
  updatedAt BIGINT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('camera', 'manual'))
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo purposes
-- In production, you should restrict this based on user authentication
CREATE POLICY "Allow all operations on inventory" ON inventory
  FOR ALL USING (true);

-- Optional: User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT, -- You can add user auth later
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  item_id TEXT REFERENCES inventory(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on optional tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust for production)
CREATE POLICY "Allow all operations on user_settings" ON user_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on alerts" ON alerts FOR ALL USING (true);