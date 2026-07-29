import React, { useState } from 'react';
import { BackupPayload, restoreBackupPayload } from '../../services/adminService';

interface AdminImportPageProps {
  darkMode: boolean;
  onRefreshAllData: () => void;
}

export const AdminImportPage: React.FC<AdminImportPageProps> = ({ darkMode, onRefreshAllData }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<BackupPayload | null>(null);
  const [mergeMode, setMergeMode] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.version && parsed.sessions) {
          setPreviewData(parsed);
        } else {
          alert('File JSON không chứa cấu trúc sao lưu dữ liệu hợp lệ!');
          setPreviewData(null);
        }
      } catch (err) {
        alert('Không thể đọc dữ liệu file JSON này.');
        setPreviewData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!previewData) return;

    if (
      !mergeMode &&
      !window.confirm('CẢNH BÁO: Chế độ GHI ĐÈ sẽ XÓA TOÀN BỘ dữ liệu hiện tại và thay thế bằng dữ liệu mới trong file. Bạn có chắc chắn?')
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = restoreBackupPayload(previewData, mergeMode);
      onRefreshAllData();
      setToastMsg(`✨ Khôi phục dữ liệu thành công! Đã cập nhật ${result.sessionCount} phiếu cân.`);
      setSelectedFile(null);
      setPreviewData(null);
      setTimeout(() => setToastMsg(''), 4000);
    } catch (e: any) {
      alert('Lỗi phục hồi dữ liệu: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl font-lexend font-bold text-xs sm:text-sm animate-bounce border border-emerald-400">
          ✓ {toastMsg}
        </div>
      )}

      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-emerald-200/90'
      }`}>
        <h3 className="font-lexend font-black text-xl text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
          <span>📥</span> NHẬP DỮ LIỆU & PHỤC HỒI HỆ THỐNG
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
          Tải file sao lưu JSON hoặc file CSV số liệu để khôi phục và phục hồi dữ liệu phiếu cân HTX
        </p>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-emerald-500/40 rounded-3xl p-8 text-center bg-emerald-500/5 hover:bg-emerald-500/10 transition-all cursor-pointer relative mb-6">
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="text-4xl mb-2">📄</div>
          <p className="font-lexend font-black text-sm text-slate-700 dark:text-slate-200">
            {selectedFile ? `Đã chọn: ${selectedFile.name}` : 'Bấm vào đây hoặc kéo thả file Backup .json vào đây'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Hỗ trợ các định dạng file sao lưu JSON chuẩn AppCanLua</p>
        </div>

        {/* Preview Data Details */}
        {previewData && (
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 mb-6 text-xs">
            <h4 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 uppercase">
              🔍 Xem Trước Chi Tiết Dữ Liệu File Sao Lưu:
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-semibold">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border">
                <span className="text-slate-400 block text-[10px]">Phiên bản Backup:</span>
                <strong className="text-slate-900 dark:text-white">{previewData.version}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border">
                <span className="text-slate-400 block text-[10px]">Số phiếu cân:</span>
                <strong className="text-emerald-600 text-sm font-lexend">{previewData.sessions?.length || 0} phiếu</strong>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border">
                <span className="text-slate-400 block text-[10px]">Số tài khoản User:</span>
                <strong className="text-slate-900 dark:text-white">{previewData.users?.length || 0} users</strong>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border">
                <span className="text-slate-400 block text-[10px]">Thời gian tạo:</span>
                <strong className="text-slate-900 dark:text-white text-[11px]">{previewData.timestamp ? new Date(previewData.timestamp).toLocaleDateString('vi-VN') : 'N/A'}</strong>
              </div>
            </div>

            {/* Merge Options */}
            <div className="pt-2">
              <label className="block font-bold mb-2 text-slate-700 dark:text-slate-300">Lựa Chọn Chế Độ Nhập Dữ Liệu:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMergeMode(true)}
                  className={`p-3.5 rounded-2xl border font-lexend text-left transition-all ${
                    mergeMode
                      ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <strong className="block text-sm">🔀 Chế độ Gộp Dữ Liệu (Khuyên dùng)</strong>
                  <span className="text-[11px] opacity-90 font-normal">Giữ nguyên phiếu cân hiện tại và bổ sung thêm các phiếu mới từ file.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMergeMode(false)}
                  className={`p-3.5 rounded-2xl border font-lexend text-left transition-all ${
                    !mergeMode
                      ? 'bg-rose-600 text-white border-rose-500 font-black shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <strong className="block text-sm">⚠️ Chế độ Ghi Đè Hoàn Toàn</strong>
                  <span className="text-[11px] opacity-90 font-normal">Xóa toàn bộ dữ liệu hiện tại và thay thế bằng dữ liệu trong file backup.</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleExecuteRestore}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-lexend font-black py-4 px-6 rounded-2xl shadow-xl transition-all border border-emerald-500 text-sm mt-2"
            >
              {loading ? 'Đang Phục Hồi Dữ Liệu...' : '✨ Tiến Hành Phục Hồi Dữ Liệu Ngay'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
