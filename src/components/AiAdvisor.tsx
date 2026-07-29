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
    <div className={`p-4 sm:p-6 rounded-3xl border shadow-xl space-y-4 transition-all duration-300 ${
      darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-amber-200/90'
    }`}>
      {/* Header Banner */}
      <div className="flex items-center gap-3 pb-3 border-b border-amber-500/20">
        <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 rounded-2xl text-2xl shadow-lg shadow-amber-500/30">
          🤖
        </div>
        <div>
          <h2 className="font-lexend font-black text-base sm:text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            TRỢ LÝ AI GIÁ LÚA & THỊ TRƯỜNG NÔNG NGHIỆP
            <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
              Live Google Search
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Cập nhật giá lúa tươi hôm nay tại ĐBSCL, công thức trừ bì/độ ẩm, kỹ thuật canh tác lúa
          </p>
        </div>
      </div>

      {/* Preset Chips */}
      <div>
        <span className="text-xs font-lexend font-extrabold text-slate-600 dark:text-slate-300 block mb-2">
          💡 Câu hỏi gợi ý cho bà con:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_AI_QUESTIONS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className={`text-xs px-3.5 py-2 rounded-2xl border transition-all text-left font-medium active:scale-95 shadow-xs ${
                darkMode
                  ? 'bg-slate-950 border-slate-700 text-amber-300 hover:border-amber-500'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950 hover:bg-amber-100'
              }`}
            >
              🌾 {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className={`p-4 rounded-3xl border min-h-[340px] max-h-[480px] overflow-y-auto space-y-4 scrollbar-thin ${
        darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/90 border-slate-200'
      }`}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`p-4 rounded-3xl max-w-[90%] sm:max-w-[85%] text-xs sm:text-sm shadow-md ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold rounded-br-xs'
                : darkMode
                  ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
                  : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
            }`}>
              <div className="whitespace-pre-line leading-relaxed font-sans">
                {msg.text}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                  <span className="font-lexend font-bold text-amber-600 dark:text-amber-400 block">
                    🌐 Nguồn tham khảo từ Web:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-900 inline-block truncate max-w-[220px] font-medium"
                      >
                        {src.title || src.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className={`text-[10px] mt-1.5 text-right font-medium ${
                msg.role === 'user' ? 'text-slate-900 opacity-80' : 'text-slate-400'
              }`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-bold p-3 bg-amber-500/10 rounded-2xl w-fit animate-pulse border border-amber-500/20">
            <span>🤖 AI đang tra cứu giá lúa và phân tích dữ liệu...</span>
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
          className={`flex-1 p-3.5 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all ${
            darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputMessage.trim()}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-lexend font-black px-6 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 border border-amber-400/40"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};
