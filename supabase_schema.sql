-- ======================================================
-- SUPABASE POSTGRESQL SCHEMA CHO APP CÂN LÚA (APPCANLUA)
-- Hướng dẫn: Copy toàn bộ nội dung này dán vào 
-- Supabase SQL Editor (https://supabase.com/dashboard)
-- ======================================================

-- 1. Tạo bảng weighing_sessions
CREATE TABLE IF NOT EXISTS public.weighing_sessions (
    id TEXT PRIMARY KEY,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT,
    buyer_name TEXT,
    buyer_phone TEXT,
    location TEXT,
    rice_type TEXT DEFAULT 'OM 5451',
    unit_price NUMERIC DEFAULT 8500,
    tare_per_bag NUMERIC DEFAULT 0.1,
    impurity_percent NUMERIC DEFAULT 0,
    deposit NUMERIC DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    note TEXT,
    bag_weights JSONB DEFAULT '[]'::jsonb,
    calculated JSONB,
    area_size NUMERIC,
    area_unit TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Đặt chỉ mục Index tăng tốc độ truy vấn
CREATE INDEX IF NOT EXISTS idx_weighing_sessions_date ON public.weighing_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_weighing_sessions_farmer ON public.weighing_sessions(farmer_name);
CREATE INDEX IF NOT EXISTS idx_weighing_sessions_rice_type ON public.weighing_sessions(rice_type);

-- 3. Bật Row Level Security (RLS) & Cho phép đọc/ghi công khai (Public Access)
ALTER TABLE public.weighing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc dữ liệu công khai" 
    ON public.weighing_sessions FOR SELECT 
    USING (true);

CREATE POLICY "Cho phép thêm mới phiếu cân" 
    ON public.weighing_sessions FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Cho phép cập nhật phiếu cân" 
    ON public.weighing_sessions FOR UPDATE 
    USING (true);

CREATE POLICY "Cho phép xóa phiếu cân" 
    ON public.weighing_sessions FOR DELETE 
    USING (true);

-- Hoàn tất!
