import { RiceVariety } from '../types';

export const HTX_INFO = {
  name: 'HỢP TÁC XÃ DỊCH VỤ SẢN XUẤT NÔNG NGHIỆP HÒA TIẾN 2',
  address: 'Hòa Tiến, Đà Nẵng',
  phone: '0916199945',
  email: 'htxhoatien2@gmail.com',
  author: 'Phạm Công Tuân',
};

export const POPULAR_RICE_VARIETIES: RiceVariety[] = [
  { name: 'HG12', code: 'HG12', description: 'Giống lúa HG12 hạt thon dài, cứng cây, cơm mềm dẻo, năng suất cao tại Hòa Tiến, Đà Nẵng.', defaultPrice: 8500 },
  { name: 'HG244', code: 'HG244', description: 'Giống lúa HG244 đẻ nhánh khỏe, chống chịu sâu bệnh tốt, chất lượng gạo cao.', defaultPrice: 8600 },
  { name: 'HT1', code: 'HT1', description: 'Giống lúa thuần HT1 chất lượng cao, hạt dài thon, cơm mềm dẻo thơm nhẹ.', defaultPrice: 8500 },
  { name: 'ĐT100', code: 'DT100', description: 'Giống lúa ĐT100 thương phẩm cao, hạt dài trong, dẻo đậm cơm.', defaultPrice: 8800 },
  { name: 'J02', code: 'J02', description: 'Giống lúa Nhật J02 hạt bầu tròn, dẻo thơm đặc trưng, giá trị kinh tế cao.', defaultPrice: 9000 },
];

export const PRESET_BAG_WEIGHTS = [48, 49, 50, 50.5, 51, 51.5, 52, 52.5, 53, 54, 55];

export const HOA_TIEN_LOCATIONS = [
  'Cánh đồng Gò Tháp',
  'Cánh đồng Cửa Kho',
  'Cánh đồng Lò Gạch',
  'Cánh đồng Đập Tráp',
  'Cánh đồng Hóc Thung',
  'Đồng Thôn Bích Bắc',
  'Đồng Thôn Yến Nê',
  'Đồng Thôn Cẩm Nê',
  'Đồng Thôn An Trạch',
  'Đồng Thôn La Bông',
  'Đồng Thôn Lệ Sơn',
];

export const SAMPLE_TRUCKS = [
  'Xe 43C-123.45 (Xe tải 5 tấn)',
  'Xe 43H-678.90 (Xe tải 8 tấn)',
  'Xe 92C-112.33 (Xe tải 10 tấn)',
  'Xe 43C-098.76 (Xe ben nhận lúa)',
  'Xe Đội 1 HTX Hòa Tiến 2',
  'Xe Đội 2 HTX Hòa Tiến 2',
];

export const SAMPLE_OPERATORS = [
  'Phạm Công Tuân (Chủ nhiệm/Cán bộ chính)',
  'Nguyễn Văn A (Cán bộ Điểm cân Gò Tháp)',
  'Trần Văn B (Cán bộ Điểm cân Cửa Kho)',
  'Lê Văn C (Cán bộ Điểm cân Bích Bắc)',
];

export const SAMPLE_AI_QUESTIONS = [
  "Cập nhật giá lúa HG12, HG244, HT1, ĐT100 và J02 tươi tại Đà Nẵng hôm nay?",
  "Công thức quy đổi trừ độ ẩm lúa tươi về độ ẩm chuẩn 14% chuẩn Bộ NN&PTNT?",
  "Năng suất lúa J02 & HG12 trung bình bao nhiêu kg / Sào Trung Bộ (500m2)?",
  "Quy định trừ bì bao lúa thông thường tại HTX Hòa Tiến 2 là bao nhiêu kg?",
  "Cách phân loại sản lượng lúa thu hoạch theo từng Xe Nhận và từng Cán Bộ Cân?"
];
