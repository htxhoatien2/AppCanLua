import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

// Mock Admin Config Memory
let serverAdminConfig = null;

// API Route 1: Status & Config
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    htx: 'HỢP TÁC XÃ DỊCH VỤ SẢN XUẤT NÔNG NGHIỆP HÒA TIẾN 2',
    address: 'Hòa Tiến, Đà Nẵng',
    geminiKeyConfigured: Boolean(GEMINI_API_KEY),
  });
});

app.get('/api/config', (req, res) => {
  res.json({ success: true, config: serverAdminConfig });
});

app.post('/api/config', (req, res) => {
  const { config } = req.body;
  if (config) {
    serverAdminConfig = config;
    return res.json({ success: true, message: 'Đã lưu cấu hình Admin trên Backend Server!' });
  }
  res.status(400).json({ success: false, error: 'Thiếu dữ liệu config' });
});

// API Route 2: Gemini OCR Image Parsing
app.post('/api/gemini/ocr', async (req: any, res: any) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Chưa cấu hình GEMINI_API_KEY trong file .env trên Server!',
      });
    }

    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Thiếu hình ảnh base64' });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = `Bạn là trợ lý AI chuyên nhận diện phiếu cân lúa thu hoạch nông nghiệp tại Đà Nẵng / Miền Trung.
Hãy trích xuất hình ảnh sổ cân/giấy cân này thành JSON có cấu trúc sau:
{
  "farmerName": "tên chủ ruộng nếu có",
  "truckInfo": "biển số xe hoặc tên xe nhận nếu có",
  "riceType": "tên giống lúa (HG12, HG244, HT1, ĐT100, J02...) nếu có",
  "unitPrice": số_đơn_giá_nếu_có,
  "tarePerBag": số_kg_trừ_bì_mỗi_bao_nếu_có,
  "impurityPercent": số_trừ_lép_ẩm_nếu_có,
  "bagWeights": [mảng_các_số_trọng_lượng_kg_đọc_được],
  "note": "ghi chú nếu có"
}
Chỉ trả về JSON thuần túy, không thêm bất kỳ văn bản nào khác.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            mimeType: mimeType,
          },
        },
        prompt,
      ],
    });

    const responseText = response.text || '';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return res.json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error('Lỗi Gemini OCR Server:', err);
    return res.status(500).json({ success: false, error: err.message || 'Lỗi xử lý OCR AI' });
  }
});

// API Route 3: Gemini Agricultural Advisor Chatbot
app.post('/api/gemini/advisor', async (req: any, res: any) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Chưa cấu hình GEMINI_API_KEY trong file .env trên Server!',
      });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Thiếu lịch sử tin nhắn' });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const lastUserMsg = messages[messages.length - 1]?.text || '';

    const systemInstruction = `Bạn là Trợ lý AI Nông Nghiệp chuyên tư vấn giá lúa tươi mới nhất hôm nay tại Đà Nẵng (Hòa Tiến), Quảng Nam và Miền Trung.
Bạn am hiểu các giống lúa HG12, HG244, HT1, ĐT100, J02, kỹ thuật trừ lép/độ ẩm 14%, quy đổi Sào Trung Bộ (500m2) và Mẫu Trung Bộ (5000m2).
Hãy trả lời ngắn gọn, thân thiện, chính xác với bà con nông dân và thương lái.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemInstruction}\n\nNgười dùng hỏi: ${lastUserMsg}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || '';
    const searchSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri,
      title: chunk.web?.title,
    })).filter((s: any) => s.uri) || [];

    return res.json({
      success: true,
      text: responseText,
      sources: searchSources,
    });
  } catch (err: any) {
    console.error('Lỗi Gemini Advisor Server:', err);
    return res.status(500).json({ success: false, error: err.message || 'Lỗi xử lý AI Advisor' });
  }
});

// API Route 4: Gemini TTS Text-to-Speech
app.post('/api/gemini/tts', async (req: any, res: any) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Chưa cấu hình GEMINI_API_KEY trong file .env trên Server!',
      });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Thiếu nội dung đọc TTS' });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Hãy đọc to thông báo kết quả cân lúa sau đây bằng tiếng Việt truyền cảm, rõ ràng: "${text}"`,
      config: {
        responseMimeType: 'audio/pcm',
      },
    });

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;
    let audioBase64 = '';

    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          audioBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({ success: false, error: 'Không thể tạo âm thanh AI từ mô hình' });
    }

    return res.json({ success: true, audioBase64 });
  } catch (err: any) {
    console.error('Lỗi Gemini TTS Server:', err);
    return res.status(500).json({ success: false, error: err.message || 'Lỗi xử lý TTS' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌾 Backend REST API Server HTX Hòa Tiến 2 đang chạy tại http://localhost:${PORT}`);
});
