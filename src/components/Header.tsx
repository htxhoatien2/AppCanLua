import React from 'react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeTab: 'weighing' | 'history' | 'ai_advisor' | 'yield' | 'receipt' | 'dashboard';
  setActiveTab: (tab: 'weighing' | 'history' | 'ai_advisor' | 'yield' | 'receipt' | 'dashboard') => void;
  bagCount: number;
  historyCount: number;
  onNewSession: () => void;
  isCloudSync?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
  bagCount,
  historyCount,
  onNewSession,
  isCloudSync = false,
}) => {
  return (
    <header className={`sticky top-0 z-40 border-b shadow-md ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white border-amber-900'
    }`}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('weighing')}>
          <div className="p-2.5 bg-amber-500/30 rounded-2xl border border-amber-300/30 shadow-inner flex items-center justify-center text-xl">
            🌾
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg leading-tight flex items-center gap-2">
              CÂN LÚA ĐỒNG RỘNG
              {isCloudSync ? (
                <span className="text-[10px] bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-full font-bold border border-emerald-400/40 uppercase tracking-wider flex items-center gap-1">
                  <span>☁️</span> Supabase Cloud
                </span>
              ) : (
                <span className="text-[10px] bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded-full font-mono border border-amber-500/40 uppercase tracking-wider">
                  💾 Local Offline
                </span>
              )}
            </h1>
            <p className="text-xs text-amber-100/90 font-medium">
              Sổ Cân Lúa Nông Nghiệp & Tính Tiền Thông Minh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewSession}
            title="Tạo phiếu cân mới"
            className="hidden sm:flex items-center gap-1.5 text-xs bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl border border-white/20 transition-all shadow-sm"
          >
            <span>✨</span> Tạo Phiếu Mới
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-amber-900/40 border-amber-400/30 text-amber-100 hover:bg-amber-900/60'
            }`}
            title={darkMode ? 'Chuyển chế độ sáng' : 'Chuyển chế độ tối'}
          >
            {darkMode ? '☀️ Sáng' : '🌙 Tối Nắng'}
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-5xl mx-auto flex border-t border-amber-500/30 bg-black/10 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab('weighing')}
          className={`flex-1 py-2.5 px-2 text-center text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'weighing'
              ? 'border-white text-white bg-white/15 font-black shadow-inner'
              : 'border-transparent text-amber-100/80 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>⚖️</span>
          <span>Cân Lúa</span>
          {bagCount > 0 && (
            <span className="ml-1 bg-amber-400 text-amber-950 font-black text-[11px] px-2 py-0.5 rounded-full shadow">
              {bagCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 px-2 text-center text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-white text-white bg-white/15 font-black shadow-inner'
              : 'border-transparent text-amber-100/80 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>📜</span>
          <span>Sổ Cân</span>
          {historyCount > 0 && (
            <span className="ml-1 bg-amber-200 text-amber-950 font-bold text-[11px] px-2 py-0.5 rounded-full">
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ai_advisor')}
          className={`flex-1 py-2.5 px-2 text-center text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'ai_advisor'
              ? 'border-white text-white bg-white/15 font-black shadow-inner'
              : 'border-transparent text-amber-100/80 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>🤖</span>
          <span>Trợ Lý Giá Lúa</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2.5 px-2 text-center text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'dashboard'
              ? 'border-white text-white bg-white/15 font-black shadow-inner'
              : 'border-transparent text-amber-100/80 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>📈</span>
          <span>Báo Cáo</span>
        </button>

        <button
          onClick={() => setActiveTab('yield')}
          className={`flex-1 py-2.5 px-2 text-center text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'yield'
              ? 'border-white text-white bg-white/15 font-black shadow-inner'
              : 'border-transparent text-amber-100/80 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>📊</span>
          <span>Tính Năng Suất</span>
        </button>
      </div>
    </header>
  );
};
