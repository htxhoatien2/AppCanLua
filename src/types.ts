export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'operator';
  phone?: string;
}

export interface WeighingEntry {
  weight: number; // Tổng cân thô của lượt này (kg)
  bagsCount: number; // Số bao trong lượt cân này
}

export interface WeighingSession {
  id: string;
  userId?: string;
  operatorName: string; // Tên Cán bộ cân / Người ghi cân
  farmerName: string;
  farmerPhone?: string;
  truckInfo: string; // Xe nhận / Biển số xe
  truckPhone?: string;
  truckBatchId?: string; // Mã chuyến xe tải gom lúa (nếu có)
  location?: string; // Cánh đồng / Điểm cân
  riceType: string;
  unitPrice: number; // đ/kg

  // Trừ Bì
  tareType: 'per_bag' | 'fixed_total';
  tarePerBag: number;
  tareFixedTotal?: number;

  // Trừ Lép / Ẩm
  impurityType: 'percent' | 'fixed_kg' | 'moisture_std';
  impurityPercent: number;
  impurityFixedKg?: number;
  moisturePercent?: number;

  deposit: number;
  date: string;
  note?: string;
  bagWeights: (number | WeighingEntry)[];
  calculated?: CalculatedTotals;
  createdAt: string;

  // Đơn vị diện tích Trung Bộ
  areaSize?: number;
  areaUnit?: 'sao_trung_bo' | 'mau_trung_bo' | 'ha';
}

export interface CalculatedTotals {
  totalBags: number;
  totalDrafts: number;
  grossWeight: number;
  totalTare: number;
  netBeforeImpurity: number;
  impurityDeduction: number;
  finalNetWeight: number;
  unitPrice: number;
  totalAmount: number;
  depositAmount: number;
  remainingPayable: number;
  avgBagWeight: number;
  minBagWeight: number;
  maxBagWeight: number;
  moistureDeductionKg?: number;
}

export interface TruckBatch {
  id: string;
  batchCode: string; // Mã chuyến xe (chuyến #01, #02...)
  truckInfo: string; // Xe nhận / Biển số xe
  driverName?: string;
  date: string;
  sessionIds: string[]; // Danh sách mã phiếu cân trên chuyến xe này
  totalBags: number;
  totalGrossKg: number;
  totalNetKg: number;
  totalAmount: number;
  status: 'loading' | 'completed' | 'delivered';
  createdAt: string;
  note?: string;
}

export interface FarmerSettlement {
  farmerName: string;
  farmerPhone?: string;
  sessions: WeighingSession[];
  totalBags: number;
  totalNetKg: number;
  totalRiceMoney: number;
  seedCost: number; // Tiền lúa giống HTX ứng trước
  fertilizerCost: number; // Tiền phân bón ứng trước
  harvestMachineCost: number; // Tiền máy gặt đập liên hợp
  depositDeduction: number; // Tiền cọc đã nhận
  finalNetPayable: number; // SỐ TIỀN THỰC NHẬN RÒNG CUỐI VỤ
  settlementDate: string;
}

export interface RiceVariety {
  name: string;
  code: string;
  description: string;
  defaultPrice: number;
  season?: string;
}

export interface HtxInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  author: string;
}

export interface AdminConfig {
  htxInfo: HtxInfo;
  varieties: RiceVariety[];
  locations: string[];
  trucks: string[];
  operators: string[];
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
  yieldPerSaoTrungBo: number;
  yieldPerMauTrungBo: number;
  yieldPerHa: number;
  totalRevenue: number;
  productionCost: number;
  estimatedProfit: number;
}
