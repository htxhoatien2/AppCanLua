import React, { useState } from 'react';
import { User, AdminConfig } from '../types';

interface SidebarProps {
  activeTab: 'weighing' | 'history' | 'ai_advisor' | 'yield' | 'receipt' | 'dashboard' | 'admin' | 'truck_batch' | 'farmer_settlement';
  setActiveTab: (tab: 'weighing' | 'history' | 'ai_advisor' | 'yield' | 'receipt' | 'dashboard' | 'admin' | 'truck_batch' | 'farmer_settlement') => void;
  bagCount: number;
  historyCount: number;
  currentUser: User | null;
  adminConfig: AdminConfig;
  onOpenAuth: () => void;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  bagCount,
  historyCount,
  currentUser,
  adminConfig,
  onOpenAuth,
  onLogout,
  darkMode,
  setDarkMode,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const isAdmin = currentUser?.role === 'admin';

  const menuItems = [
    {
      id: 'weighing',
      label: 'Cân Lúa',
      icon: '⚖️',
      badge: bagCount > 0 ? `${bagCount} bao` : null,
      badgeColor: 'bg-emerald-500 text-slate-950',
    },
    {
      id: 'truck_batch',
      label: 'Chuyến Xe Nhận Lúa',
      icon: '🚛',
    },
    {
      id: 'farmer_settlement',
      label: 'Quyết Toán Nông Dân',
      icon: '🤝',
    },
    {
      id: 'history',
      label: 'Sổ Cân Lịch Sử',
      icon: '📜',
      badge: historyCount > 0 ? `${historyCount}` : null,
      badgeColor: 'bg-emerald-800 text-emerald-100',
    },
    {
      id: 'dashboard',
      label: 'Báo Cáo Thống Kê',
      icon: '📈',
    },
    {
      id: 'yield',
      label: 'Năng Suất Sào/Mẫu',
      icon: '📊',
    },
    {
      id: 'ai_advisor',
      label: 'Trợ Lý AI Giá Lúa',
      icon: '🤖',
    },
    {
      id: 'admin',
      label: 'Quản Trị Admin',
      icon: '⚙️',
      adminOnly: true,
    },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-emerald-950/90 border-b border-emerald-800/80 backdrop-blur-xl px-4 py-3 flex justify-between items-center text-white shadow-lg">
        <div className="flex items-center gap-2.5" onClick={() => setActiveTab('weighing')}>
          <span className="text-2xl p-1.5 bg-emerald-800 rounded-xl">🌾</span>
          <div>
            <h1 className="font-lexend font-black text-sm uppercase tracking-tight text-emerald-300">
              HTX HÒA TIẾN 2
            </h1>
            <p className="text-[10px] text-emerald-200/80">{adminConfig.htxInfo.address}</p>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-emerald-900 border border-emerald-700 text-white font-bold text-lg"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full min-h-screen transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64 sm:w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          darkMode
            ? 'bg-slate-950 border-r border-slate-800/80 text-slate-100'
            : 'bg-emerald-950 text-white border-r border-emerald-900 shadow-2xl shadow-emerald-950/50'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-emerald-800/60 flex items-center justify-between">
          <div
            className={`flex items-center gap-3 cursor-pointer overflow-hidden ${collapsed ? 'justify-center' : ''}`}
            onClick={() => setActiveTab('weighing')}
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-300 rounded-2xl p-0.5 shadow-lg shadow-emerald-500/30 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950/50 rounded-[14px] flex items-center justify-center text-xl backdrop-blur-sm">
                🌾
              </div>
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-lexend font-black text-sm text-emerald-300 tracking-wide uppercase truncate">
                  HTX HÒA TIẾN 2
                </h1>
                <p className="text-[10px] text-emerald-200/70 truncate font-semibold">
                  {adminConfig.htxInfo.address}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-xl hover:bg-emerald-900/60 text-emerald-300 transition-all font-bold text-xs"
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* User Card */}
        <div className={`p-3.5 mx-3 my-3 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-emerald-900/70 border-emerald-700/60'
        }`}>
          {currentUser ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-lexend font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="font-lexend font-bold text-xs text-white truncate">{currentUser.fullName}</p>
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                      {currentUser.role === 'admin' ? '👑 Admin HTX' : '🌾 Cán Bộ Cân'}
                    </span>
                  </div>
                )}
              </div>

              {!collapsed && (
                <button
                  onClick={onLogout}
                  className="text-[10px] text-rose-300 hover:text-rose-100 font-bold underline"
                  title="Đăng xuất"
                >
                  Thoát
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-lexend font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 ${
                collapsed ? 'p-2' : ''
              }`}
            >
              <span>🔑</span>
              {!collapsed && <span>Đăng Nhập Cán Bộ</span>}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto scrollbar-thin py-2">
          {menuItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Mở tab ${item.label}`}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileOpen(false);
                }}
                className={`w-full py-3 px-3 rounded-2xl font-lexend font-black text-xs sm:text-sm flex items-center justify-between transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-[1.02]'
                    : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg transition-transform group-hover:scale-110">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-200/80">
          {!collapsed && (
            <div className="text-[10px]">
              <p className="font-bold text-white">AppCanLua v3.5</p>
              <p className="italic">Xanh Nông Nghiệp HTX</p>
            </div>
          )}

          <button
            type="button"
            aria-label={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 transition-all border border-emerald-700/60"
            title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
        ></div>
      )}
    </>
  );
};
