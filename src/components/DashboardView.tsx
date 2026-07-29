import React, { useState, useMemo } from 'react';
import { WeighingSession } from '../types';
import { calculateTotals, formatVND, formatNumber, normalizeEntry } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

interface DashboardViewProps {
  sessions: WeighingSession[];
  darkMode: boolean;
  onSelectSession: (session: WeighingSession) => void;
}

const COLORS = ['#d97706', '#059669', '#2563eb', '#9333ea', '#dc2626', '#0891b2', '#ea580c', '#4f46e5'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  darkMode,
  onSelectSession,
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | '7days' | '30days' | 'thisMonth'>('all');
  const [selectedRiceType, setSelectedRiceType] = useState<string>('all');

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    // Filter by Rice Type
    if (selectedRiceType !== 'all') {
      result = result.filter((s) => s.riceType === selectedRiceType);
    }

    // Filter by Date
    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();

      if (timeFilter === '7days') {
        cutoff.setDate(now.getDate() - 7);
      } else if (timeFilter === '30days') {
        cutoff.setDate(now.getDate() - 30);
      } else if (timeFilter === 'thisMonth') {
        cutoff.setDate(1); // đầu tháng
      }

      cutoff.setHours(0, 0, 0, 0);

      result = result.filter((s) => {
        const sessionDate = new Date(s.date || s.createdAt);
        return sessionDate >= cutoff;
      });
    }

    return result;
  }, [sessions, timeFilter, selectedRiceType]);

  // Available Rice Types list
  const riceTypesList = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.riceType) set.add(s.riceType);
    });
    return Array.from(set);
  }, [sessions]);

  // Overall KPI Metrics
  const metrics = useMemo(() => {
    let totalSessions = filteredSessions.length;
    let totalBags = 0;
    let totalDrafts = 0;
    let totalGrossKg = 0;
    let totalNetKg = 0;
    let totalRevenue = 0;
    let totalDeposit = 0;
    let totalRemaining = 0;
    let totalAreaSize = 0;

    filteredSessions.forEach((s) => {
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      totalBags += calc.totalBags;
      totalDrafts += calc.totalDrafts;
      totalGrossKg += calc.grossWeight;
      totalNetKg += (calc.finalNetWeight || 0);
      totalRevenue += calc.totalAmount;
      totalDeposit += calc.depositAmount;
      totalRemaining += calc.remainingPayable;
      if (s.areaSize) totalAreaSize += s.areaSize;
    });

    const totalTons = totalNetKg / 1000;
    const avgPricePerKg = totalNetKg > 0 ? Math.round(totalRevenue / totalNetKg) : 0;
    const avgYieldPerArea = totalAreaSize > 0 ? (totalNetKg / totalAreaSize).toFixed(0) : null;

    return {
      totalSessions,
      totalBags,
      totalDrafts,
      totalGrossKg,
      totalNetKg,
      totalTons,
      totalRevenue,
      totalDeposit,
      totalRemaining,
      avgPricePerKg,
      totalAreaSize,
      avgYieldPerArea,
    };
  }, [filteredSessions]);

  // Data grouped by Rice Variety
  const riceVarietyData = useMemo(() => {
    const map = new Map<string, { riceType: string; netKg: number; revenue: number; bags: number; count: number }>();

    filteredSessions.forEach((s) => {
      const type = s.riceType || 'Khác / Chưa ghi';
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      const current = map.get(type) || { riceType: type, netKg: 0, revenue: 0, bags: 0, count: 0 };

      current.netKg += (calc.finalNetWeight || 0);
      current.revenue += calc.totalAmount;
      current.bags += calc.totalBags;
      current.count += 1;

      map.set(type, current);
    });

    return Array.from(map.values()).sort((a, b) => b.netKg - a.netKg);
  }, [filteredSessions]);

  // Data grouped by Date (Chronological)
  const timelineData = useMemo(() => {
    const map = new Map<string, { date: string; netKg: number; revenue: number; bags: number; sessionsCount: number }>();

    filteredSessions.forEach((s) => {
      const dateStr = s.date || s.createdAt.substring(0, 10);
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      const current = map.get(dateStr) || { date: dateStr, netKg: 0, revenue: 0, bags: 0, sessionsCount: 0 };

      current.netKg += (calc.finalNetWeight || 0);
      current.revenue += calc.totalAmount;
      current.bags += calc.totalBags;
      current.sessionsCount += 1;

      map.set(dateStr, current);
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSessions]);

  // Top Farmers & Top Buyers Ranking
  const topFarmers = useMemo(() => {
    const map = new Map<string, { name: string; phone?: string; totalNetKg: number; totalAmount: number; sessionCount: number }>();

    filteredSessions.forEach((s) => {
      const name = s.farmerName || 'Chủ ruộng vãng lai';
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      const current = map.get(name) || { name, phone: s.farmerPhone, totalNetKg: 0, totalAmount: 0, sessionCount: 0 };

      current.totalNetKg += (calc.finalNetWeight || 0);
      current.totalAmount += calc.totalAmount;
      current.sessionCount += 1;

      map.set(name, current);
    });

    return Array.from(map.values()).sort((a, b) => b.totalNetKg - a.totalNetKg).slice(0, 5);
  }, [filteredSessions]);

  const topBuyers = useMemo(() => {
    const map = new Map<string, { name: string; totalNetKg: number; totalAmount: number; sessionCount: number }>();

    filteredSessions.forEach((s) => {
      const name = s.buyerName || 'Lái buôn chưa ghi';
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      const current = map.get(name) || { name, totalNetKg: 0, totalAmount: 0, sessionCount: 0 };

      current.totalNetKg += (calc.finalNetWeight || 0);
      current.totalAmount += calc.totalAmount;
      current.sessionCount += 1;

      map.set(name, current);
    });

    return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);
  }, [filteredSessions]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner / Controls */}
      <div className={`p-5 rounded-2xl border shadow-md transition-all ${
        darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-amber-200/80'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                BÁO CÁO & THỐNG KÊ CÂN LÚA
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Phân tích sản lượng, doanh thu, giống lúa và dư nợ thanh toán tổng hợp
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  timeFilter === 'all'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setTimeFilter('thisMonth')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  timeFilter === 'thisMonth'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                }`}
              >
                Tháng này
              </button>
              <button
                onClick={() => setTimeFilter('30days')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  timeFilter === '30days'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                }`}
              >
                30 Ngày
              </button>
              <button
                onClick={() => setTimeFilter('7days')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  timeFilter === '7days'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                }`}
              >
                7 Ngày
              </button>
            </div>

            {/* Rice Variety Filter */}
            <select
              value={selectedRiceType}
              onChange={(e) => setSelectedRiceType(e.target.value)}
              className={`p-2 text-xs font-bold rounded-xl border ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-amber-400'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">🌾 Tất cả giống lúa</option>
              {riceTypesList.map((t) => (
                <option key={t} value={t}>
                  Giống {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Revenue */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-md relative overflow-hidden transition-all ${
          darkMode
            ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border-amber-600/30 text-slate-100'
            : 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white border-amber-600'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Tổng Doanh Thu</span>
            <span className="p-2 bg-white/10 rounded-xl text-lg">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-black">{formatVND(metrics.totalRevenue)}</div>
          <div className="text-[11px] mt-2 opacity-80 flex items-center justify-between">
            <span>Đã cọc/thanh toán: <strong>{formatVND(metrics.totalDeposit)}</strong></span>
          </div>
        </div>

        {/* KPI 2: Total Net Weight */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-md relative overflow-hidden transition-all ${
          darkMode
            ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-600/30 text-slate-100'
            : 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white border-emerald-600'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Tổng Cân Ròng</span>
            <span className="p-2 bg-white/10 rounded-xl text-lg">🌾</span>
          </div>
          <div className="text-xl sm:text-2xl font-black">
            {formatNumber(metrics.totalNetKg)} <span className="text-xs font-normal">kg</span>
          </div>
          <div className="text-[11px] mt-2 opacity-80 flex items-center justify-between">
            <span>Tương đương: <strong>{metrics.totalTons.toFixed(2)} tấn</strong></span>
          </div>
        </div>

        {/* KPI 3: Total Bags & Drafts */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-md relative overflow-hidden transition-all ${
          darkMode
            ? 'bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border-blue-600/30 text-slate-100'
            : 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white border-blue-600'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Số Bao & Mã Cân</span>
            <span className="p-2 bg-white/10 rounded-xl text-lg">📦</span>
          </div>
          <div className="text-xl sm:text-2xl font-black">
            {formatNumber(metrics.totalBags)} <span className="text-xs font-normal">bao</span>
          </div>
          <div className="text-[11px] mt-2 opacity-80 flex items-center justify-between">
            <span>{metrics.totalDrafts} mã cân / {metrics.totalSessions} phiếu</span>
          </div>
        </div>

        {/* KPI 4: Remaining Payable */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-md relative overflow-hidden transition-all ${
          darkMode
            ? 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border-rose-600/30 text-slate-100'
            : 'bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 text-white border-rose-600'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Còn Lại Cần Trả</span>
            <span className="p-2 bg-white/10 rounded-xl text-lg">🤝</span>
          </div>
          <div className="text-xl sm:text-2xl font-black">{formatVND(metrics.totalRemaining)}</div>
          <div className="text-[11px] mt-2 opacity-80 flex items-center justify-between">
            <span>Đơn giá trung bình: <strong>{formatNumber(metrics.avgPricePerKg)}đ/kg</strong></span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Rice Varieties Distribution & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Rice Variety Breakdown */}
        <div className={`p-5 rounded-2xl border shadow-md ${
          darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🌱</span> Phân Bổ Sản Lượng Theo Giống Lúa
            </h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full">
              {riceVarietyData.length} giống
            </span>
          </div>

          {riceVarietyData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
              <span>🌾 Chưa có dữ liệu phiếu cân</span>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riceVarietyData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="riceType" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any, name: string) => [
                      name === 'netKg' ? `${formatNumber(val)} kg` : formatVND(val),
                      name === 'netKg' ? 'Sản lượng ròng' : 'Doanh thu',
                    ]}
                    contentStyle={{
                      backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                      borderColor: '#d97706',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="netKg" name="Sản lượng (kg)" fill="#d97706" radius={[6, 6, 0, 0]}>
                    {riceVarietyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Rice Variety Details Table */}
          {riceVarietyData.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              {riceVarietyData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Giống {item.riceType}</span>
                    <span className="text-[10px] text-slate-400">({item.count} phiếu)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-amber-700 dark:text-amber-400 mr-3">{formatNumber(item.netKg)} kg</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400">{formatVND(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart 2: Timeline Harvest Progress */}
        <div className={`p-5 rounded-2xl border shadow-md ${
          darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>📅</span> Tiến Độ Cân Lúa Theo Thời Gian
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
              {timelineData.length} ngày cân
            </span>
          </div>

          {timelineData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
              <span>📅 Chưa có dữ liệu thời gian</span>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any, name: string) => [
                      name === 'netKg' ? `${formatNumber(val)} kg` : formatVND(val),
                      name === 'netKg' ? 'Sản lượng' : 'Thành tiền',
                    ]}
                    contentStyle={{
                      backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                      borderColor: '#059669',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="netKg" name="Sản lượng (kg)" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Additional Harvest Insights */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Sản lượng TB / phiếu</span>
              <strong className="text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                {metrics.totalSessions > 0 ? `${formatNumber(Math.round(metrics.totalNetKg / metrics.totalSessions))} kg` : '0 kg'}
              </strong>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Trọng lượng TB / bao</span>
              <strong className="text-emerald-800 dark:text-emerald-300 font-extrabold text-sm">
                {metrics.totalBags > 0 ? `${(metrics.totalGrossKg / metrics.totalBags).toFixed(1)} kg` : '0 kg'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Top Rankings: Farmers & Buyers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Farmers */}
        <div className={`p-5 rounded-2xl border shadow-md ${
          darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🌾</span> Top Chủ Ruộng Thu Hoạch Lớn Nhất
            </h3>
          </div>

          {topFarmers.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Chưa có dữ liệu chủ ruộng</p>
          ) : (
            <div className="space-y-2.5">
              {topFarmers.map((farmer, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center text-white ${
                      idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-slate-600'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{farmer.name}</h4>
                      {farmer.phone && <p className="text-[11px] text-slate-400">📞 {farmer.phone}</p>}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-amber-700 dark:text-amber-400 text-sm">
                      {formatNumber(farmer.totalNetKg)} kg
                    </div>
                    <div className="text-xs text-slate-500">{formatVND(farmer.totalAmount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Buyers */}
        <div className={`p-5 rounded-2xl border shadow-md ${
          darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🚛</span> Top Lái Cân / Thương Lái Mua
            </h3>
          </div>

          {topBuyers.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Chưa có dữ liệu lái cân</p>
          ) : (
            <div className="space-y-2.5">
              {topBuyers.map((buyer, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center text-white ${
                      idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-blue-500' : 'bg-slate-600'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{buyer.name}</h4>
                      <p className="text-[11px] text-slate-400">{buyer.sessionCount} chuyến/phiếu mua</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                      {formatVND(buyer.totalAmount)}
                    </div>
                    <div className="text-xs text-slate-500">{formatNumber(buyer.totalNetKg)} kg</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Recent Sessions Quick Navigation Table */}
      <div className={`p-5 rounded-2xl border shadow-md ${
        darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>📑</span> Danh Sách Phiếu Cân Gần Đây
          </h3>
          <span className="text-xs text-slate-400">Hiển thị {filteredSessions.length} phiếu</span>
        </div>

        {filteredSessions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Không có phiếu cân nào trong bộ lọc này</p>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-slate-500 dark:text-slate-400 ${
                  darkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                }`}>
                  <th className="p-2.5 font-bold">Ngày & Mã</th>
                  <th className="p-2.5 font-bold">Chủ Ruộng</th>
                  <th className="p-2.5 font-bold">Lái Mua</th>
                  <th className="p-2.5 font-bold">Giống Lúa</th>
                  <th className="p-2.5 font-bold text-right">Số Bao</th>
                  <th className="p-2.5 font-bold text-right">Cân Ròng (kg)</th>
                  <th className="p-2.5 font-bold text-right">Thành Tiền</th>
                  <th className="p-2.5 font-bold text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSessions.slice(0, 10).map((s) => {
                  const calc = s.calculated || calculateTotals(s.bagWeights, s);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-amber-500/5 transition-colors cursor-pointer ${
                        darkMode ? 'text-slate-200' : 'text-slate-800'
                      }`}
                      onClick={() => onSelectSession(s)}
                    >
                      <td className="p-2.5 font-mono text-amber-700 dark:text-amber-400 font-bold">
                        <div>{s.date}</div>
                        <div className="text-[10px] text-slate-400">#{s.id.slice(-6)}</div>
                      </td>
                      <td className="p-2.5 font-bold">{s.farmerName || '—'}</td>
                      <td className="p-2.5 text-slate-500">{s.buyerName || '—'}</td>
                      <td className="p-2.5 font-bold text-amber-600 dark:text-amber-400">{s.riceType}</td>
                      <td className="p-2.5 text-right font-bold">{calc.totalBags} bao</td>
                      <td className="p-2.5 text-right font-black text-amber-700 dark:text-amber-400">
                        {formatNumber(calc.finalNetWeight)} kg
                      </td>
                      <td className="p-2.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatVND(calc.totalAmount)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSession(s);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-sm"
                        >
                          Xem Phiếu
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
