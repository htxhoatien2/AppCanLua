import React, { useState } from 'react';
import { WeighingSession, TruckBatch, AdminConfig } from '../types';
import { calculateTotals, formatVND, formatNumber } from '../utils/formatters';

interface TruckBatchViewProps {
  sessions: WeighingSession[];
  adminConfig: AdminConfig;
  darkMode: boolean;
}

export const TruckBatchView: React.FC<TruckBatchViewProps> = ({
  sessions,
  adminConfig,
  darkMode,
}) => {
  const [selectedTruck, setSelectedTruck] = useState<string>(adminConfig.trucks[0] || 'Xe Đội 1 HTX Hòa Tiến 2');
  const [driverName, setDriverName] = useState<string>('');
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [activeBatch, setActiveBatch] = useState<TruckBatch | null>(null);

  // Available unbatched sessions matching truck or all
  const availableSessions = sessions.filter((s) => !s.truckBatchId);

  const handleToggleSession = (id: string) => {
    if (selectedSessionIds.includes(id)) {
      setSelectedSessionIds(selectedSessionIds.filter((item) => item !== id));
    } else {
      setSelectedSessionIds([...selectedSessionIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSessionIds.length === availableSessions.length) {
      setSelectedSessionIds([]);
    } else {
      setSelectedSessionIds(availableSessions.map((s) => s.id));
    }
  };

  const handleCreateTruckBatch = () => {
    if (selectedSessionIds.length === 0) {
      return alert('Vui lòng chọn ít nhất 1 phiếu cân để gom vào chuyến xe tải!');
    }

    const batchSessions = sessions.filter((s) => selectedSessionIds.includes(s.id));
    let totalBags = 0;
    let totalGrossKg = 0;
    let totalNetKg = 0;
    let totalAmount = 0;

    batchSessions.forEach((s) => {
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      totalBags += calc.totalBags;
      totalGrossKg += calc.grossWeight;
      totalNetKg += calc.finalNetWeight;
      totalAmount += calc.totalAmount;
    });

    const newBatch: TruckBatch = {
      id: Date.now().toString(),
      batchCode: `CX-${Date.now().toString().slice(-5)}`,
      truckInfo: selectedTruck,
      driverName: driverName.trim() || 'Tài xế nhận lúa',
      date: new Date().toISOString().split('T')[0],
      sessionIds: selectedSessionIds,
      totalBags,
      totalGrossKg: Number(totalGrossKg.toFixed(1)),
      totalNetKg: Number(totalNetKg.toFixed(1)),
      totalAmount,
      status: 'loading',
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    setActiveBatch(newBatch);
  };

  const handlePrintBatch = () => {
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
              🚛
            </div>
            <div>
              <h2 className="font-lexend font-black text-xl sm:text-2xl text-slate-800 dark:text-slate-100 tracking-tight">
                QUẢN LÝ BẢNG KÊ CHUYẾN XE NHẬN LÚA
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Gom phiếu cân lúa bờ ruộng thành chuyến xe tải chở về nhà máy sấy ({adminConfig.htxInfo.name})
              </p>
            </div>
          </div>

          {activeBatch && (
            <button
              onClick={() => setActiveBatch(null)}
              className="text-xs bg-slate-200 dark:bg-slate-800 font-bold px-4 py-2.5 rounded-2xl"
            >
              ← Tạo Chuyến Mới
            </button>
          )}
        </div>
      </div>

      {!activeBatch ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Form */}
          <div className={`p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
              <span>➕</span> Lập Chuyến Xe Tải Mới
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Biển Số Xe / Xe Nhận (*):</label>
                <select
                  value={selectedTruck}
                  onChange={(e) => setSelectedTruck(e.target.value)}
                  className={`w-full p-3 rounded-2xl border font-lexend font-bold text-xs ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {adminConfig.trucks.map((t, idx) => (
                    <option key={idx} value={t}>
                      🚛 {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Tên Tài Xế / Lái Xe:</label>
                <input
                  type="text"
                  placeholder="VD: Anh Ba Tài Xế..."
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className={`w-full p-3 rounded-2xl border font-bold text-xs ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <span className="block font-bold mb-0.5">Đã chọn:</span>
                <strong className="font-lexend font-black text-base">{selectedSessionIds.length} phiếu cân</strong>
              </div>

              <button
                type="button"
                onClick={handleCreateTruckBatch}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-3.5 px-4 rounded-2xl shadow-lg transition-all text-xs"
              >
                🚚 Xuất Bảng Kê Chuyến Xe
              </button>
            </div>
          </div>

          {/* Sessions Selector Table */}
          <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-lexend font-black text-sm text-slate-800 dark:text-slate-100">
                Chọn Phiếu Cân Gom Lên Xe ({availableSessions.length} phiếu sẵn có)
              </h3>

              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline"
              >
                {selectedSessionIds.length === availableSessions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>

            {availableSessions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Không có phiếu cân lẻ nào chưa xếp lên xe.</p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {availableSessions.map((s) => {
                  const isChecked = selectedSessionIds.includes(s.id);
                  const calc = s.calculated || calculateTotals(s.bagWeights, s);

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleSession(s.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isChecked
                          ? 'bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white font-bold'
                          : darkMode
                            ? 'bg-slate-950 border-slate-800 text-slate-300'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 accent-emerald-600 rounded"
                        />
                        <div>
                          <h4 className="font-lexend font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                            👤 {s.farmerName || 'Chủ ruộng'} • 🌾 {s.riceType}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            📍 {s.location || 'Ruộng HTX'} • ⚖️ Người cân: {s.operatorName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-lexend">
                        <strong className="text-sm font-black text-amber-600 dark:text-amber-400">{formatNumber(calc.finalNetWeight)} kg</strong>
                        <span className="text-[11px] block text-slate-400 font-semibold">{calc.totalBags} bao</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Printable Truck Load Sheet */
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex justify-between items-center print:hidden">
            <button
              onClick={() => setActiveBatch(null)}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-xl"
            >
              ← Quay lại chọn phiếu
            </button>
            <button
              onClick={handlePrintBatch}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black px-5 py-2.5 rounded-2xl shadow-lg border border-emerald-400"
            >
              🖨️ In Bảng Kê Chuyến Xe A4
            </button>
          </div>

          <div
            id="printable-receipt"
            className="bg-white text-slate-900 p-7 sm:p-9 rounded-3xl shadow-2xl border border-slate-200 font-sans space-y-6"
          >
            {/* Banner Header */}
            <div className="text-center border-b-2 border-emerald-700 pb-4">
              <h1 className="font-lexend font-extrabold text-base text-emerald-900 uppercase">
                {adminConfig.htxInfo.name}
              </h1>
              <p className="text-[11px] text-slate-500">{adminConfig.htxInfo.address} • ĐT: {adminConfig.htxInfo.phone}</p>
              <h2 className="font-lexend font-black text-2xl text-slate-900 uppercase tracking-wide mt-2">
                BẢNG KÊ CHUYẾN XE NHẬN LÚA
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Mã chuyến xe: <strong className="font-mono text-emerald-800">{activeBatch.batchCode}</strong> • Ngày: {activeBatch.date}
              </p>
            </div>

            {/* Truck Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <div>
                <span className="text-slate-500">Biển số xe nhận:</span>
                <p className="font-lexend font-black text-sm text-emerald-900">{activeBatch.truckInfo}</p>
              </div>
              <div>
                <span className="text-slate-500">Tài xế / Lái xe:</span>
                <p className="font-lexend font-bold text-sm text-slate-900">{activeBatch.driverName}</p>
              </div>
              <div>
                <span className="text-slate-500">Thời gian bốc lúa:</span>
                <p className="font-bold text-slate-800">{activeBatch.createdAt}</p>
              </div>
              <div>
                <span className="text-slate-500">Nơi giao hàng:</span>
                <p className="font-bold text-slate-800">Nhà Máy Sấy Lúa HTX Hòa Tiến 2</p>
              </div>
            </div>

            {/* Summary Load Box */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs py-3 border-t border-b border-slate-200">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Tổng số bao lúa:</span>
                <strong className="text-lg font-lexend font-black text-slate-900">{activeBatch.totalBags} bao</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Tổng cân thô:</span>
                <strong className="text-lg font-lexend font-black text-slate-900">{formatNumber(activeBatch.totalGrossKg)} kg</strong>
              </div>
              <div className="p-2.5 bg-emerald-100 rounded-xl">
                <span className="text-emerald-800 block font-bold">TỔNG CÂN RÒNG XE:</span>
                <strong className="text-xl font-lexend font-black text-emerald-900">{formatNumber(activeBatch.totalNetKg)} kg</strong>
              </div>
            </div>

            {/* Detailed Sessions Table */}
            <div>
              <h3 className="font-lexend font-bold text-xs uppercase text-slate-700 mb-2">
                Chi tiết các thửa ruộng trên xe ({activeBatch.sessionIds.length} phiếu):
              </h3>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-900 text-white font-lexend font-bold">
                    <th className="p-2 rounded-tl-lg">STT</th>
                    <th className="p-2">Chủ Ruộng</th>
                    <th className="p-2">Giống Lúa</th>
                    <th className="p-2">Số Bao</th>
                    <th className="p-2 text-right rounded-tr-lg">Cân Ròng (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.filter((s) => activeBatch.sessionIds.includes(s.id)).map((s, i) => {
                    const calc = s.calculated || calculateTotals(s.bagWeights, s);
                    return (
                      <tr key={s.id} className="border-b border-slate-100 font-semibold">
                        <td className="p-2 font-mono">#{i + 1}</td>
                        <td className="p-2">{s.farmerName}</td>
                        <td className="p-2">{s.riceType}</td>
                        <td className="p-2">{calc.totalBags} bao</td>
                        <td className="p-2 text-right font-lexend font-bold">{formatNumber(calc.finalNetWeight)} kg</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-600">
              <div>
                <p className="font-lexend font-bold text-slate-900">TÀI XẾ XE TẢI</p>
                <p className="text-[10px] italic text-slate-400">(Ký và ghi rõ họ tên)</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-800">{activeBatch.driverName}</p>
              </div>

              <div>
                <p className="font-lexend font-bold text-slate-900">CÁN BỘ CÂN HTX</p>
                <p className="text-[10px] italic text-slate-400">(Ký và ghi rõ họ tên)</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-800">Phạm Công Tuân</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
