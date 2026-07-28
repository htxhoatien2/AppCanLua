import React, { useState } from 'react';
import { OcrResult } from '../types';

interface OcrModalProps {
  onApplyOcr: (data: OcrResult) => void;
  onClose: () => void;
  darkMode: boolean;
}

export const OcrModal: React.FC<OcrModalProps> = ({
  onApplyOcr,
  onClose,
  darkMode,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrData, setOcrData] = useState<OcrResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn một tệp hình ảnh (JPG, PNG).');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async () => {
    if (!imagePreview) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: selectedFile?.type || 'image/jpeg',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setOcrData(json.data);
      } else {
        throw new Error(json.error || 'AI không đọc được dữ liệu từ ảnh.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xử lý hình ảnh qua AI Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOcr = () => {
    if (ocrData) {
      onApplyOcr(ocrData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className={`p-5 sm:p-6 rounded-3xl max-w-lg w-full border shadow-2xl max-h-[90vh] overflow-y-auto ${
        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-amber-200 text-slate-900'
      }`}>
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-500/20">
          <h3 className="font-extrabold text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            📷 QUÉT ẢNH GIẤY CÂN LÚA BẰNG AI GEMINI
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-rose-500 font-bold text-lg">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Chụp hoặc tải lên hình ảnh sổ tay ghi chép số cân lúa. AI Gemini sẽ tự động nhận diện danh sách từng bao lúa và tên chủ ruộng!
        </p>

        {/* Upload Zone */}
        {!imagePreview ? (
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 rounded-2xl bg-emerald-500/5 cursor-pointer transition-all">
            <div className="text-4xl mb-2">📸</div>
            <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
              Bấm để chụp ảnh hoặc chọn ảnh sổ cân
            </span>
            <span className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, ảnh điện thoại</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border max-h-60 bg-black flex justify-center">
              <img src={imagePreview} alt="Sổ cân" className="object-contain max-h-60" />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setSelectedFile(null);
                  setOcrData(null);
                }}
                className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-bold"
              >
                Đổi ảnh khác
              </button>
            </div>

            {!ocrData && (
              <button
                onClick={handleProcessImage}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? '⏳ AI đang quét chữ & con số...' : '✨ Bắt Đầu Quét Bằng AI Gemini'}</span>
              </button>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-bold border border-rose-200">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* OCR Result Preview */}
        {ocrData && (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-slate-900 rounded-2xl border border-emerald-300 dark:border-slate-700 space-y-2 text-xs">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm flex justify-between items-center">
              <span>🎉 AI đã nhận diện được {ocrData.bagWeights?.length || 0} bao lúa!</span>
            </div>

            {ocrData.farmerName && <div>• Chủ ruộng: <strong>{ocrData.farmerName}</strong></div>}
            {ocrData.buyerName && <div>• Lái mua: <strong>{ocrData.buyerName}</strong></div>}
            {ocrData.riceType && <div>• Giống lúa: <strong>{ocrData.riceType}</strong></div>}
            {ocrData.unitPrice && <div>• Đơn giá: <strong>{ocrData.unitPrice} đ/kg</strong></div>}

            <div className="font-semibold text-slate-700 dark:text-slate-200 pt-1 border-t">
              Danh sách số cân ({ocrData.bagWeights?.length || 0} bao):
            </div>
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto font-mono text-[11px]">
              {ocrData.bagWeights?.map((w, idx) => (
                <span key={idx} className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-emerald-200 dark:border-slate-700 font-bold">
                  #{idx + 1}: {w}kg
                </span>
              ))}
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={handleConfirmOcr}
                className="w-full bg-emerald-600 text-white font-black py-3 px-4 rounded-2xl shadow-md hover:bg-emerald-700 transition-all text-sm"
              >
                + Thêm {ocrData.bagWeights?.length || 0} bao vào phiếu cân ngay
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
