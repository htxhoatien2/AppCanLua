import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Modality } from '@google/genai';

dotenv.config();

const PORT = 3000;

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chưa thiết lập GEMINI_API_KEY trong hệ thống.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API 1: Image OCR Tally Sheet Scanner
  app.post('/api/gemini/ocr', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg' } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Thiếu dữ liệu hình ảnh (imageBase64).' });
      }

      const ai = getGenAI();
      const prompt = `Bạn là chuyên gia OCR đọc chữ viết tay và con số cân lúa nông nghiệp Việt Nam (Mekong Delta).
Phân tích hình ảnh tờ giấy ghi số cân lúa thu hoạch này (hoặc màn hình cân đồng hồ).
Trích xuất:
1. Danh sách tất cả khối lượng từng bao lúa (tính theo kg, ví dụ 50.5, 51.0, 52, 49.5...). Nếu có dấu gạch ngang hoặc số đếm, lấy đúng danh sách các số cân kg.
2. Tên chủ ruộng (nếu có ghi trên giấy, ví dụ "Anh Tám", "Chú Ba"...).
3. Tên lái lúa/ghe (nếu có).
4. Giống lúa (ví dụ OM 5451, OM 18, Đài Thơm 8, ST25, HG12, HG244, HT1, ĐT100, J02, IR504...).
5. Đơn giá (đồng/kg, ví dụ 8500, 8800...).
6. Trừ bì (kg/bao, nếu có) hoặc Trừ lép/ẩm (%).
Trả về kết quả dưới dạng JSON cấu trúc đúng schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                mimeType,
              },
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              farmerName: { type: Type.STRING, description: 'Tên chủ ruộng' },
              buyerName: { type: Type.STRING, description: 'Tên lái mua hoặc chủ ghe' },
              riceType: { type: Type.STRING, description: 'Tên giống lúa' },
              unitPrice: { type: Type.NUMBER, description: 'Đơn giá lúa đ/kg' },
              tarePerBag: { type: Type.NUMBER, description: 'Mức trừ bì kg mỗi bao' },
              impurityPercent: { type: Type.NUMBER, description: 'Phần trăm trừ lép hoặc độ ẩm' },
              bagWeights: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: 'Danh sách số cân kg của tất cả các bao lúa đọc được trong ảnh',
              },
              note: { type: Type.STRING, description: 'Ghi chú thêm từ hình ảnh' },
            },
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error('OCR API Error:', error);
      return res.status(500).json({ error: error.message || 'Lỗi xử lý hình ảnh qua AI Gemini.' });
    }
  });

  // API 2: Smart Voice / Text Parsing
  app.post('/api/gemini/smart-parse', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Thiếu văn bản đầu vào.' });
      }

      const ai = getGenAI();
      const prompt = `Phân tích văn bản/lời nói cân lúa nông dân: "${text}".
Nhiệm vụ:
- Chuyển đổi tất cả các từ chỉ số cân (bao gồm cả chữ số tiếng Việt như "năm mươi ký rưỡi", "năm mốt phẩy hai", "chín mươi chín bao mỗi bao 50kg") thành danh sách mảng số kg (như [50.5, 51.2, ...]).
- Tự động nhận diện nếu có ghi chú tên nông dân/chủ ruộng, tên giống lúa (OM18, DT8, ST25...), đơn giá (8k5 -> 8500), tiền cọc.
Trả về định dạng JSON đúng schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              farmerName: { type: Type.STRING },
              buyerName: { type: Type.STRING },
              riceType: { type: Type.STRING },
              unitPrice: { type: Type.NUMBER },
              tarePerBag: { type: Type.NUMBER },
              impurityPercent: { type: Type.NUMBER },
              deposit: { type: Type.NUMBER },
              bagWeights: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
              note: { type: Type.STRING },
            },
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error('Smart Parse API Error:', error);
      return res.status(500).json({ error: error.message || 'Lỗi phân tích văn bản.' });
    }
  });

  // API 3: AI Agricultural Advisor & Market Price Assistant (Google Search Grounding)
  app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
    try {
      const { messages } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Thiếu lịch sử tin nhắn.' });
      }

      const ai = getGenAI();
      const systemInstruction = `Bạn là Chuyên Gia Nông Nghiệp & Cố Vấn Thị Trường Lúa Gạo Đồng Bằng Sông Cửu Long (ĐBSCL) thân thiện, am hiểu sâu sắc.
Hãy trả lời bà con nông dân bằng giọng văn xưng "Tôi" hoặc "Trợ lý AI", gọi bà con bằng "bà con", "quý khách".
Trả lời ngắn gọn, rõ ràng, thực tế. Khi được hỏi về giá lúa hôm nay, hãy cập nhật thông tin giá lúa tươi mới nhất tại các tỉnh An Giang, Đồng Tháp, Cần Thơ, Long An, Kiên Giang...
Hỗ trợ giải đáp:
1. Giá các loại lúa phổ biến: OM 5451, OM 18, Đài Thơm 8, ST24, ST25, HG12, HG244, HT1, ĐT100, J02, IR 50404, Jasmine...
2. Cách tính trừ độ ẩm/lép khi thu hoạch mùa mưa, trừ bì bao.
3. Kỹ thuật chăm sóc lúa, phòng trừ sâu bệnh, tính năng suất lúa kg/công.`;

      // Format contents
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || 'Xin lỗi bà con, tôi chưa thể trả lời lúc này.';
      
      // Extract search grounding metadata
      const candidate = response.candidates?.[0];
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .filter((c: any) => c.web && c.web.uri && c.web.title)
        .map((c: any) => ({
          uri: c.web.uri,
          title: c.web.title,
        }));

      return res.json({ success: true, text, sources });
    } catch (error: any) {
      console.error('Advisor API Error:', error);
      return res.status(500).json({ error: error.message || 'Lỗi trợ lý AI.' });
    }
  });

  // API 4: AI Voice Text-To-Speech (Reads receipt out loud)
  app.post('/api/gemini/tts', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Thiếu nội dung cần đọc.' });
      }

      const ai = getGenAI();
      const promptText = `Đọc thông báo phiếu cân lúa vui vẻ, rõ ràng, chuẩn giọng tiếng Việt miền Nam/Việt Nam: ${text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioBase64) {
        throw new Error('Không nhận được dữ liệu âm thanh từ AI.');
      }

      return res.json({ success: true, audioBase64 });
    } catch (error: any) {
      console.error('TTS API Error:', error);
      return res.status(500).json({ error: error.message || 'Lỗi phát giọng nói AI.' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 Server Cân Lúa running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
