import React from 'react';
import { WeighingSession } from '../types';
import { calculateTotals, formatVND, formatNumber, normalizeEntry } from '../utils/formatters';

interface ReceiptViewProps {
  session: WeighingSession;
  onBack: () => void;
  onCopyZalo: () => void;
  darkMode: boolean;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  session,
  onBack,
  onCopyZalo,
  darkMode,
}) => {
  const calc = session.calculated || calculateTotals(session.bagWeights, session);
  const entries = (session.bagWeights || []).map(normalizeEntry);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all"
        >
          <span>← Quay lại</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopyZalo}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-xl shadow-sm transition-all"
          >
            <span>📋 Copy Zalo</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <span>🖨️ In Phiếu Cân</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Receipt Card */}
      <div
        id="printable-receipt"
        className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 font-sans space-y-5"
      >
        {/* Header Banner */}
        <div className="text-center border-b-2 border-amber-600 pb-4">
          <div className="inline-block p-2 bg-amber-50 rounded-full mb-1">🌾</div>
          <h2 className="text-2xl font-black text-amber-800 uppercase tracking-wide">
            PHIẾU CÂN LÚA THU HOẠCH
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Ngày cân: <strong>{session.date || new Date().toLocaleDateString('vi-VN')}</strong> • Mã phiếu: #{session.id.slice(-6)}
          </p>
        </div>

        {/* Farmer & Trader Info */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-amber-50/80 p-3.5 rounded-xl border border-amber-200">
          <div>
            <span className="text-slate-500">Chủ ruộng (Bên bán):</span>
            <p className="font-extrabold text-sm text-slate-900">{session.farmerName || '................................'}</p>
            {session.farmerPhone && <p className="text-[11px] text-slate-600">SĐT: {session.farmerPhone}</p>}
          </div>

          <div>
            <span className="text-slate-500">Lái lúa (Bên mua):</span>
            <p className="font-extrabold text-sm text-slate-900">{session.buyerName || '................................'}</p>
            {session.buyerPhone && <p className="text-[11px] text-slate-600">SĐT: {session.buyerPhone}</p>}
          </div>

          <div>
            <span className="text-slate-500">Giống lúa:</span>
            <p className="font-bold text-amber-800">{session.riceType}</p>
          </div>

          <div>
            <span className="text-slate-500">Đơn giá lúa:</span>
            <p className="font-bold text-amber-800">{formatVND(session.unitPrice)} / kg</p>
          </div>

          {session.note && (
            <div className="col-span-2 border-t border-amber-200/60 pt-1">
              <span className="text-slate-500">Ghi chú đồng ruộng:</span> {session.note}
            </div>
          )}
        </div>

        {/* Financial & Weight Table */}
        <div className="space-y-2 text-xs border-t border-b border-slate-200 py-3">
          <div className="flex justify-between py-1">
            <span className="text-slate-600">Tổng số bao lúa:</span>
            <span className="font-extrabold text-sm">
              {calc.totalBags} bao {calc.totalDrafts !== calc.totalBags ? `(${calc.totalDrafts} mã cân)` : ''}
            </span>
          </div>

          <div className="flex justify-between py-1 border-t border-slate-100">
            <span className="text-slate-600">Tổng cân thô ban đầu:</span>
            <span className="font-bold">{formatNumber(calc.grossWeight)} kg</span>
          </div>

          <div className="flex justify-between py-1 border-t border-slate-100 text-rose-600">
            <span>Trừ bì bao ({session.tarePerBag} kg/bao):</span>
            <span className="font-bold">-{formatNumber(calc.totalTare)} kg</span>
          </div>

          <div className="flex justify-between py-1 border-t border-slate-100 text-rose-600">
            <span>Trừ lép/độ ẩm ({session.impurityPercent}%):</span>
            <span className="font-bold">-{formatNumber(calc.impurityDeduction)} kg</span>
          </div>

          <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-amber-900 bg-amber-50/50 px-2 rounded-lg">
            <span>CÂN RÒNG THỰC TẾ:</span>
            <span>{formatNumber(calc.finalNetWeight)} kg</span>
          </div>

          <div className="flex justify-between py-2 border-t border-slate-200 text-base font-black text-slate-900">
            <span>TỔNG THÀNH TIỀN:</span>
            <span className="text-emerald-700">{formatVND(calc.totalAmount)}</span>
          </div>

          {calc.depositAmount > 0 && (
            <>
              <div className="flex justify-between py-1 border-t border-slate-100 text-slate-600">
                <span>Trừ tiền cọc/ứng trước:</span>
                <span className="font-bold text-rose-600">-{formatVND(calc.depositAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-rose-500 text-sm font-black text-rose-700 bg-rose-50/80 px-2 rounded-lg">
                <span>CÒN LẠI THANH TOÁN:</span>
                <span>{formatVND(calc.remainingPayable)}</span>
              </div>
            </>
          )}
        </div>

        {/* Detailed Bag Weights Table */}
        <div className="space-y-1">
          <div className="font-bold text-xs uppercase text-slate-700 mb-1.5 flex justify-between items-center">
            <span>Chi tiết mã cân ({calc.totalBags} bao / {calc.totalDrafts} mã cân):</span>
            <span className="text-[10px] text-slate-400 font-normal">Đơn vị: kg</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 text-[11px] font-mono border p-2 rounded-xl bg-slate-50 max-h-48 overflow-y-auto">
            {entries.map((e, idx) => (
              <div key={idx} className="p-1 border rounded bg-white text-center">
                <span className="text-[9px] text-slate-400 block">#{idx + 1}</span>
                <strong className="text-slate-900">{e.weight} kg</strong>
                {e.bagsCount > 1 && (
                  <span className="text-[9px] block text-amber-700 font-bold">({e.bagsCount} bao)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Signature Section */}
        <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-600 gap-4">
          <div>
            <p className="font-bold text-slate-900 uppercase">CHỦ RUỘNG (BÊN BÁN)</p>
            <p className="text-[10px] italic text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-800">{session.farmerName || '....................'}</p>
          </div>

          <div>
            <p className="font-bold text-slate-900 uppercase">THƯƠNG LÁI (BÊN MUA)</p>
            <p className="text-[10px] italic text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-800">{session.buyerName || '....................'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-3 text-center text-[10px] text-slate-400 italic">
          Phiếu cân được tạo tự động bởi ứng dụng Cân Lúa Đồng Rộng (AI Powered). Chúc bà con mùa màng bội thu!
        </div>
      </div>
    </div>
  );
};
