import React, { useRef, useState } from 'react';
import { PRESET_BAG_WEIGHTS } from '../data/riceData';

interface WeighingPanelProps {
  currentWeight: string;
  setCurrentWeight: (val: string) => void;
  onAddWeight: (val?: number, bagsCount?: number) => void;
  onOpenOcr: () => void;
  onOpenSmartParse: () => void;
  onOpenBulkModal: () => void;
  bagCount: number;
  draftCount: number;
  darkMode: boolean;
}

export const WeighingPanel: React.FC<WeighingPanelProps> = ({
  currentWeight,
  setCurrentWeight,
  onAddWeight,
  onOpenOcr,
  onOpenSmartParse,
  onOpenBulkModal,
  bagCount,
  draftCount,
  darkMode,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [quickSound, setQuickSound] = useState(true);
  const [bagsPerDraft, setBagsPerDraft] = useState<number>(1); // Mặc định 1 bao, có thể chọn 2 bao, 3 bao...

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddWeight(undefined, bagsPerDraft);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const playBeep = () => {
    if (!quickSound) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 pitch
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Audio context might be restricted
    }
  };

  const handleQuickAdd = (w: number) => {
    playBeep();
    onAddWeight(w, bagsPerDraft);
    if (inputRef.current) inputRef.current.focus();
  };

  const numWeight = parseFloat(currentWeight.replace(',', '.'));
  const isMultiBag = bagsPerDraft > 1;
  const avgPerBag = !isNaN(numWeight) && numWeight > 0 ? (numWeight / bagsPerDraft).toFixed(1) : null;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border shadow-md transition-all ${
      darkMode
        ? 'bg-slate-800 border-amber-500/30 shadow-black/40'
        : 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-amber-600/10 border-amber-300 shadow-amber-900/10'
    }`}>
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚖️</span>
          <label className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            Nhập Mã Cân Lúa (kg)
          </label>
          <span className="text-xs bg-amber-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            Mã #{draftCount + 1} (Tổng {bagCount} bao)
          </span>
        </div>

        {/* AI & Tools Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenOcr}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1"
            title="Quét giấy cân bằng camera / ảnh"
          >
            <span>📷</span>
            <span>Quét Giấy Cân AI</span>
          </button>

          <button
            type="button"
            onClick={onOpenSmartParse}
            className="text-xs bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1"
            title="Phân tích văn bản hoặc giọng nói"
          >
            <span>✨</span>
            <span>AI Đọc Lời Nói</span>
          </button>

          <button
            type="button"
            onClick={onOpenBulkModal}
            className="text-xs bg-slate-700 hover:bg-slate-800 active:scale-95 text-white font-bold px-2.5 py-1.5 rounded-xl shadow transition-all flex items-center gap-1"
            title="Nhập chuỗi số cân cách nhau bởi dấu cách/phẩy"
          >
            <span>🔢</span>
            <span>Nhập Nhiều Mã</span>
          </button>
        </div>
      </div>

      {/* Bag Count Mode Selector (1 bao, 2 bao, 3 bao, 4 bao...) */}
      <div className="mb-3 p-2.5 bg-amber-500/10 dark:bg-slate-900/60 rounded-2xl border border-amber-300/60 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-900 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <span>📦</span> Số bao mỗi lượt cân:
          </span>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setBagsPerDraft(count)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                bagsPerDraft === count
                  ? 'bg-amber-600 text-white shadow-md scale-105 ring-2 ring-amber-400'
                  : darkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              {count === 1 ? '1 Bao' : count === 2 ? '2 Bao (Cân đôi)' : `${count} Bao`}
            </button>
          ))}
          <input
            type="number"
            min="1"
            max="20"
            value={bagsPerDraft}
            onChange={(e) => setBagsPerDraft(Math.max(1, parseInt(e.target.value) || 1))}
            className={`w-12 p-1.5 text-xs text-center font-black rounded-xl border ${
              darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-amber-900'
            }`}
            title="Số bao tùy chỉnh"
          />
        </div>
      </div>

      {/* Main Large Weight Input Box */}
      <div className="flex gap-2.5 mb-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="number"
            step="0.1"
            placeholder={isMultiBag ? `Cân tổng ${bagsPerDraft} bao (ví dụ: 101.5)` : "Ví dụ: 50.5"}
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`w-full p-3.5 text-2xl sm:text-3xl font-black rounded-2xl border text-center tracking-wider shadow-inner transition-all focus:outline-none focus:ring-4 focus:ring-amber-500/50 ${
              darkMode
                ? 'bg-slate-900 border-slate-700 text-amber-400 placeholder:text-slate-600'
                : 'bg-white border-amber-400 text-amber-900 placeholder:text-slate-300'
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 pointer-events-none flex flex-col items-end">
            <span>KG</span>
            {isMultiBag && <span className="text-[10px] text-amber-600 font-bold">{bagsPerDraft} bao</span>}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playBeep();
            onAddWeight(undefined, bagsPerDraft);
            if (inputRef.current) inputRef.current.focus();
          }}
          className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:scale-95 text-white font-black text-base sm:text-lg px-5 sm:px-6 py-3.5 rounded-2xl shadow-lg border border-amber-500/40 transition-all flex flex-col items-center justify-center leading-tight"
        >
          <div className="flex items-center gap-1">
            <span>+</span>
            <span>THÊM</span>
          </div>
          {isMultiBag && <span className="text-[10px] font-normal text-amber-200">({bagsPerDraft} bao)</span>}
        </button>
      </div>

      {/* Helper text if multi-bag */}
      {isMultiBag && (
        <div className="mb-3 text-center text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 py-1 px-3 rounded-xl">
          ⚖️ Đang cân <strong className="underline">{bagsPerDraft} bao</strong> mỗi lượt
          {avgPerBag && <span> — Trung bình: <strong className="text-amber-900 dark:text-amber-200">{avgPerBag} kg / bao</strong></span>}
        </div>
      )}

      {/* Quick 1-Touch Buttons */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <span>⚡</span> Phím bấm nhanh ({bagsPerDraft} bao / bấm):
          </span>
          <button
            type="button"
            onClick={() => setQuickSound(!quickSound)}
            className="text-[11px] text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 underline font-semibold"
          >
            {quickSound ? '🔔 Âm phím: Mở' : '🔕 Âm phím: Tắt'}
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-1.5">
          {PRESET_BAG_WEIGHTS.map((w) => {
            const actualAddWeight = bagsPerDraft > 1 ? Number((w * bagsPerDraft).toFixed(1)) : w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => handleQuickAdd(actualAddWeight)}
                className={`py-2 px-1 rounded-xl font-black text-sm border shadow-sm transition-all active:scale-90 flex flex-col items-center justify-center ${
                  darkMode
                    ? 'bg-slate-700/80 hover:bg-amber-600 hover:text-white border-slate-600 text-amber-300'
                    : 'bg-white hover:bg-amber-600 hover:text-white border-amber-200 text-slate-800 shadow-amber-900/5'
                }`}
                title={bagsPerDraft > 1 ? `${bagsPerDraft} bao x ${w}kg = ${actualAddWeight}kg` : `${w}kg`}
              >
                <span className="text-base">{actualAddWeight}</span>
                <span className="text-[9px] font-normal opacity-70">
                  {bagsPerDraft > 1 ? `${bagsPerDraft}b x ${w}k` : 'kg'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
