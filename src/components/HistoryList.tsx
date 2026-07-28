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

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      (s.farmerName && s.farmerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.buyerName && s.buyerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.date && s.date.includes(searchTerm));
    
    const matchesVariety = varietyFilter === 'ALL' || s.riceType === varietyFilter;

    return matchesSearch && matchesVariety;
  });

  // Total summary across history
  const totalKg = filteredSessions.reduce((acc, s) => acc + (s.calculated?.finalNetWeight || 0), 0);
  const totalRevenue = filteredSessions.reduce((acc, s) => acc + (s.calculated?.totalAmount || 0), 0);

  const handleDownloadCSV = () => {
    if (sessions.length === 0) return;
    const csvContent = exportSessionsToCSV(sessions);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `So_Can_Lua_Lich_Su_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Search */}
      <div className={`p-4 rounded-2xl border shadow-sm ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-amber-200'
      }`}>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              📜 SỔ CÂN LÚA LỊCH SỬ ({filteredSessions.length} phiếu)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý toàn bộ nhật ký thu hoạch, in ấn và chia sẻ lại cho nông dân
            </p>
          </div>

          <button
            onClick={handleDownloadCSV}
            disabled={sessions.length === 0}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <span>📥 Xuất File Excel / CSV</span>
          </button>
        </div>

        {/* Search & Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên chủ ruộng, thương lái, ngày..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`p-2.5 rounded-xl border text-xs sm:text-sm ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />

          <select
            value={varietyFilter}
            onChange={(e) => setVarietyFilter(e.target.value)}
            className={`p-2.5 rounded-xl border text-xs sm:text-sm font-bold ${
              darkMode ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="ALL">Tất cả giống lúa</option>
            <option value="OM 5451">OM 5451</option>
            <option value="OM 18">OM 18</option>
            <option value="Đài Thơm 8">Đài Thơm 8</option>
            <option value="ST 24">ST 24</option>
            <option value="ST 25">ST 25</option>
            <option value="IR 50404">IR 50404</option>
          </select>

          {/* History Total Banner */}
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between px-3 text-xs font-bold text-amber-800 dark:text-amber-300">
            <span>Tổng sản lượng: <strong>{formatNumber(totalKg)} kg</strong></span>
            <span>Doanh thu: <strong>{formatVND(totalRevenue)}</strong></span>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="text-4xl mb-2">📜</div>
          <p className="font-bold text-sm text-slate-600 dark:text-slate-300">Không tìm thấy phiếu cân nào</p>
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
                className={`p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-amber-200/80'
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-extrabold text-base text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      👤 {session.farmerName || 'Chủ ruộng (Chưa nhập)'}
                      <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                        {session.riceType}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      🗓 Ngày: {session.date} • Lái mua: <strong>{session.buyerName || 'Chưa rõ'}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black bg-amber-600 text-white px-3 py-1 rounded-full shadow-sm">
                      {calc?.totalBags || session.bagWeights.length} bao
                      {calc?.totalDrafts && calc.totalDrafts !== calc.totalBags ? ` (${calc.totalDrafts} mã)` : ''}
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CÂN RÒNG THỰC TẾ:</span>
                    <strong className="text-amber-700 dark:text-amber-400 text-sm">{formatNumber(calc?.finalNetWeight || 0)} kg</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">ĐƠN GIÁ:</span>
                    <strong className="text-slate-900 dark:text-white">{formatVND(session.unitPrice)}/kg</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">THÀNH TIỀN:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{formatVND(calc?.totalAmount || 0)}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">CÒN LẠI:</span>
                    <strong className="text-rose-600 dark:text-rose-400">{formatVND(calc?.remainingPayable || 0)}</strong>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => onCopyZalo(session)}
                    className="px-3 py-1.5 text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-900 transition-colors"
                  >
                    📋 Zalo
                  </button>

                  <button
                    onClick={() => onLoadSessionToEdit(session)}
                    className="px-3 py-1.5 text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded-lg border border-amber-200 dark:border-amber-900 transition-colors"
                  >
                    ✏️ Sửa / Nối Cân
                  </button>

                  <button
                    onClick={() => onSelectSession(session)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-black rounded-lg transition-colors"
                  >
                    📄 Xem Phiếu
                  </button>

                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
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
