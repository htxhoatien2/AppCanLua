import React, { useState, useMemo } from 'react';
import { WeighingSession, AdminConfig, FarmerSettlement } from '../types';
import { calculateTotals, formatVND, formatNumber } from '../utils/formatters';

interface FarmerSettlementViewProps {
  sessions: WeighingSession[];
  adminConfig: AdminConfig;
  darkMode: boolean;
}

export const FarmerSettlementView: React.FC<FarmerSettlementViewProps> = ({
  sessions,
  adminConfig,
  darkMode,
}) => {
  // Extract list of unique farmers
  const farmersList = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.farmerName) set.add(s.farmerName);
    });
    return Array.from(set);
  }, [sessions]);

  const [selectedFarmer, setSelectedFarmer] = useState<string>(farmersList[0] || '');

  // Deductions states
  const [seedCost, setSeedCost] = useState<number>(500000); // Tiền lúa giống HTX
  const [fertilizerCost, setFertilizerCost] = useState<number>(1200000); // Tiền phân bón ứng trước
  const [harvestMachineCost, setHarvestMachineCost] = useState<number>(1500000); // Tiền máy gặt

  // Farmer sessions
  const farmerSessions = useMemo(() => {
    if (!selectedFarmer) return [];
    return sessions.filter((s) => s.farmerName === selectedFarmer);
  }, [sessions, selectedFarmer]);

  // Aggregated totals
  const settlement = useMemo<FarmerSettlement>(() => {
    let totalBags = 0;
    let totalNetKg = 0;
    let totalRiceMoney = 0;
    let depositDeduction = 0;
    let farmerPhone = '';

    farmerSessions.forEach((s) => {
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      totalBags += calc.totalBags;
      totalNetKg += calc.finalNetWeight;
      totalRiceMoney += calc.totalAmount;
      depositDeduction += calc.depositAmount;
      if (s.farmerPhone) farmerPhone = s.farmerPhone;
    });

    const totalDeductions = seedCost + fertilizerCost + harvestMachineCost + depositDeduction;
    const finalNetPayable = totalRiceMoney - totalDeductions;

    return {
      farmerName: selectedFarmer || 'Hộ Nông Dân',
      farmerPhone,
      sessions: farmerSessions,
      totalBags,
      totalNetKg: Number(totalNetKg.toFixed(1)),
      totalRiceMoney,
      seedCost,
      fertilizerCost,
      harvestMachineCost,
      depositDeduction,
      finalNetPayable,
      settlementDate: new Date().toLocaleDateString('vi-VN'),
    };
  }, [farmerSessions, selectedFarmer, seedCost, fertilizerCost, harvestMachineCost]);

  const handlePrintSettlement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl transition-all ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-emerald-200/90'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl text-2xl shadow-lg shadow-emerald-600/30">
              🤝
            </div>
            <div>
              <h2 className="font-lexend font-black text-xl sm:text-2xl text-slate-800 dark:text-slate-100 tracking-tight">
                BÁO CÁO QUYẾT TOÁN THU HOẠCH HỘ NÔNG DÂN
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Quyết toán tổng thu nhập lúa & khấu trừ lúa giống, phân bón, máy gặt của thành viên HTX Hòa Tiến 2
              </p>
            </div>
          </div>

          <button
            onClick={handlePrintSettlement}
            disabled={farmerSessions.length === 0}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-lexend font-black px-5 py-2.5 rounded-2xl shadow-lg border border-emerald-400 shrink-0"
          >
            🖨️ In Bảng Quyết Toán A4
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farmer Selector & Deductions Form */}
        <div className={`p-5 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <h3 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
            <span>👤</span> Chọn Hộ Nông Dân & Khoản Khấu Trừ
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Tên Hộ Nông Dân Thành Viên (*):</label>
              <select
                value={selectedFarmer}
                onChange={(e) => setSelectedFarmer(e.target.value)}
                className={`w-full p-3 rounded-2xl border font-lexend font-black text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-emerald-300' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {farmersList.length === 0 ? (
                  <option value="">Chưa có dữ liệu nông dân</option>
                ) : (
                  farmersList.map((f, i) => (
                    <option key={i} value={f}>
                      🌾 Hộ {f}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="border-t pt-3 border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="font-lexend font-bold text-slate-700 dark:text-slate-300 block">
                Khấu trừ vật tư & dịch vụ HTX ứng trước:
              </span>

              <div>
                <label className="block font-semibold mb-1 text-slate-500">1. Tiền lúa giống HTX (HG12, J02...):</label>
                <input
                  type="number"
                  step="50000"
                  value={seedCost}
                  onChange={(e) => setSeedCost(parseFloat(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-xl border font-bold text-xs ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-rose-400' : 'bg-slate-50 border-slate-300 text-rose-800'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-500">2. Tiền phân bón & thuốc BVTV:</label>
                <input
                  type="number"
                  step="50000"
                  value={fertilizerCost}
                  onChange={(e) => setFertilizerCost(parseFloat(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-xl border font-bold text-xs ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-rose-400' : 'bg-slate-50 border-slate-300 text-rose-800'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-500">3. Tiền máy gặt đập liên hợp:</label>
                <input
                  type="number"
                  step="50000"
                  value={harvestMachineCost}
                  onChange={(e) => setHarvestMachineCost(parseFloat(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-xl border font-bold text-xs ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-rose-400' : 'bg-slate-50 border-slate-300 text-rose-800'
                  }`}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 font-lexend font-bold">
              <span>Số tiền thực nhận ròng:</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatVND(settlement.finalNetPayable)}
              </div>
            </div>
          </div>
        </div>

        {/* Printable Settlement Sheet */}
        <div className="lg:col-span-2">
          <div
            id="printable-receipt"
            className="bg-white text-slate-900 p-6 sm:p-9 rounded-3xl shadow-2xl border border-slate-200 font-sans space-y-6"
          >
            {/* Header Banner */}
            <div className="text-center border-b-2 border-emerald-700 pb-4">
              <h1 className="font-lexend font-extrabold text-sm text-emerald-900 uppercase">
                {adminConfig.htxInfo.name}
              </h1>
              <p className="text-[11px] text-slate-500">{adminConfig.htxInfo.address} • ĐT: {adminConfig.htxInfo.phone}</p>

              <h2 className="font-lexend font-black text-2xl text-slate-900 uppercase tracking-wide mt-2">
                BẢNG QUYẾT TOÁN TÀI CHÍNH THU HOẠCH
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Quyết toán mùa vụ • Ngày lập: {settlement.settlementDate}
              </p>
            </div>

            {/* Farmer Info */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-500">Thành viên HTX (Hộ Nông Dân):</span>
                <p className="font-lexend font-black text-base text-emerald-900">{settlement.farmerName}</p>
                {settlement.farmerPhone && <p className="text-[11px] text-slate-600">SĐT: {settlement.farmerPhone}</p>}
              </div>

              <div className="text-right">
                <span className="text-slate-500">Số thửa ruộng đã thu hoạch:</span>
                <p className="font-lexend font-black text-sm text-slate-900">{settlement.sessions.length} ruộng ({settlement.totalBags} bao lúa)</p>
              </div>
            </div>

            {/* Financial Details Table */}
            <div className="space-y-2 text-xs border-t border-b border-slate-200 py-3">
              <div className="flex justify-between py-1 font-bold text-sm">
                <span>(A) TỔNG DOANH THU LÚA THỰC TẾ:</span>
                <span className="text-emerald-700 font-lexend font-black">{formatVND(settlement.totalRiceMoney)}</span>
              </div>
              <div className="text-[11px] text-slate-500 pl-4">
                • Tổng cân ròng thực tế: <strong>{formatNumber(settlement.totalNetKg)} kg</strong>
              </div>

              <div className="pt-2 font-bold text-slate-800">
                (B) CÁC KHOẢN KHẤU TRỪ VẬT TƯ & CỌC HTX:
              </div>
              <div className="space-y-1 text-[11px] pl-4 text-rose-600">
                <div className="flex justify-between">
                  <span>1. Tiền lúa giống HTX ứng trước:</span>
                  <span className="font-bold">-{formatVND(settlement.seedCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Tiền phân bón & thuốc BVTV ứng trước:</span>
                  <span className="font-bold">-{formatVND(settlement.fertilizerCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>3. Tiền máy gặt đập liên hợp:</span>
                  <span className="font-bold">-{formatVND(settlement.harvestMachineCost)}</span>
                </div>
                {settlement.depositDeduction > 0 && (
                  <div className="flex justify-between">
                    <span>4. Tiền cọc / ứng trước mặt:</span>
                    <span className="font-bold">-{formatVND(settlement.depositDeduction)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between py-3 border-t-2 border-slate-900 text-base font-lexend font-black text-slate-900 bg-emerald-100 px-4 rounded-xl mt-3">
                <span>(A - B) THỰC NHẬN RÒNG CUỐI VỤ:</span>
                <span className="text-xl text-emerald-900">{formatVND(settlement.finalNetPayable)}</span>
              </div>
            </div>

            {/* List of Fields */}
            <div>
              <h4 className="font-lexend font-bold text-xs uppercase text-slate-700 mb-1.5">
                Chi tiết các thửa ruộng đã cân:
              </h4>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-lexend font-bold text-slate-700">
                    <th className="p-1.5">Mã Phiếu</th>
                    <th className="p-1.5">Địa Điểm</th>
                    <th className="p-1.5">Giống</th>
                    <th className="p-1.5">Số Bao</th>
                    <th className="p-1.5 text-right">Cân Ròng (kg)</th>
                    <th className="p-1.5 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {settlement.sessions.map((s) => {
                    const c = s.calculated || calculateTotals(s.bagWeights, s);
                    return (
                      <tr key={s.id} className="border-b border-slate-100 text-[11px]">
                        <td className="p-1.5 font-mono">#{s.id.slice(-5)}</td>
                        <td className="p-1.5">{s.location || 'Ruộng HTX'}</td>
                        <td className="p-1.5">{s.riceType}</td>
                        <td className="p-1.5">{c.totalBags} bao</td>
                        <td className="p-1.5 text-right font-bold">{formatNumber(c.finalNetWeight)} kg</td>
                        <td className="p-1.5 text-right font-bold text-emerald-700">{formatVND(c.totalAmount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-600">
              <div>
                <p className="font-lexend font-bold text-slate-900 uppercase">HỘ NÔNG DÂN THÀNH VIÊN</p>
                <p className="text-[10px] italic text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-800">{settlement.farmerName}</p>
              </div>

              <div>
                <p className="font-lexend font-bold text-slate-900 uppercase">BAN QUẢN TRỊ HTX HÒA TIẾN 2</p>
                <p className="text-[10px] italic text-slate-400 mt-0.5">(Ký và đóng dấu)</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-800">Phạm Công Tuân</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
