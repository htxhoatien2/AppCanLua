import React, { useState } from 'react';

interface SmartParseModalProps {
  onAddWeights: (weights: number[]) => void;
  onApplySmartData: (data: any) => void;
  onClose: () => void;
  darkMode: boolean;
}

export const SmartParseModal: React.FC<SmartParseModalProps> = ({
  onAddWeights,
  onApplySmartData,
  onClose,
  darkMode,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick RegEx parse without API
  const handleQuickParseNumbers = () => {
    if (!inputText.trim()) return;
    const matches = inputText
      .replace(/,/g, '.')
      .split(/[\s;\n]+/)
      .map((item) => parseFloat(item))
      .filter((num) => !isNaN(num) && num > 0 && num < 200);

    if (matches.length > 0) {
      onAddWeights(matches);
      onClose();
    } else {
      setErrorMsg('Không tìm thấy số cân hợp lệ trong đoạn văn bản.');
    }
  };

  // AI Gemini Smart Parse
  const handleAiSmartParse = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gemini/smart-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        onApplySmartData(json.data);
        onClose();
      } else {
        throw new Error(json.error || 'AI không phân tích được văn bản.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi kết nối với AI Gemini.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className={`p-5 sm:p-6 rounded-3xl max-w-md w-full border shadow-2xl ${
        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-amber-200 text-slate-900'
      }`}>
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-500/20">
          <h3 className="font-extrabold text-base text-purple-600 dark:text-purple-400 flex items-center gap-2">
            ✨ AI ĐỌC VĂN BẢN & NHẬP NHIỀU BAO
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-rose-500 font-bold text-lg">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Dán chuỗi số cân hoặc lời nói (Ví dụ: <em className="text-purple-600">"Chú Tám lúa OM18 8800đ cân 50.5, 51, 52, năm mươi ký rưỡi, 51 phẩy hai..."</em>)
        </p>

        <textarea
          rows={5}
          placeholder="Dán chuỗi số cân vào đây, cách nhau bởi dấu cách, dấu phẩy hoặc xuống dòng..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className={`w-full p-3 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3 ${
            darkMode ? 'bg-slate-900 border-slate-700 text-purple-300' : 'bg-slate-50 border-slate-300 text-slate-900'
          }`}
        />

        {errorMsg && (
          <div className="mb-3 p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl font-bold border border-rose-200">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleAiSmartParse}
            disabled={loading || !inputText.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>{loading ? '⏳ AI đang phân tích lời nói & chữ...' : '✨ Phân Tích Thông Minh Bằng AI Gemini'}</span>
          </button>

          <button
            onClick={handleQuickParseNumbers}
            disabled={!inputText.trim()}
            className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 font-bold py-2.5 px-4 rounded-2xl transition-all text-xs"
          >
            🔢 Chỉ Lấy Các Số Cân Nhanh
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
};
