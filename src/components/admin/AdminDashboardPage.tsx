import React from 'react';
import { AdminConfig, User, WeighingSession } from '../../types';
import { formatNumber, formatVND } from '../../utils/formatters';

interface AdminDashboardPageProps {
  config: AdminConfig;
  users: User[];
  sessions: WeighingSession[];
  darkMode: boolean;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  config,
  users,
  sessions,
  darkMode,
}) => {
  const totalNetKg = sessions.reduce((acc, s) => acc + (s.calculated?.finalNetWeight || 0), 0);
  const totalRevenue = sessions.reduce((acc, s) => acc + (s.calculated?.totalAmount || 0), 0);
  const totalBags = sessions.reduce((acc, s) => acc + (s.calculated?.totalBags || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border shadow-xl transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-200 text-slate-900'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-lexend font-black uppercase text-emerald-600 dark:text-emerald-400">Tổng Số Phiếu Cân</span>
            <span className="p-2 bg-emerald-500/10 rounded-2xl text-xl">📜</span>
          </div>
          <div className="text-3xl font-lexend font-black">{sessions.length} <span className="text-xs font-normal text-slate-400">phiếu</span></div>
          <p className="text-[11px] text-slate-400 mt-1">Đã lưu trong hệ thống HTX</p>
        </div>

        <div className={`p-5 rounded-3xl border shadow-xl transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-200 text-slate-900'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-lexend font-black uppercase text-emerald-600 dark:text-emerald-400">Sản Lượng Ròng</span>
            <span className="p-2 bg-emerald-500/10 rounded-2xl text-xl">🌾</span>
          </div>
          <div className="text-3xl font-lexend font-black text-emerald-600 dark:text-emerald-400">
            {formatNumber(totalNetKg)} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Bằng {(totalNetKg / 1000).toFixed(2)} tấn lúa</p>
        </div>

        <div className={`p-5 rounded-3xl border shadow-xl transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-200 text-slate-900'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-lexend font-black uppercase text-emerald-600 dark:text-emerald-400">Cán Bộ Cân / Users</span>
            <span className="p-2 bg-emerald-500/10 rounded-2xl text-xl">👥</span>
          </div>
          <div className="text-3xl font-lexend font-black">{users.length} <span className="text-xs font-normal text-slate-400">tài khoản</span></div>
          <p className="text-[11px] text-slate-400 mt-1">{users.filter(u => u.role === 'admin').length} Admin | {users.filter(u => u.role === 'operator').length} Cán bộ</p>
        </div>

        <div className={`p-5 rounded-3xl border shadow-xl transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-200 text-slate-900'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-lexend font-black uppercase text-emerald-600 dark:text-emerald-400">Tổng Giá Trị Lúa</span>
            <span className="p-2 bg-emerald-500/10 rounded-2xl text-xl">💰</span>
          </div>
          <div className="text-2xl sm:text-3xl font-lexend font-black text-amber-600 dark:text-amber-400">{formatVND(totalRevenue)}</div>
          <p className="text-[11px] text-slate-400 mt-1">Tổng cộng {formatNumber(totalBags)} bao lúa</p>
        </div>
      </div>

      {/* System Status & Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-lexend font-black text-base text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <span>⚙️</span> Trạng Thái Hệ Thống Backend HTX
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              <span>Đơn vị chủ quản:</span>
              <strong className="font-lexend font-black">{config.htxInfo.name}</strong>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span>Địa chỉ HTX:</span>
              <strong className="font-bold">{config.htxInfo.address}</strong>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span>Số giống lúa quản lý:</span>
              <strong className="font-bold text-amber-600 dark:text-amber-400">{config.varieties.length} giống (HG12, HG244, HT1, ĐT100, J02)</strong>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span>Số cánh đồng & xe nhận:</span>
              <strong className="font-bold">{config.locations.length} cánh đồng | {config.trucks.length} xe nhận</strong>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-lexend font-black text-base text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <span>🕒</span> Hoạt Động Cân Mới Nhất
          </h3>
          {sessions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Chưa có phiếu cân nào trong hệ thống</p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {sessions.slice(0, 5).map((s) => (
                <div key={s.id} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-lexend font-bold text-emerald-700 dark:text-emerald-400">{s.farmerName || 'Chủ ruộng'}</h4>
                    <p className="text-[11px] text-slate-400">🗓 {s.date} • Cán bộ: {s.operatorName}</p>
                  </div>
                  <div className="text-right font-lexend">
                    <div className="font-black text-slate-900 dark:text-white">{formatNumber(s.calculated?.finalNetWeight || 0)} kg</div>
                    <div className="text-[11px] text-emerald-600 font-bold">{formatVND(s.calculated?.totalAmount || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
