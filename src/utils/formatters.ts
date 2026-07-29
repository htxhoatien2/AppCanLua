import { WeighingSession, CalculatedTotals, YieldAnalysis, WeighingEntry } from '../types';

export function normalizeEntry(item: number | WeighingEntry): WeighingEntry {
  if (typeof item === 'number') {
    return { weight: Number(item) || 0, bagsCount: 1 };
  }
  if (item && typeof item === 'object') {
    return {
      weight: Number(item.weight) || 0,
      bagsCount: Math.max(1, Math.round(Number(item.bagsCount) || 1)),
    };
  }
  return { weight: 0, bagsCount: 1 };
}

export function formatVND(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
}

export function formatNumber(val: number, decimals: number = 1): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: decimals }).format(val);
}

export function calculateTotals(bagWeights: (number | WeighingEntry)[], sessionInfo: Partial<WeighingSession>): CalculatedTotals {
  const entries = (bagWeights || []).map(normalizeEntry);
  const totalBags = entries.reduce((sum, e) => sum + e.bagsCount, 0);
  const totalDrafts = entries.length;
  const grossWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  
  // 1. Trừ Bì (Theo bao kg/bao hoặc Trừ tổng cố định kg)
  let totalTare = 0;
  if (sessionInfo.tareType === 'fixed_total') {
    totalTare = Number(sessionInfo.tareFixedTotal) || 0;
  } else {
    // Mặc định: per_bag
    const tarePerBag = Number(sessionInfo.tarePerBag) || 0;
    totalTare = totalBags * tarePerBag;
  }
  
  const netBeforeImpurity = Math.max(0, grossWeight - totalTare);

  // 2. Trừ Lép / Độ Ẩm (Theo %, Theo kg cố định, hoặc Quy đổi độ ẩm chuẩn 14%)
  let impurityDeduction = 0;
  let finalNetWeight = netBeforeImpurity;
  let moistureDeductionKg = 0;

  if (sessionInfo.impurityType === 'fixed_kg') {
    impurityDeduction = Number(sessionInfo.impurityFixedKg) || 0;
    finalNetWeight = Math.max(0, netBeforeImpurity - impurityDeduction);
  } else if (sessionInfo.impurityType === 'moisture_std') {
    // Quy đổi độ ẩm chuẩn 14%
    const moisture = Number(sessionInfo.moisturePercent) || 14;
    if (moisture > 14) {
      finalNetWeight = Math.max(0, netBeforeImpurity * ((100 - moisture) / 86));
      moistureDeductionKg = netBeforeImpurity - finalNetWeight;
      impurityDeduction = moistureDeductionKg;
    } else {
      finalNetWeight = netBeforeImpurity;
      impurityDeduction = 0;
    }
  } else {
    // Mặc định: percent (%)
    const impurityPercent = Number(sessionInfo.impurityPercent) || 0;
    impurityDeduction = netBeforeImpurity * (impurityPercent / 100);
    finalNetWeight = Math.max(0, netBeforeImpurity - impurityDeduction);
  }
  
  const unitPrice = Number(sessionInfo.unitPrice) || 0;
  const totalAmount = Math.round(finalNetWeight * unitPrice);
  
  const depositAmount = Number(sessionInfo.deposit) || 0;
  const remainingPayable = totalAmount - depositAmount;

  // Metric estimations
  const allSingleBagWeights = entries.flatMap(e => {
    const avgForEntry = e.weight / (e.bagsCount || 1);
    return Array(e.bagsCount).fill(avgForEntry);
  });

  const minBagWeight = allSingleBagWeights.length > 0 ? Math.min(...allSingleBagWeights) : 0;
  const maxBagWeight = allSingleBagWeights.length > 0 ? Math.max(...allSingleBagWeights) : 0;
  const avgBagWeight = totalBags > 0 ? grossWeight / totalBags : 0;

  return {
    totalBags,
    totalDrafts,
    grossWeight: Number(grossWeight.toFixed(1)),
    totalTare: Number(totalTare.toFixed(1)),
    netBeforeImpurity: Number(netBeforeImpurity.toFixed(1)),
    impurityDeduction: Number(impurityDeduction.toFixed(1)),
    finalNetWeight: Number(finalNetWeight.toFixed(1)),
    unitPrice,
    totalAmount,
    depositAmount,
    remainingPayable,
    avgBagWeight: Number(avgBagWeight.toFixed(1)),
    minBagWeight: Number(minBagWeight.toFixed(1)),
    maxBagWeight: Number(maxBagWeight.toFixed(1)),
    moistureDeductionKg: Number(moistureDeductionKg.toFixed(1)),
  };
}

