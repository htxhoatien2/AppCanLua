import React, { useState } from 'react';
import { WeighingSession } from '../../types';
import { exportSessionsToCSV, formatNumber } from '../../utils/formatters';

interface AdminExportPageProps {
  sessions: WeighingSession[];
  darkMode: boolean;
}

export const AdminExportPage: React.FC<AdminExportPageProps> = ({ sessions, darkMode }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'all' | '30days' | '7days'>('all');
  const [selectedOperator, setSelectedOperator] = useState('all');

  const operatorsList = Array.from(new Set(sessions.map((s) => s.operatorName || 'Phạm Công Tuân')));

  const filtered = sessions.filter((s) => {
    if (selectedOperator !== 'all' && (s.operatorName || 'Phạm Công Tuân') !== selectedOperator) {
      return false;
    }
    if (dateRange !== 'all') {
      const cutoff = new Date();
      if (dateRange === '7days') cutoff.setDate(cutoff.getDate() - 7);
      if (dateRange === '30days') cutoff.setDate(cutoff.getDate() - 30);
      cutoff.setHours(0, 0, 0, 0);
      const sessionDate = new Date(s.date || s.createdAt);
      if (sessionDate < cutoff) return false;
    }
    return true;
  });

  const handleExportNow = () => {
    if (filtered.length === 0) {
      return alert('Không có dữ liệu phiếu cân nào phù hợp với bộ lọc!');
    }

    const dateStr = new Date().toISOString().split('T')[0];

    if (exportFormat === 'csv') {
      const csv = exportSessionsToCSV(filtered);
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bao_Cao_Thu_Hoach_HTX_HoaTien2_${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonStr = JSON.stringify(filtered, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Du_Lieu_Phieu_Can_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-emerald-200/90'
      }`}>
        <h3 className="font-lexend font-black text-xl text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
          <span>📤</span> XUẤT DỮ LIỆU BÁO CÁO HTX HÒA TIẾN 2
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
          Kết xuất số liệu thu hoạch lúa ra các định dạng Excel CSV, JSON báo cáo theo bộ lọc
        </p>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Định Dạng File Xuất:
            </label>
            <select
              value={exportFormat}
              onChange={(e: any) => setExportFormat(e.target.value)}
              className={`w-full p-3 rounded-2xl border font-lexend font-bold text-xs ${
                darkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="csv">📊 Excel CSV (.csv)</option>
              <option value="json">📄 Dữ liệu JSON (.json)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Khoảng Thời Gian:
            </label>
            <select
              value={dateRange}
              onChange={(e: any) => setDateRange(e.target.value)}
              className={`w-full p-3 rounded-2xl border font-lexend font-bold text-xs ${
                darkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="all">🗓 Tất cả thời gian</option>
              <option value="30days">🗓 30 Ngày gần nhất</option>
              <option value="7days">🗓 7 Ngày gần nhất</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Lọc Theo Cán Bộ Cân:
            </label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className={`w-full p-3 rounded-2xl border font-lexend font-bold text-xs ${
                darkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="all">👤 Tất cả Cán Bộ Cân</option>
              {operatorsList.map((op, i) => (
                <option key={i} value={op}>{op}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Results Summary */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold mb-6 flex justify-between items-center text-emerald-800 dark:text-emerald-300">
          <span>Khớp bộ lọc: <strong className="font-lexend font-black text-sm">{filtered.length} phiếu cân</strong></span>
          <span>Tổng sản lượng: <strong className="font-lexend font-black text-sm">{formatNumber(filtered.reduce((a, s) => a + (s.calculated?.finalNetWeight || 0), 0))} kg</strong></span>
        </div>

        <button
          onClick={handleExportNow}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-4 px-6 rounded-2xl shadow-xl transition-all border border-emerald-500 text-sm flex items-center justify-center gap-2"
        >
          <span>📥</span>
          <span>Tải File Báo Cáo Ngay</span>
        </button>
      </div>
    </div>
  );
};
