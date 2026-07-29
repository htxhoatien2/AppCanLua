-- =======================================================================
-- SUPABASE POSTGRESQL SCHEMA DÀNH RIÊNG CHO HTX NÔNG NGHIỆP HÒA TIẾN 2 (ĐÀ NẴNG)
-- Hướng dẫn: Copy toàn bộ nội dung dán vào Supabase SQL Editor (https://supabase.com/dashboard)
-- =======================================================================

-- 1. Tạo bảng công khai weighing_sessions
CREATE TABLE IF NOT EXISTS public.weighing_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    operator_name TEXT DEFAULT 'Phạm Công Tuân',
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT,
    truck_info TEXT DEFAULT 'Xe HTX',
    truck_phone TEXT,
    location TEXT DEFAULT 'Đồng ruộng HTX Hòa Tiến 2',
    rice_type TEXT DEFAULT 'HT1',
    unit_price NUMERIC DEFAULT 8500,

    -- Trừ bì
    tare_type TEXT DEFAULT 'per_bag',
    tare_per_bag NUMERIC DEFAULT 0.1,
    tare_fixed_total NUMERIC,

    -- Trừ lép / độ ẩm
    impurity_type TEXT DEFAULT 'percent',
    impurity_percent NUMERIC DEFAULT 0,
    impurity_fixed_kg NUMERIC,
    moisture_percent NUMERIC,

    deposit NUMERIC DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    note TEXT,
    bag_weights JSONB DEFAULT '[]'::jsonb,
    calculated JSONB,
    area_size NUMERIC,
    area_unit TEXT DEFAULT 'sao_trung_bo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Chỉ mục Index tối ưu hóa tốc độ tìm kiếm
CREATE INDEX IF NOT EXISTS idx_weighing_sessions_user ON public.weighing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_weighing_sessions_date ON public.weighing_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_weighing_sessions_farmer ON public.weighing_sessions(farmer_name);
CREATE INDEX IF NOT EXISTS idx_weighing_sessions_operator ON public.weighing_sessions(operator_name);
CREATE INDEX IF NOT EXISTS idx_weighing_sessions_truck ON public.weighing_sessions(truck_info);

-- 3. Row Level Security Policies
ALTER TABLE public.weighing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc dữ liệu" ON public.weighing_sessions FOR SELECT USING (true);
CREATE POLICY "Cho phép thêm mới phiếu cân" ON public.weighing_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Cho phép cập nhật phiếu cân" ON public.weighing_sessions FOR UPDATE USING (true);
CREATE POLICY "Cho phép xóa phiếu cân" ON public.weighing_sessions FOR DELETE USING (true);
