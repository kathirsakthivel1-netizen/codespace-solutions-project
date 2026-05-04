-- Create inventory table
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
  source TEXT NOT NULL CHECK (source IN ('camera', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  item_id TEXT REFERENCES inventory(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_inventory_className ON inventory(className);
CREATE INDEX idx_inventory_updatedAt ON inventory(updatedAt DESC);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for demo - restrict in production)
CREATE POLICY "Allow all operations on inventory" ON inventory
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_settings" ON user_settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on alerts" ON alerts
  FOR ALL USING (true) WITH CHECK (true);