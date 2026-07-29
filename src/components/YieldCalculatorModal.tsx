import React, { useState } from 'react';
import { calculateYieldMetrics, formatVND, formatNumber } from '../utils/formatters';

interface YieldCalculatorModalProps {
  netKg: number;
  unitPrice: number;
  onClose: () => void;
  darkMode: boolean;
}

export const YieldCalculatorModal: React.FC<YieldCalculatorModalProps> = ({
  netKg,
  unitPrice,
  onClose,
  darkMode,
}) => {
  const [areaSize, setAreaSize] = useState<number>(10);
  const [areaUnit, setAreaUnit] = useState<'sao_trung_bo' | 'mau_trung_bo' | 'ha'>('sao_trung_bo'); // Mặc định Sào Trung Bộ Đà Nẵng (500m2)
  const [costPerUnit, setCostPerUnit] = useState<number>(1200000); // 1.2 triệu / Sào Trung Bộ

  const yieldData = calculateYieldMetrics(netKg, areaSize, areaUnit, unitPrice, costPerUnit);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-4 z-50 animate-fadeIn">
      <div className={`p-5 sm:p-7 rounded-3xl max-w-lg w-full border shadow-2xl transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200 text-slate-900'
      }`}>
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-amber-500/20">
          <h3 className="font-lexend font-black text-base sm:text-lg text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <span>📊</span> NĂNG SUẤT LÚA SÀO/MẪU TRUNG BỘ (ĐÀ NẴNG)
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-rose-500 font-bold text-lg">
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Diện Tích Ruộng
              </label>
              <input
                type="number"
                step="0.5"
                value={areaSize}
                onChange={(e) => setAreaSize(parseFloat(e.target.value) || 0)}
                className={`w-full p-2.5 rounded-xl border font-lexend font-black text-base ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-amber-950'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Đơn Vị Diện Tích
              </label>
              <select
                value={areaUnit}
                onChange={(e: any) => setAreaUnit(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-bold text-xs ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="sao_trung_bo">Sào Trung Bộ (500m² - Đà Nẵng)</option>
                <option value="mau_trung_bo">Mẫu Trung Bộ (5.000m² - 10 sào)</option>
                <option value="ha">Hecta (10.000m²)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Chi Phí Đầu Tư (đ / {areaUnit === 'sao_trung_bo' ? 'Sào 500m²' : areaUnit === 'mau_trung_bo' ? 'Mẫu 5000m²' : 'ha'})
              </label>
              <input
                type="number"
                step="50000"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className={`w-full p-2.5 rounded-xl border font-bold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <span className="text-[11px] text-slate-400 italic">Gồm: Lúa giống, phân bón, thuốc trừ sâu, tiền máy gặt gặt đập liên hợp, nước bơm.</span>
            </div>
          </div>

          {/* Yield Results Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-600 to-amber-700 text-white space-y-4 shadow-xl border border-amber-500/40">
            <div className="text-xs font-lexend font-black uppercase text-amber-200 tracking-wider">KẾT QUẢ NĂNG SUẤT ĐỒNG RUỘNG HTX:</div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <span className="text-amber-200 block font-medium">Sào Trung Bộ (500m²)</span>
                <strong className="text-lg sm:text-xl font-lexend font-black text-white">{formatNumber(yieldData.yieldPerSaoTrungBo)} kg</strong>
              </div>

              <div className="bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <span className="text-amber-200 block font-medium">Mẫu Trung Bộ (5000m²)</span>
                <strong className="text-lg sm:text-xl font-lexend font-black text-white">{formatNumber(yieldData.yieldPerMauTrungBo)} kg</strong>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <span className="text-amber-200 block font-medium">Năng suất Hecta</span>
                <strong className="text-lg sm:text-xl font-lexend font-black text-amber-300">{formatNumber(yieldData.yieldPerHa, 2)} tấn/ha</strong>
              </div>
            </div>

            <div className="border-t border-white/20 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-amber-100">Tổng thu nhập lúa:</span>
                <strong className="font-lexend text-sm">{formatVND(yieldData.totalRevenue)}</strong>
              </div>
              <div className="flex justify-between text-amber-200">
                <span>Tổng chi phí ước tính:</span>
                <strong>-{formatVND(yieldData.productionCost)}</strong>
              </div>
              <div className="flex justify-between text-base font-lexend font-black pt-2 border-t border-white/20 text-white">
                <span>LỢI NHUẬN RÒNG:</span>
                <span className="text-amber-300 text-xl underline">{formatVND(yieldData.estimatedProfit)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full bg-slate-950 hover:bg-black text-white font-lexend font-black py-3.5 px-4 rounded-2xl shadow-lg transition-all border border-slate-700"
          >
            Đóng bảng tính
          </button>
        </div>
      </div>
    </div>
  );
};
