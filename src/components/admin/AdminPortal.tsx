import React, { useState } from 'react';
import { AdminConfig, User, WeighingSession } from '../../types';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { AdminBackupPage } from './AdminBackupPage';
import { AdminExportPage } from './AdminExportPage';
import { AdminImportPage } from './AdminImportPage';

interface AdminPortalProps {
  config: AdminConfig;
  onSaveConfig: (newConfig: AdminConfig) => void;
  users: User[];
  onSaveUsers: (newUsers: User[]) => void;
  sessions: WeighingSession[];
  onRefreshAllData: () => void;
  darkMode: boolean;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  config,
  onSaveConfig,
  users,
  onSaveUsers,
  sessions,
  onRefreshAllData,
  darkMode,
}) => {
  // Sub-routes state: 'dashboard' | 'users' | 'settings' | 'backup' | 'export' | 'import'
  const [currentRoute, setCurrentRoute] = useState<'dashboard' | 'users' | 'settings' | 'backup' | 'export' | 'import'>('dashboard');

  const navTabs = [
    { id: 'dashboard', label: 'Bảng Điều Khiển', icon: '📊', path: '/admin/dashboard' },
    { id: 'users', label: 'Quản Lý Người Dùng', icon: '👥', path: '/admin/users' },
    { id: 'settings', label: 'Cài Đặt App', icon: '⚙️', path: '/admin/settings' },
    { id: 'backup', label: 'Sao Lưu Dữ Liệu', icon: '💾', path: '/admin/backup' },
    { id: 'export', label: 'Xuất Dữ Liệu', icon: '📤', path: '/admin/export' },
    { id: 'import', label: 'Nhập Dữ Liệu', icon: '📥', path: '/admin/import' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Admin Portal Header Banner */}
      <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl transition-all ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-emerald-200/90'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl text-2xl shadow-lg shadow-emerald-600/30">
              ⚙️
            </div>
            <div>
              <h2 className="font-lexend font-black text-xl sm:text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
                BẢNG QUẢN TRỊ BACKEND ADMIN
                <span className="text-xs bg-amber-400 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Admin Portal
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {config.htxInfo.name} — {config.htxInfo.address}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
            Path: <strong>{navTabs.find((t) => t.id === currentRoute)?.path}</strong>
          </div>
        </div>

        {/* Sub-Navigation Links Bar */}
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none mt-5 gap-1">
          {navTabs.map((tab) => {
            const isActive = currentRoute === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setCurrentRoute(tab.id as any)}
                className={`flex-1 min-w-[130px] py-2.5 px-3 text-center text-xs font-lexend font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Sub-Route Page */}
      <div>
        {currentRoute === 'dashboard' && (
          <AdminDashboardPage
            config={config}
            users={users}
            sessions={sessions}
            darkMode={darkMode}
          />
        )}

        {currentRoute === 'users' && (
          <AdminUsersPage
            users={users}
            onSaveUsers={onSaveUsers}
            darkMode={darkMode}
          />
        )}

        {currentRoute === 'settings' && (
          <AdminSettingsPage
            config={config}
            onSaveConfig={onSaveConfig}
            darkMode={darkMode}
          />
        )}

        {currentRoute === 'backup' && (
          <AdminBackupPage darkMode={darkMode} />
        )}

        {currentRoute === 'export' && (
          <AdminExportPage
            sessions={sessions}
            darkMode={darkMode}
          />
        )}

        {currentRoute === 'import' && (
          <AdminImportPage
            darkMode={darkMode}
            onRefreshAllData={onRefreshAllData}
          />
        )}
      </div>
    </div>
  );
};
