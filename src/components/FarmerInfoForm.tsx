import React, { useState } from 'react';
import { WeighingSession, AdminConfig } from '../types';

interface FarmerInfoFormProps {
  sessionInfo: WeighingSession;
  setSessionInfo: React.Dispatch<React.SetStateAction<WeighingSession>>;
  adminConfig: AdminConfig;
  darkMode: boolean;
  onNewSession: () => void;
}

export const FarmerInfoForm: React.FC<FarmerInfoFormProps> = ({
  sessionInfo,
  setSessionInfo,
  adminConfig,
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

  const selectedVarietyObj = adminConfig.varieties.find((v) => v.name === sessionInfo.riceType);

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border shadow-xl transition-all duration-300 ${
      darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-emerald-200/90 shadow-emerald-950/5'
    }`}>
      {/* Card Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-emerald-500/20">
        <div className="flex items-center gap-2 font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
          <span>📋 THÔNG TIN THỬA RUỘNG & GIÁ CẢ</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewSession}
            className="text-xs text-rose-600 dark:text-rose-400 font-extrabold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-all shadow-xs"
          >
            🔄 Tạo Mới
          </button>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Group 1: Parties Info */}
        <div className="space-y-2">
          <div>
            <label htmlFor="farmerNameInput" className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Chủ Ruộng (Bên bán) <span className="text-rose-500">*</span>
            </label>
            <input
              id="farmerNameInput"
              type="text"
              placeholder="VD: Anh Tám, Chú Ba..."
              value={sessionInfo.farmerName}
              onChange={(e) => handleChange('farmerName', e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-bold text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all ${
                darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="truckInfoInput" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Xe Nhận / Biển Số Xe <span className="text-rose-500">*</span>
              </label>
              <input
                id="truckInfoInput"
                type="text"
                list="trucks-list"
                placeholder="VD: Xe 43C-123.45..."
                value={sessionInfo.truckInfo}
                onChange={(e) => handleChange('truckInfo', e.target.value)}
                className={`w-full p-2 rounded-xl border font-bold text-xs focus:outline-none focus:ring-4 focus:ring-emerald-500/30 ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <datalist id="trucks-list">
                {adminConfig.trucks.map((t, i) => <option key={i} value={t} />)}
              </datalist>
            </div>

            <div>
              <label htmlFor="operatorNameInput" className="block font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                Người Cân <span className="text-rose-500">*</span>
              </label>
              <input
                id="operatorNameInput"
                type="text"
                list="operators-list"
                placeholder="VD: Phạm Công Tuân..."
                value={sessionInfo.operatorName}
                onChange={(e) => handleChange('operatorName', e.target.value)}
                className={`w-full p-2 rounded-xl border font-bold text-xs focus:outline-none focus:ring-4 focus:ring-emerald-500/30 ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-emerald-300' : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                }`}
              />
              <datalist id="operators-list">
                {adminConfig.operators.map((op, i) => <option key={i} value={op} />)}
              </datalist>
            </div>
          </div>
        </div>

        {/* Group 2: Rice & Price */}
        <div className="grid grid-cols-2 gap-2 border-t border-b border-emerald-500/10 py-2.5">
          <div>
            <label htmlFor="riceTypeSelect" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Giống Lúa <span className="text-rose-500">*</span>
            </label>
            <select
              id="riceTypeSelect"
              value={sessionInfo.riceType}
              onChange={(e) => {
                const varietyName = e.target.value;
                const found = adminConfig.varieties.find((v) => v.name === varietyName);
                setSessionInfo((prev) => ({
                  ...prev,
                  riceType: varietyName,
                  unitPrice: found ? found.defaultPrice : prev.unitPrice,
                }));
              }}
              className={`w-full p-2 rounded-xl border font-lexend font-black text-xs ${
                darkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-emerald-800'
              }`}
            >
              {adminConfig.varieties.map((v) => (
                <option key={v.name} value={v.name}>
                  🌾 {v.name} ({v.defaultPrice.toLocaleString()}đ)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="unitPriceInput" className="block font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
              Đơn Giá (đ/kg) <span className="text-rose-500">*</span>
            </label>
            <input
              id="unitPriceInput"
              type="number"
              step="100"
              placeholder="8500"
              value={sessionInfo.unitPrice}
              onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
              className={`w-full p-2 rounded-xl border font-lexend font-black text-sm ${
                darkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              }`}
            />
          </div>
        </div>

        {/* Group 3: Deductions */}
        <div className="space-y-2">
          {/* Tare */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-600 dark:text-slate-300">Trừ Bì Bao:</label>
              <select
                value={sessionInfo.tareType || 'per_bag'}
                onChange={(e: any) => handleChange('tareType', e.target.value)}
                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-slate-800 rounded px-1.5 py-0.5 border border-emerald-300/60"
              >
                <option value="per_bag">Kg / Bao</option>
                <option value="fixed_total">Cố định lô</option>
              </select>
            </div>

            {sessionInfo.tareType === 'fixed_total' ? (
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="Trừ tổng 5kg bì..."
                value={sessionInfo.tareFixedTotal || 0}
                onChange={(e) => handleChange('tareFixedTotal', parseFloat(e.target.value) || 0)}
                className={`w-full p-2 rounded-xl border font-bold ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-rose-400' : 'bg-slate-50 border-slate-300 text-rose-800'
                }`}
              />
            ) : (
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="2"
                  value={sessionInfo.tarePerBag}
                  onChange={(e) => handleChange('tarePerBag', parseFloat(e.target.value) || 0)}
                  className={`w-full p-2 rounded-xl border font-bold ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleChange('tarePerBag', 0.1)}
                  className={`px-2 text-xs font-black rounded-xl border ${
                    sessionInfo.tarePerBag === 0.1
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  0.1k
                </button>
              </div>
            )}
          </div>

          {/* Impurity */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-600 dark:text-slate-300">Trừ Lép / Ẩm:</label>
              <select
                value={sessionInfo.impurityType || 'percent'}
                onChange={(e: any) => handleChange('impurityType', e.target.value)}
                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-slate-800 rounded px-1.5 py-0.5 border border-emerald-300/60"
              >
                <option value="percent">Trừ % lép</option>
                <option value="fixed_kg">Trừ kg lép</option>
                <option value="moisture_std">Quy đổi ẩm 14%</option>
              </select>
            </div>

            {sessionInfo.impurityType === 'fixed_kg' ? (
              <input
                type="number"
                step="1"
                min="0"
                placeholder="Trừ 10kg lép..."
                value={sessionInfo.impurityFixedKg || 0}
                onChange={(e) => handleChange('impurityFixedKg', parseFloat(e.target.value) || 0)}
                className={`w-full p-2 rounded-xl border font-bold ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-rose-400' : 'bg-slate-50 border-slate-300 text-rose-800'
                }`}
              />
            ) : sessionInfo.impurityType === 'moisture_std' ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="14"
                  max="35"
                  placeholder="Ẩm tươi %"
                  value={sessionInfo.moisturePercent || 20}
                  onChange={(e) => handleChange('moisturePercent', parseFloat(e.target.value) || 14)}
                  className={`w-full p-2 rounded-xl border font-bold text-xs ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-teal-400' : 'bg-teal-50 border-teal-300 text-teal-900'
                  }`}
                />
                <span className="text-[10px] font-bold text-slate-400">% ẩm</span>
              </div>
            ) : (
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="30"
                  placeholder="0"
                  value={sessionInfo.impurityPercent}
                  onChange={(e) => handleChange('impurityPercent', parseFloat(e.target.value) || 0)}
                  className={`w-full p-2 rounded-xl border font-bold ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleChange('impurityPercent', 2)}
                  className={`px-2 text-xs font-black rounded-xl border ${
                    sessionInfo.impurityPercent === 2
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  2%
                </button>
              </div>
            )}
          </div>

          {/* Location & Deposit */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block font-semibold text-slate-500 mb-0.5">Tiền Cọc (đ):</label>
              <input
                type="number"
                step="500000"
                placeholder="0"
                value={sessionInfo.deposit}
                onChange={(e) => handleChange('deposit', parseFloat(e.target.value) || 0)}
                className={`w-full p-2 rounded-xl border font-bold ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-emerald-800'
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-500 mb-0.5">Địa Điểm Cân:</label>
              <input
                type="text"
                list="locations-list"
                placeholder="Cánh đồng..."
                value={sessionInfo.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className={`w-full p-2 rounded-xl border text-xs font-semibold ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <datalist id="locations-list">
                {adminConfig.locations.map((loc, i) => <option key={i} value={loc} />)}
              </datalist>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
