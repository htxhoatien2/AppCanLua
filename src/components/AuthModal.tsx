import React, { useState } from 'react';
import { User } from '../types';
import { SAMPLE_OPERATORS } from '../data/riceData';

interface AuthModalProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onClose: () => void;
  darkMode: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onLogin,
  onClose,
  darkMode,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(SAMPLE_OPERATORS[0]);
  const [customName, setCustomName] = useState<string>('');
  const [role, setRole] = useState<'admin' | 'operator'>('operator');

  const handleConfirmLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = customName.trim() || selectedPreset;
    const cleanId = fullName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    const loggedUser: User = {
      id: cleanId,
      username: cleanId,
      fullName: fullName,
      role: role,
    };

    onLogin(loggedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-4 z-50 animate-fadeIn">
      <div className={`p-6 sm:p-8 rounded-3xl max-w-md w-full border shadow-2xl transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200 text-slate-900'
      }`}>
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-amber-500/20">
          <h3 className="font-lexend font-black text-lg text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <span>🔑</span> ĐĂNG NHẬP CÁN BỘ CÂN HTX HÒA TIẾN 2
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-rose-500 font-bold text-lg">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
          Mỗi tài khoản Cán bộ cân sẽ quản lý và kết xuất số liệu báo cáo phiếu cân đầu ra độc lập theo đúng User đó.
        </p>

        <form onSubmit={handleConfirmLogin} className="space-y-4">
          {/* Preset Operators */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Chọn Cán Bộ / Điểm Cân Có Sẵn:
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => {
                setSelectedPreset(e.target.value);
                setCustomName('');
              }}
              className={`w-full p-3 rounded-2xl border font-lexend font-bold text-xs ${
                darkMode ? 'bg-slate-950 border-slate-700 text-amber-300' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {SAMPLE_OPERATORS.map((op, idx) => (
                <option key={idx} value={op}>
                  👤 {op}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Hoặc Nhập Tên Cán Bộ Cân Khác:
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn C..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className={`w-full p-3 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-amber-500/30 ${
                darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Vai Trò Quyền Hạn:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRole('operator')}
                className={`p-2.5 rounded-xl border font-lexend transition-all ${
                  role === 'operator'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                🌾 Cán Bộ Cân
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-2.5 rounded-xl border font-lexend transition-all ${
                  role === 'admin'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                👑 Quản Lý HTX
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-lexend font-black py-3.5 px-4 rounded-2xl shadow-lg border border-amber-400/40 transition-all text-sm"
            >
              Xác Nhận Đăng Nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
