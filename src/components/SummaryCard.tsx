import React from 'react';
import { WeighingSession, CalculatedTotals } from '../types';
import { formatVND, formatNumber } from '../utils/formatters';

interface SummaryCardProps {
  sessionInfo: WeighingSession;
  totals: CalculatedTotals;
  onSaveSession: () => void;
  onSpeakTts: () => void;
  ttsLoading: boolean;
  ttsPlaying: boolean;
  onCopyZalo: () => void;
  onViewReceipt: () => void;
  onOpenYieldModal: () => void;
  darkMode: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  sessionInfo,
  totals,
  onSaveSession,
  onSpeakTts,
  ttsLoading,
  ttsPlaying,
  onCopyZalo,
  onViewReceipt,
  onOpenYieldModal,
  darkMode,
}) => {
  return (
    <div className={`p-5 sm:p-7 rounded-3xl border shadow-2xl transition-all duration-300 relative overflow-hidden ${
      darkMode
        ? 'bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 border-emerald-500/40 shadow-black/80'
        : 'bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white border-emerald-600 shadow-emerald-900/30'
    }`}>
      {/* Glow Accent Circle */}
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/20">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">💰</span>
          <h3 className="font-lexend font-black text-base sm:text-xl uppercase tracking-wide text-white">
            TỔNG KẾT BẢNG TÍNH TIỀN LÚA
          </h3>
        </div>

        <div className="text-xs bg-black/30 backdrop-blur-md text-emerald-200 px-3.5 py-1 rounded-full border border-white/20 font-bold shadow-inner">
          🌾 {sessionInfo.riceType || 'Lúa'} • {totals.totalBags} bao
        </div>
      </div>

      {/* 4 Primary Sub-Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-5">
        {/* Total Bags */}
        <div className="bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
          <div className="text-xs text-emerald-200 opacity-90 font-medium">Tổng số bao</div>
          <div className="text-2xl sm:text-3xl font-lexend font-black text-white">{totals.totalBags} <span className="text-xs font-normal opacity-80">bao</span></div>
          {totals.totalDrafts !== totals.totalBags && (
            <div className="text-[11px] text-emerald-200 font-bold mt-0.5">({totals.totalDrafts} lượt cân)</div>
          )}
        </div>

        {/* Gross Weight */}
        <div className="bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
          <div className="text-xs text-emerald-200 opacity-90 font-medium">Tổng cân thô</div>
          <div className="text-2xl sm:text-3xl font-lexend font-black text-white">{formatNumber(totals.grossWeight)} <span className="text-xs font-normal opacity-80">kg</span></div>
        </div>

        {/* Tare Deduction */}
        <div className="bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
          <div className="text-xs text-emerald-200 opacity-90 font-medium">Trừ bì ({sessionInfo.tareType === 'fixed_total' ? 'Cố định' : `${sessionInfo.tarePerBag}kg/bao`})</div>
          <div className="text-xl sm:text-2xl font-lexend font-black text-rose-300">-{formatNumber(totals.totalTare)} <span className="text-xs font-normal opacity-80">kg</span></div>
        </div>

        {/* Moisture / Impurity Deduction */}
        <div className="bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
          <div className="text-xs text-emerald-200 opacity-90 font-medium">Trừ lép/ẩm ({sessionInfo.impurityType === 'moisture_std' ? `Ẩm ${sessionInfo.moisturePercent}%` : sessionInfo.impurityType === 'fixed_kg' ? 'Trừ kg' : `${sessionInfo.impurityPercent}%`})</div>
          <div className="text-xl sm:text-2xl font-lexend font-black text-rose-300">-{formatNumber(totals.impurityDeduction)} <span className="text-xs font-normal opacity-80">kg</span></div>
        </div>
      </div>

      {/* Main Highlight Row: Distinct Net Weight (Emerald/KG) & Total Payable Money (Amber/VNĐ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Net Weight Card (Emerald Theme) */}
        <div className="bg-emerald-950/80 backdrop-blur-lg p-5 rounded-3xl border-2 border-emerald-400/60 shadow-2xl relative overflow-hidden">
          <div className="text-xs text-emerald-300 uppercase tracking-widest font-black flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5">⚖️ CÂN RÒNG THỰC TẾ (SAU BÌ & LÉP)</span>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">KHỐI LƯỢNG (KG)</span>
          </div>
          <div className="text-4xl sm:text-5xl font-lexend font-black text-emerald-300 drop-shadow-md tracking-tight flex items-baseline gap-2">
            <span>{formatNumber(totals.finalNetWeight)}</span>
            <span className="text-lg font-bold text-emerald-200">KG</span>
          </div>
          <div className="text-xs text-emerald-200/90 mt-2 font-medium">
            Đơn giá lúa: <strong className="text-white underline font-bold">{formatVND(sessionInfo.unitPrice)}</strong> / kg
          </div>
        </div>

        {/* Total Money Card (Amber Theme) */}
        <div className="bg-amber-950/80 backdrop-blur-lg p-5 rounded-3xl border-2 border-amber-400/60 shadow-2xl relative overflow-hidden">
          <div className="text-xs text-amber-300 uppercase tracking-widest font-black flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5">💰 TỔNG THÀNH TIỀN LÚA</span>
            <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">THÀNH TIỀN (VNĐ)</span>
          </div>
          <div className="text-4xl sm:text-5xl font-lexend font-black text-amber-300 drop-shadow-md tracking-tight flex items-baseline gap-2">
            <span>{formatVND(totals.totalAmount)}</span>
          </div>
          {totals.depositAmount > 0 ? (
            <div className="text-xs text-amber-200 mt-2 font-bold bg-amber-900/60 px-3 py-1 rounded-xl border border-amber-500/40 inline-block shadow-sm">
              Đã cọc: -{formatVND(totals.depositAmount)} | CÒN LẠI: <strong className="text-amber-300 text-sm underline">{formatVND(totals.remainingPayable)}</strong>
            </div>
          ) : (
            <div className="text-xs text-amber-200/80 mt-2 font-medium">
              Chưa trừ tiền cọc ứng trước
            </div>
          )}
        </div>
      </div>

      {/* Primary Big CTA Save Button */}
      <div className="mb-4">
        <button
          type="button"
          aria-label="Lưu và xác nhận phiếu cân lúa vào sổ"
          onClick={onSaveSession}
          className="w-full h-14 min-h-[56px] bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-98 text-slate-950 font-lexend font-black text-lg sm:text-xl rounded-2xl shadow-2xl border-2 border-white/50 transition-all flex items-center justify-center gap-2.5 uppercase tracking-wide"
        >
          <span className="text-xl">✅</span>
          <span>XÁC NHẬN & LƯU PHIẾU CÂN</span>
        </button>
      </div>

      {/* Secondary Action Buttons Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          aria-label="Phát giọng nói AI đọc kết quả cân lúa"
          onClick={onSpeakTts}
          disabled={ttsLoading}
          className={`h-12 min-h-[48px] px-3 rounded-2xl shadow-xl text-xs sm:text-sm font-lexend font-black flex items-center justify-center gap-1.5 transition-all text-white border border-white/30 ${
            ttsPlaying
              ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
              : 'bg-emerald-900/90 hover:bg-emerald-950'
          }`}
        >
          <span className="text-base">🔊</span>
          <span>{ttsLoading ? 'AI Đang Đọc...' : ttsPlaying ? 'Tắt Đọc AI' : 'AI Đọc To'}</span>
        </button>

        <button
          type="button"
          aria-label="Sao chép nội dung phiếu cân gửi Zalo"
          onClick={onCopyZalo}
          className="h-12 min-h-[48px] bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-lexend font-black px-3 rounded-2xl shadow-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-blue-400/40"
        >
          <span className="text-base">📋</span>
          <span>Gửi Zalo</span>
        </button>

        <button
          type="button"
          aria-label="Xem và in phiếu cân"
          onClick={onViewReceipt}
          className="h-12 min-h-[48px] bg-slate-950 hover:bg-black active:scale-95 text-white font-lexend font-black px-3 rounded-2xl shadow-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-slate-700"
        >
          <span className="text-base">📄</span>
          <span>Xem Phiếu</span>
        </button>

        <button
          type="button"
          aria-label="Mở máy tính lợi nhuận năng suất sào mẫu"
          onClick={onOpenYieldModal}
          className="h-12 min-h-[48px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-lexend font-black px-3 rounded-2xl shadow-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-amber-300"
        >
          <span className="text-base">📊</span>
          <span>Lợi Nhuận</span>
        </button>
      </div>
    </div>
  );
};
