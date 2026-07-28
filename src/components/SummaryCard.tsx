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
    <div className={`p-5 rounded-3xl border shadow-xl transition-all ${
      darkMode
        ? 'bg-gradient-to-br from-slate-800 via-slate-850 to-amber-950/40 border-amber-500/40 shadow-black/60'
        : 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white border-amber-900 shadow-amber-900/20'
    }`}>
      {/* Title */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <h3 className="font-extrabold text-base sm:text-lg uppercase tracking-wide text-white">
            TỔNG KẾT BẢNG TÍNH TIỀN LÚA
          </h3>
        </div>

        <div className="text-xs bg-black/20 text-amber-200 px-3 py-1 rounded-full border border-white/10 font-bold">
          {sessionInfo.riceType || 'Lúa'} • {totals.totalBags} bao
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
        {/* Total Bags */}
        <div className="bg-black/20 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
          <div className="text-xs text-amber-200 opacity-90 font-medium">Tổng số bao</div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totals.totalBags} <span className="text-xs font-normal opacity-80">bao</span></div>
          {totals.totalDrafts !== totals.totalBags && (
            <div className="text-[11px] text-amber-200 font-bold mt-0.5">({totals.totalDrafts} lượt cân)</div>
          )}
        </div>

        {/* Gross Weight */}
        <div className="bg-black/20 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
          <div className="text-xs text-amber-200 opacity-90 font-medium">Tổng cân thô</div>
          <div className="text-2xl sm:text-3xl font-black text-white">{formatNumber(totals.grossWeight)} <span className="text-xs font-normal opacity-80">kg</span></div>
        </div>

        {/* Tare Deduction */}
        <div className="bg-black/20 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
          <div className="text-xs text-amber-200 opacity-90 font-medium">Trừ bì ({sessionInfo.tarePerBag}kg/bao)</div>
          <div className="text-xl sm:text-2xl font-black text-rose-200">-{formatNumber(totals.totalTare)} <span className="text-xs font-normal opacity-80">kg</span></div>
        </div>

        {/* Moisture / Impurity Deduction */}
        <div className="bg-black/20 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
          <div className="text-xs text-amber-200 opacity-90 font-medium">Trừ lép/ẩm ({sessionInfo.impurityPercent}%)</div>
          <div className="text-xl sm:text-2xl font-black text-rose-200">-{formatNumber(totals.impurityDeduction)} <span className="text-xs font-normal opacity-80">kg</span></div>
        </div>
      </div>

      {/* Bottom Highlight Row: Net Weight & Money */}
      <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/20 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs text-amber-200 uppercase tracking-wider font-bold">✨ CÂN RÒNG THỰC TẾ (SAU BÌ & LÉP)</div>
          <div className="text-3xl sm:text-4xl font-black text-amber-300 drop-shadow">
            {formatNumber(totals.finalNetWeight)} <span className="text-base font-bold text-amber-100">kg</span>
          </div>
          <div className="text-xs text-amber-100 opacity-80 mt-0.5">
            Đơn giá lúa: <strong className="text-white underline">{formatVND(sessionInfo.unitPrice)}</strong> / kg
          </div>
        </div>

        <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 border-white/20 pt-3 md:pt-0">
          <div className="text-xs text-amber-200 uppercase tracking-wider font-bold">💵 TỔNG THÀNH TIỀN LÚA</div>
          <div className="text-3xl sm:text-4xl font-black text-white drop-shadow">
            {formatVND(totals.totalAmount)}
          </div>
          {totals.depositAmount > 0 && (
            <div className="text-xs text-amber-200 mt-1 font-semibold bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-500/30 inline-block">
              Đã cọc/ứng: -{formatVND(totals.depositAmount)} | CÒN LẠI: <strong className="text-white text-sm underline">{formatVND(totals.remainingPayable)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        <button
          type="button"
          onClick={onSaveSession}
          className="bg-white text-amber-900 hover:bg-amber-50 active:scale-95 font-black py-3 px-3 rounded-2xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-amber-200"
        >
          <span>💾</span>
          <span>Lưu Sổ Cân</span>
        </button>

        <button
          type="button"
          onClick={onSpeakTts}
          disabled={ttsLoading}
          className={`py-3 px-3 rounded-2xl shadow-lg text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all text-white border border-white/20 ${
            ttsPlaying
              ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
              : 'bg-emerald-700 hover:bg-emerald-800'
          }`}
        >
          <span>🔊</span>
          <span>{ttsLoading ? 'AI Đang đọc...' : ttsPlaying ? 'Tắt Đọc AI' : 'AI Đọc To'}</span>
        </button>

        <button
          type="button"
          onClick={onCopyZalo}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black py-3 px-3 rounded-2xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-blue-400/30"
        >
          <span>📋</span>
          <span>Gửi Zalo</span>
        </button>

        <button
          type="button"
          onClick={onViewReceipt}
          className="bg-slate-900 hover:bg-black active:scale-95 text-white font-black py-3 px-3 rounded-2xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-slate-700"
        >
          <span>📄</span>
          <span>Xem Phiếu</span>
        </button>

        <button
          type="button"
          onClick={onOpenYieldModal}
          className="col-span-2 sm:col-span-1 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black py-3 px-3 rounded-2xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-amber-300"
        >
          <span>📊</span>
          <span>Tính Lãi / Công</span>
        </button>
      </div>
    </div>
  );
};
