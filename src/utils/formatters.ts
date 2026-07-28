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
  
  const tarePerBag = Number(sessionInfo.tarePerBag) || 0;
  const totalTare = totalBags * tarePerBag;
  
  const netBeforeImpurity = Math.max(0, grossWeight - totalTare);
  const impurityPercent = Number(sessionInfo.impurityPercent) || 0;
  const impurityDeduction = netBeforeImpurity * (impurityPercent / 100);
  
  const finalNetWeight = Math.max(0, netBeforeImpurity - impurityDeduction);
  
  const unitPrice = Number(sessionInfo.unitPrice) || 0;
  const totalAmount = Math.round(finalNetWeight * unitPrice);
  
  const depositAmount = Number(sessionInfo.deposit) || 0;
  const remainingPayable = totalAmount - depositAmount;

  // Single bag metric estimations
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
  };
}

export function generateZaloShareText(session: WeighingSession): string {
  const calc = session.calculated || calculateTotals(session.bagWeights, session);
  const entries = (session.bagWeights || []).map(normalizeEntry);
  
  const bagListFormatted = entries
    .map((e, i) => `#${i + 1}:${e.weight}${e.bagsCount > 1 ? `(${e.bagsCount}bao)` : 'kg'}`)
    .join('  ');

  return `🌾 --- PHIẾU CÂN LÚA THU HOẠCH --- 🌾
🗓 Ngày: ${session.date || new Date().toLocaleDateString('vi-VN')}
👤 Chủ ruộng: ${session.farmerName || 'Chưa tên'} ${session.farmerPhone ? `(${session.farmerPhone})` : ''}
🚚 Lái mua/Ghe: ${session.buyerName || 'Chưa tên'} ${session.buyerPhone ? `(${session.buyerPhone})` : ''}
🌱 Giống lúa: ${session.riceType}
📍 Địa điểm: ${session.location || 'Đồng ruộng'}
----------------------------------
📦 Tổng số bao: ${calc.totalBags} bao ${calc.totalDrafts !== calc.totalBags ? `(${calc.totalDrafts} lượt/mã cân)` : ''}
⚖️ Cân thô ban đầu: ${formatNumber(calc.grossWeight)} kg
🧺 Trừ bì bao (${session.tarePerBag}kg/bao): -${formatNumber(calc.totalTare)} kg
💧 Trừ lép/ẩm (${session.impurityPercent}%): -${formatNumber(calc.impurityDeduction)} kg
✨ CÂN RÒNG THỰC TẾ: ${formatNumber(calc.finalNetWeight)} kg
----------------------------------
💰 Đơn giá: ${formatVND(session.unitPrice)}/kg
💵 TỔNG THÀNH TIỀN: ${formatVND(calc.totalAmount)}
🤝 Tiền cọc/Ứng trước: -${formatVND(calc.depositAmount)}
🔴 CÒN LẠI THANH TOÁN: ${formatVND(calc.remainingPayable)}
----------------------------------
📋 Chi tiết các mã cân (${calc.totalBags} bao / ${calc.totalDrafts} lượt):
${bagListFormatted}
----------------------------------
${session.note ? `📝 Ghi chú: ${session.note}\n----------------------------------\n` : ''}Cảm ơn quý khách! Chúc bà con mùa màng bội thu! 🌾🎉`;
}

export function exportSessionsToCSV(sessions: WeighingSession[]): string {
  const headers = ['Mã Phiếu', 'Ngày', 'Chủ Ruộng', 'Số ĐT Chủ Ruộng', 'Lái Mua', 'Giống Lúa', 'Tổng Số Bao', 'Số Lượt Cân', 'Cân Thô (kg)', 'Trừ Bì (kg)', 'Trừ Lép (kg)', 'Cân Ròng (kg)', 'Đơn Giá (đ/kg)', 'Thành Tiền (đ)', 'Cọc (đ)', 'Còn Lại (đ)', 'Danh Sách Mã Cân'];
  
  const rows = sessions.map(s => {
    const c = s.calculated || calculateTotals(s.bagWeights, s);
    const entries = (s.bagWeights || []).map(normalizeEntry);
    const formattedList = entries.map((e, idx) => `#${idx+1}:${e.weight}kg(${e.bagsCount}bao)`).join('; ');

    return [
      `"${s.id}"`,
      `"${s.date}"`,
      `"${s.farmerName || ''}"`,
      `"${s.farmerPhone || ''}"`,
      `"${s.buyerName || ''}"`,
      `"${s.riceType || ''}"`,
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

export function calculateYieldMetrics(netKg: number, areaSize: number, areaUnit: 'cong_nho' | 'cong_lon' | 'ha', unitPrice: number, costPerAreaUnit: number = 0): YieldAnalysis {
  let areaInSquareMeters = 0;
  if (areaUnit === 'cong_nho') areaInSquareMeters = areaSize * 1000;
  else if (areaUnit === 'cong_lon') areaInSquareMeters = areaSize * 1296;
  else if (areaUnit === 'ha') areaInSquareMeters = areaSize * 10000;

  if (areaInSquareMeters <= 0) areaInSquareMeters = 1000;

  const yieldPerCongNho = (netKg / areaInSquareMeters) * 1000; // kg/1000m2
  const yieldPerCongLon = (netKg / areaInSquareMeters) * 1296; // kg/1296m2
  const yieldPerHa = ((netKg / areaInSquareMeters) * 10000) / 1000; // tấn/ha

  const totalRevenue = netKg * unitPrice;
  const productionCost = areaSize * costPerAreaUnit;
  const estimatedProfit = totalRevenue - productionCost;

  return {
    totalNetKg: netKg,
    areaInSquareMeters,
    yieldPerCongNho: Number(yieldPerCongNho.toFixed(1)),
    yieldPerCongLon: Number(yieldPerCongLon.toFixed(1)),
    yieldPerHa: Number(yieldPerHa.toFixed(2)),
    totalRevenue,
    productionCost,
    estimatedProfit
  };
}
