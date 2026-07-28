import React, { useState } from 'react';
import { WeighingEntry } from '../types';
import { normalizeEntry } from '../utils/formatters';

interface BagListProps {
  bagWeights: (number | WeighingEntry)[];
  onRemoveWeight: (index: number) => void;
  onClearAll: () => void;
  onUpdateWeight: (index: number, newWeight: number, newBagsCount?: number) => void;
  darkMode: boolean;
}

export const BagList: React.FC<BagListProps> = ({
  bagWeights,
  onRemoveWeight,
  onClearAll,
  onUpdateWeight,
  darkMode,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingWeight, setEditingWeight] = useState<string>('');
  const [editingBagsCount, setEditingBagsCount] = useState<number>(1);

  const entries = (bagWeights || []).map(normalizeEntry);
  const totalBags = entries.reduce((acc, curr) => acc + curr.bagsCount, 0);
  const totalDrafts = entries.length;
  const grossWeight = entries.reduce((acc, curr) => acc + curr.weight, 0);

  const allSingleBagWeights = entries.flatMap(e => {
    const avg = e.weight / (e.bagsCount || 1);
    return Array(e.bagsCount).fill(avg);
  });

  const minBag = allSingleBagWeights.length > 0 ? Math.min(...allSingleBagWeights).toFixed(1) : '0';
  const maxBag = allSingleBagWeights.length > 0 ? Math.max(...allSingleBagWeights).toFixed(1) : '0';
  const avgBag = totalBags > 0 ? (grossWeight / totalBags).toFixed(1) : '0';

  const handleStartEdit = (index: number, entry: WeighingEntry) => {
    setEditingIndex(index);
    setEditingWeight(entry.weight.toString());
    setEditingBagsCount(entry.bagsCount);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const w = parseFloat(editingWeight);
      const b = Math.max(1, editingBagsCount);
      if (!isNaN(w) && w > 0) {
        onUpdateWeight(editingIndex, w, b);
      }
      setEditingIndex(null);
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-amber-200/80'
    }`}>
      {/* Top Title & Controls */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pb-2 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100">
            DANH SÁCH MÃ CÂN ({totalBags} bao / {totalDrafts} mã cân)
          </h3>
        </div>

        {totalDrafts > 0 && (
          <div className="flex items-center gap-3">
            {/* Quick Metrics */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Thô: <strong className="text-amber-600">{grossWeight.toFixed(1)}kg</strong></span>
              <span>•</span>
              <span>TB: <strong className="text-amber-600">{avgBag}kg/bao</strong></span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn XÓA TẤT CẢ các mã cân đã nhập?')) {
                  onClearAll();
                }
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-all hover:bg-rose-100"
            >
              🗑️ Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {totalDrafts === 0 ? (
        <div className="text-center py-10 px-4 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
          <div className="text-4xl mb-2">🌾</div>
          <p className="font-bold text-sm text-slate-600 dark:text-slate-300">Chưa có mã cân nào trong phiếu này</p>
          <p className="text-xs text-slate-400 mt-1">
            Chọn 1 bao / 2 bao (cân đôi) / 3 bao..., bấm chọn phím nhanh, gõ tay hoặc dùng 📷 Quét Giấy Cân AI!
          </p>
        </div>
      ) : (
        <>
          {/* Quick Stats Bar */}
          <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs flex flex-wrap justify-between items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
            <span>Tổng cân thô: <strong className="text-amber-700 dark:text-amber-400 font-black text-sm">{grossWeight.toFixed(1)} kg</strong> ({totalBags} bao)</span>
            <span>Bao nhẹ nhất: <strong>{minBag} kg</strong></span>
            <span>Bao nặng nhất: <strong>{maxBag} kg</strong></span>
            <span>Trung bình: <strong>{avgBag} kg/bao</strong></span>
          </div>

          {/* Bag Weights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto p-1 scrollbar-thin">
            {entries.map((entry, idx) => {
              const isEditing = editingIndex === idx;
              const isMulti = entry.bagsCount > 1;
              const avgThisEntry = isMulti ? (entry.weight / entry.bagsCount).toFixed(1) : null;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-sm font-bold shadow-sm ${
                    isMulti
                      ? darkMode
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 hover:border-amber-400'
                        : 'bg-amber-50 border-amber-300 text-amber-950 hover:border-amber-500'
                      : darkMode
                        ? 'bg-slate-900 border-slate-700 text-slate-100 hover:border-amber-500/50'
                        : 'bg-slate-50/80 border-slate-200 text-slate-900 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                      #{idx + 1}
                    </span>

                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          autoFocus
                          value={editingWeight}
                          onChange={(e) => setEditingWeight(e.target.value)}
                          className="w-16 p-1 text-xs font-black border border-amber-500 rounded bg-white text-slate-900 text-center"
                        />
                        <span className="text-[10px]">kg</span>
                        <select
                          value={editingBagsCount}
                          onChange={(e) => setEditingBagsCount(parseInt(e.target.value) || 1)}
                          className="p-1 text-[11px] font-bold border border-amber-500 rounded bg-white text-slate-900"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((b) => (
                            <option key={b} value={b}>{b} bao</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="text-xs bg-emerald-600 text-white font-extrabold px-2 py-1 rounded"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartEdit(idx, entry)}
                        className="cursor-pointer hover:underline flex flex-col min-w-0"
                        title="Bấm để sửa mã cân này"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-700 dark:text-amber-400 font-black text-base">
                            {entry.weight} <span className="text-xs font-normal text-slate-400">kg</span>
                          </span>
                          {isMulti && (
                            <span className="text-[10px] bg-amber-600 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                              {entry.bagsCount} bao
                            </span>
                          )}
                        </div>
                        {isMulti && avgThisEntry && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                            ~{avgThisEntry} kg / bao
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(idx, entry)}
                        className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-amber-100/50"
                        title="Sửa mã cân"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveWeight(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-100/50 font-black text-xs"
                        title="Xóa mã này"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
