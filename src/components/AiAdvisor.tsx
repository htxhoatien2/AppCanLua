import React, { useState } from 'react';
import { AiChatMessage } from '../types';
import { SAMPLE_AI_QUESTIONS } from '../data/riceData';

interface AiAdvisorProps {
  darkMode: boolean;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ darkMode }) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'model',
      text: 'Xin chào bà con & quý thương lái! Tôi là Trợ Lý AI Nông Nghiệp Đồng Bằng Sông Cửu Long. Tôi có thể giúp tra cứu giá lúa tươi mới nhất hôm nay tại An Giang, Đồng Tháp, Cần Thơ, tư vấn công thức trừ lép/độ ẩm mùa mưa, hay tính toán năng suất lúa ruộng. Bà con cần hỗ trợ thông tin gì ạ?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg: AiChatMessage = {
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!customPrompt) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        const modelMsg: AiChatMessage = {
          role: 'model',
          text: data.text,
          sources: data.sources || [],
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([...newHistory, modelMsg]);
      } else {
        throw new Error(data.error || 'Lỗi xử lý phản hồi AI.');
      }
    } catch (err: any) {
      setMessages([
        ...newHistory,
        {
          role: 'model',
          text: 'Rất tiếc, có lỗi kết nối với máy chủ AI. Bà con hãy thử lại sau giây lát!',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-4 ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-amber-200/80'
    }`}>
      {/* Header Banner */}
      <div className="flex items-center gap-3 pb-3 border-b border-amber-500/20">
        <div className="p-3 bg-amber-500/20 text-amber-600 rounded-2xl text-2xl">
          🤖
        </div>
        <div>
          <h2 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            TRỢ LÝ AI GIÁ LÚA & THỊ TRƯỜNG NÔNG NGHIỆP
            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              Live Google Search
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cập nhật giá lúa hôm nay tại ĐBSCL, công thức trừ bì/độ ẩm, kỹ thuật canh tác lúa
          </p>
        </div>
      </div>

      {/* Preset Chips */}
      <div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
          💡 Câu hỏi gợi ý cho bà con:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_AI_QUESTIONS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left font-medium active:scale-95 ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-amber-300 hover:border-amber-500'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
            >
              🌾 {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className={`p-3 sm:p-4 rounded-2xl border min-h-[320px] max-h-[460px] overflow-y-auto space-y-3 ${
        darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50/80 border-slate-200'
      }`}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`p-3.5 rounded-2xl max-w-[90%] sm:max-w-[85%] text-xs sm:text-sm shadow-sm ${
              msg.role === 'user'
                ? 'bg-amber-600 text-white font-semibold rounded-br-none'
                : darkMode
                  ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              {/* Message text formatted */}
              <div className="whitespace-pre-line leading-relaxed">
                {msg.text}
              </div>

              {/* Sources citations if available */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block">
                    🌐 Nguồn tham khảo từ Web:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {msg.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 inline-block truncate max-w-[200px]"
                      >
                        {src.title || src.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className={`text-[10px] mt-1 text-right ${
                msg.role === 'user' ? 'text-amber-200' : 'text-slate-400'
              }`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-bold p-2 bg-amber-500/10 rounded-xl w-fit animate-pulse">
            <span>🤖 AI đang tra cứu giá lúa và phân tích...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Hỏi AI giá lúa tươi, công thức trừ độ ẩm, kỹ thuật lúa..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className={`flex-1 p-3 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputMessage.trim()}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};
