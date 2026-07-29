export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'operator';
  phone?: string;
}

export interface WeighingEntry {
  weight: number; // Tổng cân thô của lượt này (kg)
  bagsCount: number; // Số bao trong lượt cân này (ví dụ 1, 2, 3 bao...)
}

export interface WeighingSession {
  id: string;
  userId?: string; // ID Cán bộ / User đăng nhập
  operatorName: string; // Tên Cán bộ cân / Người ghi cân tại điểm
  farmerName: string;
  farmerPhone?: string;
  truckInfo: string; // Xe nhận / Biển số xe / Tên tài xế (thay thế buyerName)
  truckPhone?: string;
  location?: string; // Cánh đồng / Điểm cân (Đồng Gò Tháp, Đồng Cửa Kho...)
  riceType: string;
  unitPrice: number; // đ/kg

  // Trừ Bì
  tareType: 'per_bag' | 'fixed_total'; // 'per_bag' (kg/bao) hoặc 'fixed_total' (trừ cố định kg tổng)
  tarePerBag: number; // kg/bao (khi tareType === 'per_bag')
  tareFixedTotal?: number; // kg tổng bì (khi tareType === 'fixed_total')

  // Trừ Lép / Ẩm
  impurityType: 'percent' | 'fixed_kg' | 'moisture_std'; // 'percent' (%), 'fixed_kg' (kg lép), 'moisture_std' (quy chuẩn độ ẩm 14%)
  impurityPercent: number; // % (khi impurityType === 'percent')
  impurityFixedKg?: number; // kg lép cố định (khi impurityType === 'fixed_kg')
  moisturePercent?: number; // % Độ ẩm thực tế lúa tươi (khi impurityType === 'moisture_std')

  deposit: number; // Tiền ứng trước / cọc (đ)
  date: string; // YYYY-MM-DD
  note?: string;
  bagWeights: (number | WeighingEntry)[]; // Hỗ trợ cả số đơn (1 bao) và object WeighingEntry (nhiều bao/lượt)
  calculated?: CalculatedTotals;
  createdAt: string;

  // Đơn vị diện tích Trung Bộ
  areaSize?: number; // Diện tích ruộng (Sào / Mẫu / Ha)
  areaUnit?: 'sao_trung_bo' | 'mau_trung_bo' | 'ha'; // Sào Trung Bộ (500m2), Mẫu Trung Bộ (5000m2), Hecta (10000m2)
}

export interface CalculatedTotals {
  totalBags: number; // Tổng số bao lúa
  totalDrafts: number; // Tổng số lượt/mã cân
  grossWeight: number; // Tổng cân thô (kg)
  totalTare: number; // Tổng bì bao (kg)
  netBeforeImpurity: number; // Cân sau bì trước trừ lép (kg)
  impurityDeduction: number; // Trừ lép/ẩm (kg)
  finalNetWeight: number; // CÂN RÒNG THỰC TẾ (kg)
  unitPrice: number;
  totalAmount: number; // Thành tiền (đ)
  depositAmount: number; // Tiền cọc (đ)
  remainingPayable: number; // CÒN LẠI THANH TOÁN (đ)
  avgBagWeight: number; // Trọng lượng trung bình 1 bao (kg)
  minBagWeight: number;
  maxBagWeight: number;
  moistureDeductionKg?: number; // Số kg quy đổi theo độ ẩm chuẩn 14%
}

export interface RiceVariety {
  name: string;
  code: string;
  description: string;
  defaultPrice: number;
  season?: string;
}

export interface AiChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: Array<{ uri?: string; title?: string }>;
  timestamp?: string;
}

export interface OcrResult {
  farmerName?: string;
  truckInfo?: string;
  riceType?: string;
  unitPrice?: number;
  tarePerBag?: number;
  impurityPercent?: number;
  bagWeights: number[];
  note?: string;
}

export interface YieldAnalysis {
  totalNetKg: number;
  areaInSquareMeters: number;
  yieldPerSaoTrungBo: number; // kg / Sào Trung Bộ (500m2)
  yieldPerMauTrungBo: number; // kg / Mẫu Trung Bộ (5,000m2)
  yieldPerHa: number; // Tấn / ha (10,000m2)
  totalRevenue: number;
  productionCost: number;
  estimatedProfit: number;
}
