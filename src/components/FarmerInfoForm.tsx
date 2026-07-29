import React, { useState } from 'react';
import { WeighingSession } from '../types';
import { POPULAR_RICE_VARIETIES } from '../data/riceData';

interface FarmerInfoFormProps {
  sessionInfo: WeighingSession;
  setSessionInfo: React.Dispatch<React.SetStateAction<WeighingSession>>;
  darkMode: boolean;
  onNewSession: () => void;
}

export const FarmerInfoForm: React.FC<FarmerInfoFormProps> = ({
  sessionInfo,
  setSessionInfo,
  darkMode,
  onNewSession,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (field: keyof WeighingSession, value: any) => {
    setSessionInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedVarietyObj = POPULAR_RICE_VARIETIES.find((v) => v.name === sessionInfo.riceType);

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border shadow-xl transition-all duration-300 ${
      darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-amber-200/90 shadow-amber-900/5'
    }`}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-500/20">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 font-lexend font-black text-sm text-amber-700 dark:text-amber-400 uppercase tracking-wide text-left"
        >
          <span>👤 THÔNG TIN CHỦ RUỘNG & GIÁ CẢ</span>
          <span className="text-xs text-slate-400 font-normal">
            {isExpanded ? '▲ Thu gọn' : '▼ Mở rộng'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {sessionInfo.farmerName && (
            <span className="text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">
              🌾 {sessionInfo.farmerName} • {sessionInfo.riceType}
            </span>
          )}
          <button
            type="button"
            onClick={onNewSession}
            className="text-xs text-rose-600 dark:text-rose-400 font-extrabold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-all shadow-xs"
          >
            🔄 Tạo Mới
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm pt-1">
          {/* Farmer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Chủ Ruộng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Anh Tám Cò, Chú Ba..."
              value={sessionInfo.farmerName}
              onChange={(e) => handleChange('farmerName', e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-semibold focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Farmer Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              SĐT Chủ Ruộng
            </label>
            <input
              type="tel"
              placeholder="0913xxx..."
              value={sessionInfo.farmerPhone || ''}
              onChange={(e) => handleChange('farmerPhone', e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-semibold focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Buyer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Lái Mua / Ghe
            </label>
            <input
              type="text"
              placeholder="VD: Anh Ba Ghe, Thương Lái X..."
              value={sessionInfo.buyerName}
              onChange={(e) => handleChange('buyerName', e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-semibold focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Rice Variety */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Giống Lúa <span className="text-rose-500">*</span>
            </label>
            <select
              value={sessionInfo.riceType}
              onChange={(e) => {
                const varietyName = e.target.value;
                const found = POPULAR_RICE_VARIETIES.find((v) => v.name === varietyName);
                setSessionInfo((prev) => ({
                  ...prev,
                  riceType: varietyName,
                  unitPrice: found ? found.defaultPrice : prev.unitPrice,
                }));
              }}
              className={`w-full p-2.5 rounded-xl border font-lexend font-black focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                darkMode ? 'bg-slate-950 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-300 text-amber-800'
              }`}
            >
              {POPULAR_RICE_VARIETIES.map((v) => (
                <option key={v.code} value={v.name}>
                  🌾 {v.name} ({v.defaultPrice.toLocaleString()}đ)
                </option>
              ))}
            </select>
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
              Đơn Giá Lúa (đ/kg) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="100"
              placeholder="8500"
              value={sessionInfo.unitPrice}
              onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
              className={`w-full p-2.5 rounded-xl border font-lexend font-black text-base focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                darkMode ? 'bg-slate-950 border-slate-700 text-amber-400' : 'bg-amber-50/80 border-amber-300 text-amber-900'
              }`}
            />
          </div>

          {/* Tare per Bag */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Trừ Bì Bao (kg/bao)
            </label>
            <div className="flex gap-1.5">
              <input
                type="number"
                step="0.05"
                min="0"
                max="2"
                value={sessionInfo.tarePerBag}
                onChange={(e) => handleChange('tarePerBag', parseFloat(e.target.value) || 0)}
                className={`w-full p-2.5 rounded-xl border font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => handleChange('tarePerBag', 0.1)}
                className={`px-2.5 text-xs font-black rounded-xl border transition-all ${
                  sessionInfo.tarePerBag === 0.1
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
                title="Chuẩn 0.1 kg (1 lạng)"
              >
                0.1k
              </button>
            </div>
          </div>

          {/* Moisture / Impurity Deduction % */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Trừ Lép / Ẩm (%)
            </label>
            <div className="flex gap-1.5">
              <input
                type="number"
                step="0.5"
                min="0"
                max="30"
                placeholder="0"
                value={sessionInfo.impurityPercent}
                onChange={(e) => handleChange('impurityPercent', parseFloat(e.target.value) || 0)}
                className={`w-full p-2.5 rounded-xl border font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => handleChange('impurityPercent', 2)}
                className={`px-2.5 text-xs font-black rounded-xl border transition-all ${
                  sessionInfo.impurityPercent === 2
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
                title="Mưa bão trừ 2%"
              >
                2%
              </button>
            </div>
          </div>

          {/* Deposit */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Tiền Ứng / Cọc (đ)
            </label>
            <input
              type="number"
              step="500000"
              placeholder="0"
              value={sessionInfo.deposit}
              onChange={(e) => handleChange('deposit', parseFloat(e.target.value) || 0)}
              className={`w-full p-2.5 rounded-xl border font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                darkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-emerald-800'
              }`}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Ngày Cân
            </label>
            <input
              type="date"
              value={sessionInfo.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-semibold focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Field Location / Note */}
          <div className="col-span-2 sm:col-span-3 md:col-span-3">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Ghi Chú Đồng Ruộng / Địa Điểm
            </label>
            <input
              type="text"
              placeholder="VD: Ruộng kênh 3, lúa tươi gặt máy gặt đập liên hợp..."
              value={sessionInfo.note || ''}
              onChange={(e) => handleChange('note', e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>
      )}

      {selectedVarietyObj && isExpanded && (
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 italic">
          <span>💡</span>
          <span>{selectedVarietyObj.description}</span>
        </div>
      )}
    </div>
  );
};
