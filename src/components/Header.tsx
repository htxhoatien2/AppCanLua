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
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-300 ${
      darkMode
        ? 'bg-slate-950/85 border-slate-800/80 text-slate-100 shadow-2xl shadow-black/40'
        : 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 border-amber-600/40 text-white shadow-xl shadow-amber-950/20'
    }`}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex justify-between items-center">
        {/* Logo & App Title */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('weighing')}
        >
          <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 rounded-2xl p-0.5 shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center text-2xl backdrop-blur-sm">
              🌾
            </div>
          </div>

          <div>
            <h1 className="font-lexend font-black text-base sm:text-xl leading-tight flex items-center gap-2 tracking-tight">
              <span>CÂN LÚA ĐỒNG RỘNG</span>
              {isCloudSync ? (
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/40 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Cloud Sync
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider flex items-center gap-1">
                  <span>💾</span> Offline
                </span>
              )}
            </h1>
            <p className="text-[11px] sm:text-xs text-amber-100/80 font-medium tracking-wide">
              Phần Mềm Sổ Cân Lúa & Tính Tiền Thông Minh ĐBSCL
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewSession}
            title="Tạo phiếu cân mới"
            className="hidden sm:flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 active:scale-95 text-white font-extrabold px-3.5 py-2 rounded-2xl border border-white/20 transition-all shadow-md backdrop-blur-md"
          >
            <span className="text-amber-300">✨</span> Tạo Phiếu Mới
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-md active:scale-95 ${
              darkMode
                ? 'bg-slate-900/90 border-slate-700/80 text-amber-400 hover:bg-slate-800 hover:border-amber-500/50'
                : 'bg-black/20 border-white/20 text-amber-100 hover:bg-black/30'
            }`}
            title={darkMode ? 'Chuyển chế độ sáng' : 'Chuyển chế độ tối'}
          >
            <span>{darkMode ? '☀️' : '🌙'}</span>
            <span className="hidden sm:inline">{darkMode ? 'Giao Diện Sáng' : 'Chế Độ Tối'}</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Pills Bar */}
      <div className="max-w-5xl mx-auto px-2 pb-1.5">
        <nav className="flex p-1 bg-black/25 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('weighing')}
            className={`flex-1 min-w-[75px] py-2 px-2.5 text-center text-xs sm:text-sm font-lexend font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'weighing'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.02]'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>⚖️</span>
            <span>Cân Lúa</span>
            {bagCount > 0 && (
              <span className="ml-0.5 bg-slate-950 text-amber-400 font-black text-[10px] px-1.5 py-0.2 rounded-full shadow">
                {bagCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[75px] py-2 px-2.5 text-center text-xs sm:text-sm font-lexend font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.02]'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>📜</span>
            <span>Sổ Cân</span>
            {historyCount > 0 && (
              <span className="ml-0.5 bg-slate-950 text-amber-300 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ai_advisor')}
            className={`flex-1 min-w-[95px] py-2 px-2.5 text-center text-xs sm:text-sm font-lexend font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'ai_advisor'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.02]'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🤖</span>
            <span>Trợ Lý AI</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 min-w-[75px] py-2 px-2.5 text-center text-xs sm:text-sm font-lexend font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.02]'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>📈</span>
            <span>Báo Cáo</span>
          </button>

          <button
            onClick={() => setActiveTab('yield')}
            className={`flex-1 min-w-[90px] py-2 px-2.5 text-center text-xs sm:text-sm font-lexend font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'yield'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.02]'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>📊</span>
            <span>Năng Suất</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