export function generateZaloShareText(session: WeighingSession): string {
  const calc = session.calculated || calculateTotals(session.bagWeights, session);
  const entries = (session.bagWeights || []).map(normalizeEntry);
  
  const bagListFormatted = entries
    .map((e, i) => `#${i + 1}:${e.weight}${e.bagsCount > 1 ? `(${e.bagsCount}bao)` : 'kg'}`)
    .join('  ');

  return `🌾 --- PHIẾU CÂN LÚA - HTX HÒA TIẾN 2 (ĐÀ NẴNG) --- 🌾
🗓 Ngày cân: ${session.date || new Date().toLocaleDateString('vi-VN')}
👤 Chủ ruộng: ${session.farmerName || 'Chưa tên'} ${session.farmerPhone ? `(${session.farmerPhone})` : ''}
🚚 Xe nhận: ${session.truckInfo || 'Xe HTX'}
⚖️ Cán bộ cân: ${session.operatorName || 'Phạm Công Tuân'}
🌱 Giống lúa: ${session.riceType}
📍 Địa điểm: ${session.location || 'Đồng ruộng HTX Hòa Tiến 2'}
----------------------------------
📦 Tổng số bao: ${calc.totalBags} bao ${calc.totalDrafts !== calc.totalBags ? `(${calc.totalDrafts} mã cân)` : ''}
⚖️ Cân thô ban đầu: ${formatNumber(calc.grossWeight)} kg
🧺 Trừ bì: -${formatNumber(calc.totalTare)} kg ${session.tareType === 'fixed_total' ? '(Cố định lô)' : `(${session.tarePerBag}kg/bao)`}
💧 Trừ lép/ẩm: -${formatNumber(calc.impurityDeduction)} kg ${session.impurityType === 'moisture_std' ? `(Quy đổi ẩm ${session.moisturePercent}%)` : session.impurityType === 'fixed_kg' ? '(Lép cố định)' : `(${session.impurityPercent}%)`}
✨ CÂN RÒNG THỰC TẾ: ${formatNumber(calc.finalNetWeight)} kg
----------------------------------
💰 Đơn giá: ${formatVND(session.unitPrice)}/kg
💵 TỔNG THÀNH TIỀN: ${formatVND(calc.totalAmount)}
🤝 Tiền cọc/Ứng trước: -${formatVND(calc.depositAmount)}
🔴 CÒN LẠI THANH TOÁN: ${formatVND(calc.remainingPayable)}
----------------------------------
📋 Chi tiết mã cân (${calc.totalBags} bao / ${calc.totalDrafts} lượt):
${bagListFormatted}
----------------------------------
${session.note ? `📝 Ghi chú: ${session.note}\n----------------------------------\n` : ''}HỢP TÁC XÃ DỊCH VỤ SẢN XUẤT NÔNG NGHIỆP HÒA TIẾN 2 (ĐÀ NẴNG) 🌾🎉`;
}

export function exportSessionsToCSV(sessions: WeighingSession[]): string {
  const headers = ['Mã Phiếu', 'Ngày', 'Cán Bộ Cân', 'Chủ Ruộng', 'SĐT Chủ Ruộng', 'Xe Nhận', 'Giống Lúa', 'Địa Điểm', 'Tổng Số Bao', 'Số Lượt Cân', 'Cân Thô (kg)', 'Trừ Bì (kg)', 'Trừ Lép/Ẩm (kg)', 'Cân Ròng (kg)', 'Đơn Giá (đ/kg)', 'Thành Tiền (đ)', 'Cọc (đ)', 'Còn Lại (đ)', 'Danh Sách Mã Cân'];
  
  const rows = sessions.map(s => {
    const c = s.calculated || calculateTotals(s.bagWeights, s);
    const entries = (s.bagWeights || []).map(normalizeEntry);
    const formattedList = entries.map((e, idx) => `#${idx+1}:${e.weight}kg(${e.bagsCount}bao)`).join('; ');

    return [
      `"${s.id}"`,
      `"${s.date}"`,
      `"${s.operatorName || ''}"`,
      `"${s.farmerName || ''}"`,
      `"${s.farmerPhone || ''}"`,
      `"${s.truckInfo || ''}"`,
      `"${s.riceType || ''}"`,
      `"${s.location || ''}"`,
      c.totalBags,
      c.totalDrafts,
      c.grossWeight,
      c.totalTare,
      c.impurityDeduction,
      c.finalNetWeight,
      s.unitPrice,
      c.totalAmount,
      c.depositAmount,
      c.remainingPayable,
      `"${formattedList}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function calculateYieldMetrics(
  netKg: number,
  areaSize: number,
  areaUnit: 'sao_trung_bo' | 'mau_trung_bo' | 'ha',
  unitPrice: number,
  costPerAreaUnit: number = 0
): YieldAnalysis {
  let areaInSquareMeters = 0;
  if (areaUnit === 'sao_trung_bo') areaInSquareMeters = areaSize * 500; // Sào Trung Bộ (500m2)
  else if (areaUnit === 'mau_trung_bo') areaInSquareMeters = areaSize * 5000; // Mẫu Trung Bộ (5000m2)
  else if (areaUnit === 'ha') areaInSquareMeters = areaSize * 10000; // Hecta (10000m2)

  if (areaInSquareMeters <= 0) areaInSquareMeters = 500;

  const yieldPerSaoTrungBo = (netKg / areaInSquareMeters) * 500; // kg/500m2
  const yieldPerMauTrungBo = (netKg / areaInSquareMeters) * 5000; // kg/5000m2
  const yieldPerHa = ((netKg / areaInSquareMeters) * 10000) / 1000; // tấn/ha

  const totalRevenue = netKg * unitPrice;
  const productionCost = areaSize * costPerAreaUnit;
  const estimatedProfit = totalRevenue - productionCost;

  return {
    totalNetKg: netKg,
    areaInSquareMeters,
    yieldPerSaoTrungBo: Number(yieldPerSaoTrungBo.toFixed(1)),
    yieldPerMauTrungBo: Number(yieldPerMauTrungBo.toFixed(1)),
    yieldPerHa: Number(yieldPerHa.toFixed(2)),
    totalRevenue,
    productionCost,
    estimatedProfit
  };
}
