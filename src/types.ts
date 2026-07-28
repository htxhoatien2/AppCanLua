export interface WeighingEntry {
  weight: number; // Tổng cân thô của lượt này (kg)
  bagsCount: number; // Số bao trong lượt cân này (ví dụ 1, 2, 3 bao...)
}

export interface WeighingSession {
  id: string;
  farmerName: string;
  farmerPhone?: string;
  buyerName: string;
  buyerPhone?: string;
  location?: string;
  riceType: string;
  unitPrice: number; // đ/kg
  tarePerBag: number; // kg/bao (e.g. 0.1kg)
  impurityPercent: number; // % lép/độ ẩm (e.g. 2%)
  deposit: number; // tiền ứng trước / cọc (đ)
  date: string; // YYYY-MM-DD
  note?: string;
  bagWeights: (number | WeighingEntry)[]; // hỗ trợ cả số đơn (1 bao) và object WeighingEntry (nhiều bao/lượt)
  calculated?: CalculatedTotals;
  createdAt: string;
  areaSize?: number; // diện tích ruộng (công / ha)
  areaUnit?: 'cong_nho' | 'cong_lon' | 'ha'; // công tầm cắt (1000m2), công tầm lớn (1296m2), hecta (10000m2)
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
  buyerName?: string;
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
  yieldPerCongNho: number; // kg / 1,000m2
  yieldPerCongLon: number; // kg / 1,296m2
  yieldPerHa: number; // tấn / ha
  totalRevenue: number;
  productionCost: number;
  estimatedProfit: number;
}
