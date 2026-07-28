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
  const [areaUnit, setAreaUnit] = useState<'cong_nho' | 'cong_lon' | 'ha'>('cong_lon'); // Default công tầm cắt ĐBSCL (1296m2)
  const [costPerUnit, setCostPerUnit] = useState<number>(2500000); // 2.5 triệu / công tầm lớn

  const yieldData = calculateYieldMetrics(netKg, areaSize, areaUnit, unitPrice, costPerUnit);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className={`p-5 sm:p-6 rounded-3xl max-w-lg w-full border shadow-2xl transition-all ${
        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-amber-200 text-slate-900'
      }`}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-500/20">
          <h3 className="font-extrabold text-base sm:text-lg text-amber-700 dark:text-amber-400 flex items-center gap-2">
            📊 TÍNH NĂNG SUẤT LÚA & LỢI NHUẬN
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-rose-500 font-bold text-lg">
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3 bg-amber-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-amber-200/80 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Diện Tích Ruộng
              </label>
              <input
                type="number"
                step="0.5"
                value={areaSize}
                onChange={(e) => setAreaSize(parseFloat(e.target.value) || 0)}
                className={`w-full p-2.5 rounded-xl border font-black text-base ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-amber-900'
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
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="cong_lon">Công tầm lớn (1.296m² - ĐBSCL)</option>
                <option value="cong_nho">Công tầm cắt (1.000m²)</option>
                <option value="ha">Hecta (10.000m²)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Ước tính Chi Phí Đầu Tư (đ / {areaUnit === 'cong_lon' ? 'công 1296m²' : areaUnit === 'cong_nho' ? 'công 1000m²' : 'ha'})
              </label>
              <input
                type="number"
                step="100000"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className={`w-full p-2.5 rounded-xl border font-bold text-sm ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <span className="text-[11px] text-slate-400 italic">Gồm: Giống, phân bón, thuốc trừ sâu, tiền máy cắt, nước.</span>
            </div>
          </div>

          {/* Yield Results */}
          <div className="p-4 rounded-2xl bg-amber-600 text-white space-y-3 shadow-lg">
            <div className="text-xs font-bold uppercase text-amber-200">KẾT QUẢ NĂNG SUẤT ĐỒNG RUỘNG:</div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-black/20 p-2.5 rounded-xl">
                <span className="text-amber-200 block">Công tầm lớn (1296m²)</span>
                <strong className="text-lg font-black text-white">{formatNumber(yieldData.yieldPerCongLon)} kg</strong>
              </div>

              <div className="bg-black/20 p-2.5 rounded-xl">
                <span className="text-amber-200 block">Công nhỏ (1000m²)</span>
                <strong className="text-lg font-black text-white">{formatNumber(yieldData.yieldPerCongNho)} kg</strong>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-black/20 p-2.5 rounded-xl">
                <span className="text-amber-200 block">Năng suất Hecta</span>
                <strong className="text-lg font-black text-amber-300">{formatNumber(yieldData.yieldPerHa, 2)} tấn/ha</strong>
              </div>
            </div>

            <div className="border-t border-white/20 pt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Tổng thu nhập lúa:</span>
                <strong className="text-sm">{formatVND(yieldData.totalRevenue)}</strong>
              </div>
              <div className="flex justify-between text-amber-200">
                <span>Tổng chi phí ước tính:</span>
                <strong>-{formatVND(yieldData.productionCost)}</strong>
              </div>
              <div className="flex justify-between text-base font-black pt-1 border-t border-white/20 text-white">
                <span>LỢI NHUẬN RÒNG:</span>
                <span className="text-amber-300 text-lg underline">{formatVND(yieldData.estimatedProfit)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white font-extrabold py-3 px-4 rounded-2xl hover:bg-black shadow transition-all"
          >
            Đóng bảng tính
          </button>
        </div>
      </div>
    </div>
  );
};
