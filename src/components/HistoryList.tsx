import React, { useState } from 'react';
import { WeighingSession } from '../types';
import { formatVND, formatNumber, exportSessionsToCSV } from '../utils/formatters';

interface HistoryListProps {
  sessions: WeighingSession[];
  onSelectSession: (s: WeighingSession) => void;
  onLoadSessionToEdit: (s: WeighingSession) => void;
  onDeleteSession: (id: string) => void;
  onCopyZalo: (s: WeighingSession) => void;
  darkMode: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  sessions,
  onSelectSession,
  onLoadSessionToEdit,
  onDeleteSession,
  onCopyZalo,
  darkMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [varietyFilter, setVarietyFilter] = useState('ALL');
  const [operatorFilter, setOperatorFilter] = useState('ALL');

  // Available operators list
  const operatorList = Array.from(new Set(sessions.map((s) => s.operatorName || 'Phạm Công Tuân')));

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      (s.farmerName && s.farmerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.truckInfo && s.truckInfo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.operatorName && s.operatorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.date && s.date.includes(searchTerm));
    
    const matchesVariety = varietyFilter === 'ALL' || s.riceType === varietyFilter;
    const matchesOperator = operatorFilter === 'ALL' || (s.operatorName || 'Phạm Công Tuân') === operatorFilter;

    return matchesSearch && matchesVariety && matchesOperator;
  });

  const totalKg = filteredSessions.reduce((acc, s) => acc + (s.calculated?.finalNetWeight || 0), 0);
  const totalRevenue = filteredSessions.reduce((acc, s) => acc + (s.calculated?.totalAmount || 0), 0);

  const handleDownloadCSV = () => {
    if (sessions.length === 0) return;
    const csvContent = exportSessionsToCSV(filteredSessions);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `So_Can_Lua_HTX_HoaTien2_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner & Search */}
      <div className={`p-5 rounded-3xl border shadow-xl transition-all duration-300 ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-amber-200/90'
      }`}>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div>
            <h2 className="font-lexend font-black text-base sm:text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              📜 SỔ CÂN HTX HÒA TIẾN 2 ({filteredSessions.length} phiếu)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Quản lý toàn bộ nhật ký thu hoạch lúa, phân loại theo Cán bộ cân & Xe nhận
            </p>
          </div>

          <button
            onClick={handleDownloadCSV}
            disabled={filteredSessions.length === 0}
            className="text-xs bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-lexend font-black px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-1.5 border border-emerald-400/30"
          >
            <span>📥 Xuất Báo Cáo Excel / CSV</span>
          </button>
        </div>

        {/* Search & Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="🔍 Tìm tên chủ ruộng, xe nhận, người cân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`p-3 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-500/30 ${
              darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />

          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className={`p-3 rounded-2xl border text-xs sm:text-sm font-lexend font-bold ${
              darkMode ? 'bg-slate-950 border-slate-800 text-amber-300' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="ALL">👤 Tất cả Cán Bộ Cân</option>
            {operatorList.map((op, idx) => (
              <option key={idx} value={op}>{op}</option>
            ))}
          </select>

          <select
            value={varietyFilter}
            onChange={(e) => setVarietyFilter(e.target.value)}
            className={`p-3 rounded-2xl border text-xs sm:text-sm font-lexend font-bold ${
              darkMode ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="ALL">🌾 Tất cả giống lúa</option>
            <option value="HG12">HG12</option>
            <option value="HG244">HG244</option>
            <option value="HT1">HT1</option>
            <option value="ĐT100">ĐT100</option>
            <option value="J02">J02</option>
          </select>

          {/* History Total Banner */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between px-3.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
            <span>Sản lượng: <strong className="font-lexend font-black text-amber-700 dark:text-amber-400">{formatNumber(totalKg)} kg</strong></span>
            <span>Doanh thu: <strong className="font-lexend font-black text-emerald-700 dark:text-emerald-400">{formatVND(totalRevenue)}</strong></span>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50/50 dark:bg-slate-950/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="text-4xl mb-2">📜</div>
          <p className="font-lexend font-bold text-sm text-slate-600 dark:text-slate-300">Không tìm thấy phiếu cân nào</p>
          <p className="text-xs text-slate-400 mt-1">
            Hãy bắt đầu nhập cân lúa và bấm 💾 Lưu Sổ Cân để lưu dữ liệu tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const calc = session.calculated;

            return (
              <div
                key={session.id}
                className={`p-5 rounded-3xl border shadow-md transition-all duration-200 hover:shadow-xl ${
                  darkMode ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white/90 border-amber-200/90 hover:border-amber-400'
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-lexend font-black text-base text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      👤 {session.farmerName || 'Chủ ruộng (Chưa nhập)'}
                      <span className="text-xs bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30">
                        🌾 {session.riceType}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      🗓 Ngày: {session.date} • Xe nhận: <strong className="text-slate-700 dark:text-slate-200">{session.truckInfo || 'Xe HTX'}</strong> • Người cân: <strong className="text-amber-600 dark:text-amber-300">{session.operatorName || 'Phạm Công Tuân'}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-lexend font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3 py-1 rounded-full shadow-sm">
                      {calc?.totalBags || session.bagWeights.length} bao
                      {calc?.totalDrafts && calc.totalDrafts !== calc.totalBags ? ` (${calc.totalDrafts} mã)` : ''}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-lexend">CÂN RÒNG THỰC TẾ:</span>
                    <strong className="text-amber-700 dark:text-amber-400 font-lexend font-black text-base">{formatNumber(calc?.finalNetWeight || 0)} kg</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-lexend">ĐƠN GIÁ:</span>
                    <strong className="text-slate-900 dark:text-white font-lexend text-sm">{formatVND(session.unitPrice)}/kg</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-lexend">THÀNH TIỀN:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-lexend font-black text-base">{formatVND(calc?.totalAmount || 0)}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-lexend">CÒN LẠI:</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-lexend font-extrabold text-sm">{formatVND(calc?.remainingPayable || 0)}</strong>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onCopyZalo(session)}
                    className="px-3.5 py-1.5 text-xs font-lexend font-black bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 rounded-xl border border-blue-200 dark:border-blue-900 transition-all shadow-xs"
                  >
                    📋 Zalo
                  </button>

                  <button
                    onClick={() => onLoadSessionToEdit(session)}
                    className="px-3.5 py-1.5 text-xs font-lexend font-black bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded-xl border border-amber-200 dark:border-amber-900 transition-all shadow-xs"
                  >
                    ✏️ Sửa / Nối Cân
                  </button>

                  <button
                    onClick={() => onSelectSession(session)}
                    className="px-3.5 py-1.5 text-xs font-lexend font-black bg-slate-950 text-white hover:bg-black rounded-xl transition-all shadow-sm"
                  >
                    📄 Xem Phiếu
                  </button>

                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="px-3 py-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
                    title="Xóa phiếu này"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
