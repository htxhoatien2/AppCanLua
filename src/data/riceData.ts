import { RiceVariety } from '../types';

export const POPULAR_RICE_VARIETIES: RiceVariety[] = [
  { name: 'OM 5451', code: 'OM5451', description: 'Hạt dài, thon, trong, cơm mềm dẻo vừa, độ thuần cao. Rất phổ biến ở ĐBSCL.', defaultPrice: 8500 },
  { name: 'OM 18', code: 'OM18', description: 'Lúa thơm nhẹ, hạt dài, cơm dẻo mềm, vị ngọt đậm. Được xuất khẩu mạnh.', defaultPrice: 8800 },
  { name: 'Đài Thơm 8', code: 'DT8', description: 'Hạt gạo thon dài, trong, không bạc bụng, hương thơm dẻo dai ngon cơm.', defaultPrice: 8900 },
  { name: 'ST 24', code: 'ST24', description: 'Gạo top thế giới, hạt thon dài, dẻo nhiều, thơm hương lá dứa tự nhiên.', defaultPrice: 9500 },
  { name: 'ST 25', code: 'ST25', description: 'Gạo ngon nhất thế giới, dẻo thơm thượng hạng, giá trị kinh tế cao.', defaultPrice: 10200 },
  { name: 'IR 50404', code: 'IR504', description: 'Hạt bầu tròn, cơm xốp khô, thích hợp làm bún, bánh phở, chế biến thực phẩm.', defaultPrice: 7800 },
  { name: 'Jasmine 85', code: 'JAS85', description: 'Hạt dài, trong, mùi thơm đặc trưng, cơm mềm dẻo. Vụ Đông Xuân hạt đẹp.', defaultPrice: 8600 },
  { name: 'HG12', code: 'HG12', description: 'Giống lúa HG12 năng suất cao, chống chịu sâu bệnh tốt, thích hợp vụ Thu Đông & Hè Thu.', defaultPrice: 8400 },
  { name: 'HG244', code: 'HG244', description: 'Giống lúa HG244 đẻ nhánh khỏe, hạt vàng sáng, ít đổ ngã, năng suất vượt trội.', defaultPrice: 8400 },
  { name: 'HT1', code: 'HT1', description: 'Giống lúa thuần HT1 hạt dài thon, chất lượng cơm ngon, dẻo mềm, thơm dịu.', defaultPrice: 8200 },
  { name: 'ĐT100', code: 'DT100', description: 'Giống lúa ĐT100 hạt dài trong, chất lượng gạo thương phẩm cao, dẻo ngọt.', defaultPrice: 9000 },
  { name: 'J02', code: 'J02', description: 'Giống lúa Nhật J02 (Japonica), hạt tròn bầu, cơm dẻo kết dính, vị ngọt đậm.', defaultPrice: 9500 },
  { name: 'Lúa Khác', code: 'OTHER', description: 'Các giống lúa địa phương khác hoặc lúa giống mới.', defaultPrice: 8500 },
];

export const PRESET_BAG_WEIGHTS = [48, 49, 50, 50.5, 51, 51.5, 52, 52.5, 53, 54, 55];

export const MEKONG_PROVINCES = [
  'An Giang',
  'Đồng Tháp',
  'Cần Thơ',
  'Long An',
  'Kiên Giang',
  'Tiền Giang',
  'Sóc Trăng',
  'Bạc Liêu',
  'Hậu Giang',
  'Vĩnh Long',
  'Trà Vinh',
  'Cà Mau',
  'Tây Ninh / Đắk Lắk'
];

export const SAMPLE_AI_QUESTIONS = [
  "Cập nhật giá lúa OM 18 & Đài Thơm 8 tươi tại An Giang, Đồng Tháp hôm nay?",
  "Cách tính độ ẩm và công thức trừ lép khi lúa bị bão mưa ướt ruộng?",
  "Năng suất lúa ST25 trung bình bao nhiêu kg/công tầm lớn (1296m2)?",
  "Nên cân lúa tươi tại ruộng hay phơi sấy khô trước khi tính tiền?",
  "Quy định trừ bì bao lúa thông thường ở ĐBSCL là bao nhiêu kg mỗi bao?"
];
