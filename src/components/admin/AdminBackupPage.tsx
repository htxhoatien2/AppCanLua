import React, { useState } from 'react';
import { createBackupPayload } from '../../services/adminService';

interface AdminBackupPageProps {
  darkMode: boolean;
}

export const AdminBackupPage: React.FC<AdminBackupPageProps> = ({ darkMode }) => {
  const [backupLog, setBackupLog] = useState<Array<{ id: string; time: string; filename: string; size: string }>>([
    { id: '1', time: new Date().toLocaleString('vi-VN'), filename: `Backup_HTX_HoaTien2_${new Date().toISOString().split('T')[0]}.json`, size: 'KB' },
  ]);
  const [toastMsg, setToastMsg] = useState('');

  const handleCreateBackup = () => {
    try {
      const payload = createBackupPayload();
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Backup_HTX_HoaTien2_${dateStr}_${Date.now().toString().slice(-4)}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      const newLog = {
        id: Date.now().toString(),
        time: new Date().toLocaleString('vi-VN'),
        filename: filename,
        size: `${(jsonStr.length / 1024).toFixed(1)} KB`,
      };

      setBackupLog([newLog, ...backupLog]);
      setToastMsg('💾 Đã tạo bản sao lưu dữ liệu JSON thành công!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (e: any) {
      alert('Lỗi tạo sao lưu: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl font-lexend font-bold text-xs sm:text-sm animate-bounce border border-emerald-400">
          ✓ {toastMsg}
        </div>
      )}

      {/* Main Backup Action Box */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-emerald-200/90'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h3 className="font-lexend font-black text-xl text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <span>💾</span> SAO LƯU DỮ LIỆU HỆ THỐNG KHẨN CẤP
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Xuất toàn bộ cơ sở dữ liệu phiếu cân, cấu hình giống lúa, xe nhận và tài khoản ra file JSON an toàn
            </p>
          </div>

          <button
            onClick={handleCreateBackup}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-3.5 px-6 rounded-2xl shadow-xl transition-all border border-emerald-500 text-sm shrink-0 flex items-center gap-2"
          >
            <span>📥</span>
            <span>Tạo Bản Sao Lưu Ngay</span>
          </button>
        </div>

        {/* Backup Information Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 text-xs font-semibold">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
            <span className="block opacity-80 mb-1">Định dạng file:</span>
            <strong className="text-base font-lexend">JSON mã hóa UTF-8</strong>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
            <span className="block opacity-80 mb-1">Phạm vi sao lưu:</span>
            <strong className="text-base font-lexend">Toàn bộ 100% dữ liệu</strong>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
            <span className="block opacity-80 mb-1">Khuyên dùng:</span>
            <strong className="text-base font-lexend">Sao lưu cuối mỗi vụ lúa</strong>
          </div>
        </div>

        {/* History Backup Log */}
        <div>
          <h4 className="font-lexend font-black text-sm text-slate-800 dark:text-slate-100 mb-3">
            Nhật Ký Sao Lưu Gần Đây ({backupLog.length})
          </h4>

          <div className="space-y-2">
            {backupLog.map((log) => (
              <div
                key={log.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📄</span>
                  <div>
                    <strong className="font-mono text-emerald-700 dark:text-emerald-400 block">{log.filename}</strong>
                    <span className="text-[11px] text-slate-400">Thời gian: {log.time}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {log.size}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
