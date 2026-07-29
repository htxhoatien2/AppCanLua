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
      osc.frequency.value = 920; // Pitch cao rõ nét
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Restrict AudioContext
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
    <div className={`p-4 sm:p-6 rounded-3xl border shadow-2xl transition-all duration-300 relative overflow-hidden ${
      darkMode
        ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-amber-500/30 shadow-black/60'
        : 'bg-gradient-to-br from-white via-amber-50/40 to-amber-100/30 border-amber-300/80 shadow-amber-900/10'
    }`}>
      {/* Background Accent Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce">⚖️</span>
          <h2 className="font-lexend font-black text-base sm:text-lg text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            Nhập Mã Cân Lúa (KG)
          </h2>
          <span className="text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-3 py-1 rounded-full shadow-md">
            Mã #{draftCount + 1} (Đã có {bagCount} bao)
          </span>
        </div>

        {/* AI & Smart Action Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenOcr}
            className="text-xs bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-white font-lexend font-black px-3.5 py-2 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-1.5 border border-emerald-400/30"
            title="Quét giấy cân bằng camera / ảnh"
          >
            <span className="text-sm">📷</span>
            <span>Quét Giấy Cân AI</span>
          </button>

          <button
            type="button"
            onClick={onOpenSmartParse}
            className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-lexend font-black px-3.5 py-2 rounded-2xl shadow-lg shadow-purple-900/20 transition-all flex items-center gap-1.5 border border-purple-400/30"
            title="Phân tích văn bản hoặc giọng nói"
          >
            <span className="text-sm">✨</span>
            <span>AI Đọc Lời Nói</span>
          </button>

          <button
            type="button"
            onClick={onOpenBulkModal}
            className="text-xs bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold px-3 py-2 rounded-2xl border border-slate-700 shadow transition-all flex items-center gap-1.5"
            title="Nhập chuỗi số cân cách nhau bởi dấu cách/phẩy"
          >
            <span>🔢</span>
            <span>Nhập Nhiều Mã</span>
          </button>
        </div>
      </div>

      {/* Bag Count Mode Selector (1 bao, 2 bao, 3 bao, 4 bao...) */}
      <div className={`mb-4 p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-inner ${
        darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-amber-500/10 border-amber-300/60'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-lexend font-black text-amber-900 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>📦</span> Số bao mỗi lượt cân:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setBagsPerDraft(count)}
              className={`px-3.5 py-1.5 rounded-xl font-lexend font-black text-xs transition-all ${
                bagsPerDraft === count
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg scale-105 ring-2 ring-amber-300'
                  : darkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200 shadow-sm'
              }`}
            >
              {count === 1 ? '1 Bao' : count === 2 ? '2 Bao (Cân đôi)' : `${count} Bao`}
            </button>
          ))}
          <div className="flex items-center gap-1 ml-1">
            <span className="text-[11px] text-slate-400 font-bold">Khác:</span>
            <input
              type="number"
              min="1"
              max="20"
              value={bagsPerDraft}
              onChange={(e) => setBagsPerDraft(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-12 p-1.5 text-xs text-center font-black rounded-xl border ${
                darkMode ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-amber-900'
              }`}
              title="Số bao tùy chỉnh"
            />
          </div>
        </div>
      </div>

      {/* Main Large Weight Input Box */}
      <div className="flex gap-3 mb-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="number"
            step="0.1"
            aria-label="Nhập khối lượng cân thô tính bằng kg"
            placeholder={isMultiBag ? `Ví dụ: 101.5 (cho ${bagsPerDraft} bao)` : "Ví dụ: 50.5"}
            value={currentWeight}
            onFocus={(e) => e.target.select()}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            onChange={(e) => setCurrentWeight(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`w-full p-4 sm:p-5 text-3xl sm:text-5xl font-lexend font-black rounded-2xl border text-center tracking-wider shadow-inner transition-all focus:outline-none focus:ring-4 ${
              darkMode
                ? 'bg-slate-950 border-slate-700 text-amber-400 placeholder:text-slate-700 focus:ring-amber-500/30 focus:border-amber-500'
                : 'bg-white border-amber-400 text-amber-950 placeholder:text-slate-300 focus:ring-amber-500/40 focus:border-amber-500'
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 pointer-events-none flex flex-col items-end">
            <span className="text-amber-500 font-lexend text-base">KG</span>
            {isMultiBag && <span className="text-xs text-amber-600 font-bold">({bagsPerDraft} bao)</span>}
          </span>
        </div>

        <button
          type="button"
          aria-label="Thêm mã cân vừa nhập vào danh sách"
          onClick={() => {
            playBeep();
            onAddWeight(undefined, bagsPerDraft);
            if (inputRef.current) inputRef.current.focus();
          }}
          className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 active:scale-95 text-slate-950 font-lexend font-black text-lg sm:text-xl px-6 sm:px-8 rounded-2xl shadow-xl shadow-amber-500/20 border border-amber-400/40 transition-all flex flex-col items-center justify-center leading-none tracking-wide h-14 min-h-[56px] min-w-[100px]"
        >
          <div className="flex items-center gap-1">
            <span>+</span>
            <span>THÊM</span>
          </div>
          {isMultiBag && <span className="text-[11px] font-bold text-slate-900 mt-1">({bagsPerDraft} bao)</span>}
        </button>
      </div>

      {/* Helper text if multi-bag */}
      {isMultiBag && (
        <div className="mb-4 text-center text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 py-2 px-3 rounded-xl border border-amber-500/20">
          ⚖️ Đang cân tổng <strong className="underline text-amber-900 dark:text-amber-200">{bagsPerDraft} bao</strong> mỗi lượt
          {avgPerBag && <span> — Trung bình: <strong className="text-amber-950 dark:text-amber-100">{avgPerBag} kg / bao</strong></span>}
        </div>
      )}

      {/* Quick 1-Touch Buttons */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-lexend font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span>⚡</span> Phím Bấm Nhanh ({bagsPerDraft} bao / lượt):
          </span>
          <button
            type="button"
            onClick={() => setQuickSound(!quickSound)}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 underline font-bold py-1 px-2 rounded"
          >
            {quickSound ? '🔔 Âm Phím: Mở' : '🔕 Âm Phím: Tắt'}
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-1.5 sm:gap-2">
          {PRESET_BAG_WEIGHTS.map((w) => {
            const actualAddWeight = bagsPerDraft > 1 ? Number((w * bagsPerDraft).toFixed(1)) : w;
            return (
              <button
                key={w}
                type="button"
                aria-label={`Thêm số cân nhanh ${actualAddWeight} kg`}
                onClick={() => handleQuickAdd(actualAddWeight)}
                className={`min-h-[48px] py-2.5 px-1 rounded-2xl font-lexend font-black text-sm border shadow-sm transition-all active:scale-90 flex flex-col items-center justify-center ${
                  darkMode
                    ? 'bg-slate-800/90 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 border-slate-700 text-amber-300 hover:border-amber-400'
                    : 'bg-white hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 border-amber-300 text-slate-900 shadow-amber-900/5 hover:border-amber-400'
                }`}
                title={bagsPerDraft > 1 ? `${bagsPerDraft} bao x ${w}kg = ${actualAddWeight}kg` : `${w}kg`}
              >
                <span className="text-base sm:text-lg leading-none">{actualAddWeight}</span>
                <span className="text-[10px] font-normal opacity-80 mt-0.5">
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
