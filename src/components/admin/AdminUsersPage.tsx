import React, { useState } from 'react';
import { User } from '../../types';

interface AdminUsersPageProps {
  users: User[];
  onSaveUsers: (newUsers: User[]) => void;
  darkMode: boolean;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({
  users,
  onSaveUsers,
  darkMode,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'operator'>('operator');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) return;

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (users.some((u) => u.username === cleanUsername)) {
      return alert('Tên đăng nhập này đã tồn tại trong hệ thống!');
    }

    const newUser: User = {
      id: cleanUsername,
      username: cleanUsername,
      fullName: fullName.trim(),
      phone: phone.trim(),
      role: role,
    };

    const updated = [...users, newUser];
    onSaveUsers(updated);

    setFullName('');
    setUsername('');
    setPhone('');
    showToast(`👥 Đã thêm tài khoản cán bộ mới: ${newUser.fullName}`);
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      return alert('Phải giữ ít nhất 1 tài khoản Admin trong hệ thống!');
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản người dùng này?')) {
      const updated = users.filter((u) => u.id !== userId);
      onSaveUsers(updated);
      showToast('Đã xóa tài khoản!');
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl font-lexend font-bold text-xs sm:text-sm animate-bounce border border-emerald-400">
          ✓ {toastMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Thêm User */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <h3 className="font-lexend font-black text-base text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
            <span>👤</span> Thêm Tài Khoản Cán Bộ Mới
          </h3>

          <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Họ Và Tên Cán Bộ (*):</label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn C..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full p-3 rounded-xl border font-bold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Tên Đăng Nhập / Mã (*):</label>
              <input
                type="text"
                placeholder="VD: canbo_diem3..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-3 rounded-xl border font-mono font-bold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Số Điện Thoại:</label>
              <input
                type="tel"
                placeholder="0913xxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full p-3 rounded-xl border font-semibold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Vai Trò Phân Quyền:</label>
              <div className="grid grid-cols-2 gap-2 font-bold">
                <button
                  type="button"
                  onClick={() => setRole('operator')}
                  className={`p-2.5 rounded-xl border font-lexend transition-all ${
                    role === 'operator'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  🌾 Cán Bộ Cân
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2.5 rounded-xl border font-lexend transition-all ${
                    role === 'admin'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  👑 Admin HTX
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-3.5 rounded-xl shadow-lg transition-all text-sm mt-2"
            >
              + Tạo Tài Khoản
            </button>
          </form>
        </div>

        {/* Danh sách Users */}
        <div className={`lg:col-span-2 p-5 sm:p-6 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <h3 className="font-lexend font-black text-base text-slate-800 dark:text-slate-100 mb-4">
            Danh Sách Cán Bộ & Người Dùng Hệ Thống ({users.length})
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {users.map((u) => (
              <div
                key={u.id}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-lexend font-black flex items-center justify-center text-sm shadow-md">
                    {u.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-lexend font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {u.fullName}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                        u.role === 'admin' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {u.role === 'admin' ? '👑 Admin' : '🌾 Cán Bộ Cân'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Username: <strong>{u.username}</strong> {u.phone ? `• SĐT: ${u.phone}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-all font-black text-xs"
                  title="Xóa tài khoản"
                >
                  🗑️ Xóa
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
