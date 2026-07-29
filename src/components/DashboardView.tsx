import React, { useState, useMemo } from 'react';
import { WeighingSession } from '../types';
import { calculateTotals, formatVND, formatNumber } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
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

    if (selectedRiceType !== 'all') {
      result = result.filter((s) => s.riceType === selectedRiceType);
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();

      if (timeFilter === '7days') {
        cutoff.setDate(now.getDate() - 7);
      } else if (timeFilter === '30days') {
        cutoff.setDate(now.getDate() - 30);
      } else if (timeFilter === 'thisMonth') {
        cutoff.setDate(1);
      }

      cutoff.setHours(0, 0, 0, 0);

      result = result.filter((s) => {
        const sessionDate = new Date(s.date || s.createdAt);
        return sessionDate >= cutoff;
      });
    }

    return result;
  }, [sessions, timeFilter, selectedRiceType]);

  const riceTypesList = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.riceType) set.add(s.riceType);
    });
    return Array.from(set);
  }, [sessions]);

  // KPI Metrics
  const metrics = useMemo(() => {
    let totalSessions = filteredSessions.length;
    let totalBags = 0;
    let totalDrafts = 0;
    let totalGrossKg = 0;
    let totalNetKg = 0;
    let totalRevenue = 0;
    let totalDeposit = 0;
    let totalRemaining = 0;

    filteredSessions.forEach((s) => {
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      totalBags += calc.totalBags;
      totalDrafts += calc.totalDrafts;
      totalGrossKg += calc.grossWeight;
      totalNetKg += (calc.finalNetWeight || 0);
      totalRevenue += calc.totalAmount;
      totalDeposit += calc.depositAmount;
      totalRemaining += calc.remainingPayable;
    });

    const totalTons = totalNetKg / 1000;
    const avgPricePerKg = totalNetKg > 0 ? Math.round(totalRevenue / totalNetKg) : 0;

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
    };
  }, [filteredSessions]);

  // Rice Variety Data
  const riceVarietyData = useMemo(() => {
    const map = new Map<string, { riceType: string; netKg: number; revenue: number; count: number }>();

    filteredSessions.forEach((s) => {
      const type = s.riceType || 'Khác';
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      const current = map.get(type) || { riceType: type, netKg: 0, revenue: 0, count: 0 };

      current.netKg += (calc.finalNetWeight || 0);
      current.revenue += calc.totalAmount;
      current.count += 1;

      map.set(type, current);
    });

    return Array.from(map.values()).sort((a, b) => b.netKg - a.netKg);
  }, [filteredSessions]);

  // Timeline Data
  const timelineData = useMemo(() => {
    const map = new Map<string, { date: string; netKg: number; revenue: number }>();

    filteredSessions.forEach((s) => {
      const dateStr = s.date || s.createdAt.substring(0, 10);
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      const current = map.get(dateStr) || { date: dateStr, netKg: 0, revenue: 0 };

      current.netKg += (calc.finalNetWeight || 0);
      current.revenue += calc.totalAmount;

      map.set(dateStr, current);
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSessions]);

  // Top Xe Nhận Lúa
  const topTrucks = useMemo(() => {
    const map = new Map<string, { name: string; totalNetKg: number; totalAmount: number; count: number }>();

    filteredSessions.forEach((s) => {
      const name = s.truckInfo || 'Xe HTX chưa ghi';
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      const current = map.get(name) || { name, totalNetKg: 0, totalAmount: 0, count: 0 };

      current.totalNetKg += (calc.finalNetWeight || 0);
      current.totalAmount += calc.totalAmount;
      current.count += 1;

      map.set(name, current);
    });

    return Array.from(map.values()).sort((a, b) => b.totalNetKg - a.totalNetKg).slice(0, 5);
  }, [filteredSessions]);

  // Top Cán Bộ Cân HTX
  const topOperators = useMemo(() => {
    const map = new Map<string, { name: string; totalNetKg: number; totalAmount: number; count: number }>();

    filteredSessions.forEach((s) => {
      const name = s.operatorName || 'Phạm Công Tuân';
      const calc = s.calculated || calculateTotals(s.bagWeights, s);
      const current = map.get(name) || { name, totalNetKg: 0, totalAmount: 0, count: 0 };

      current.totalNetKg += (calc.finalNetWeight || 0);
      current.totalAmount += calc.totalAmount;
      current.count += 1;

      map.set(name, current);
    });

    return Array.from(map.values()).sort((a, b) => b.totalNetKg - a.totalNetKg).slice(0, 5);
  }, [filteredSessions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Controls */}
      <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl transition-all duration-300 ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-amber-200/90'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📈</span>
              <h2 className="text-xl sm:text-2xl font-lexend font-black text-slate-800 dark:text-slate-100 tracking-tight">
                BÁO CÁO SẢN LƯỢNG HTX HÒA TIẾN 2 (ĐÀ NẴNG)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Phân tích sản lượng lúa, doanh thu, giống lúa HT1, ĐV108... theo từng Xe Nhận & Cán Bộ Cân
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-inner">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-lexend transition-all ${
                  timeFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setTimeFilter('thisMonth')}
                className={`px-3 py-1.5 rounded-xl font-lexend transition-all ${
                  timeFilter === 'thisMonth'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                }`}
              >
                Tháng này
              </button>
              <button
                onClick={() => setTimeFilter('30days')}
                className={`px-3 py-1.5 rounded-xl font-lexend transition-all ${
                  timeFilter === '30days'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                }`}
              >
                30 Ngày
              </button>
              <button
                onClick={() => setTimeFilter('7days')}
                className={`px-3 py-1.5 rounded-xl font-lexend transition-all ${
                  timeFilter === '7days'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                }`}
              >
                7 Ngày
              </button>
            </div>

            <select
              value={selectedRiceType}
              onChange={(e) => setSelectedRiceType(e.target.value)}
              className={`p-2.5 text-xs font-lexend font-extrabold rounded-2xl border transition-all ${
                darkMode
                  ? 'bg-slate-950 border-slate-700 text-amber-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
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
        <div className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
          darkMode
            ? 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-900 border-amber-500/40 text-slate-100 shadow-black/50'
            : 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white border-amber-600 shadow-amber-900/20'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-lexend font-black uppercase tracking-wider opacity-90">Tổng Doanh Thu</span>
            <span className="p-2 bg-white/20 rounded-2xl text-xl backdrop-blur-md">💰</span>
          </div>
          <div className="text-2xl sm:text-3xl font-lexend font-black tracking-tight">{formatVND(metrics.totalRevenue)}</div>
          <div className="text-[11px] mt-2 opacity-90 flex items-center justify-between font-semibold">
            <span>Đã cọc: <strong>{formatVND(metrics.totalDeposit)}</strong></span>
          </div>
        </div>

        {/* KPI 2: Total Net Weight */}
        <div className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
          darkMode
            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/40 text-slate-100 shadow-black/50'
            : 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white border-emerald-600 shadow-emerald-900/20'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-lexend font-black uppercase tracking-wider opacity-90">Tổng Cân Ròng</span>
            <span className="p-2 bg-white/20 rounded-2xl text-xl backdrop-blur-md">🌾</span>
          </div>
          <div className="text-2xl sm:text-3xl font-lexend font-black tracking-tight">
            {formatNumber(metrics.totalNetKg)} <span className="text-xs font-normal">kg</span>
          </div>
          <div className="text-[11px] mt-2 opacity-90 flex items-center justify-between font-semibold">
            <span>Bằng: <strong>{metrics.totalTons.toFixed(2)} tấn</strong></span>
          </div>
        </div>

        {/* KPI 3: Total Bags & Drafts */}
        <div className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
          darkMode
            ? 'bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-900 border-blue-500/40 text-slate-100 shadow-black/50'
            : 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white border-blue-600 shadow-blue-900/20'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-lexend font-black uppercase tracking-wider opacity-90">Số Bao & Mã Cân</span>
            <span className="p-2 bg-white/20 rounded-2xl text-xl backdrop-blur-md">📦</span>
          </div>
          <div className="text-2xl sm:text-3xl font-lexend font-black tracking-tight">
            {formatNumber(metrics.totalBags)} <span className="text-xs font-normal">bao</span>
          </div>
          <div className="text-[11px] mt-2 opacity-90 flex items-center justify-between font-semibold">
            <span>{metrics.totalDrafts} mã / {metrics.totalSessions} phiếu</span>
          </div>
        </div>

        {/* KPI 4: Remaining Payable */}
        <div className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
          darkMode
            ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/40 text-slate-100 shadow-black/50'
            : 'bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 text-white border-rose-600 shadow-rose-900/20'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-lexend font-black uppercase tracking-wider opacity-90">Còn Lại Cần Trả</span>
            <span className="p-2 bg-white/20 rounded-2xl text-xl backdrop-blur-md">🤝</span>
          </div>
          <div className="text-2xl sm:text-3xl font-lexend font-black tracking-tight">{formatVND(metrics.totalRemaining)}</div>
          <div className="text-[11px] mt-2 opacity-90 flex items-center justify-between font-semibold">
            <span>Đơn giá TB: <strong>{formatNumber(metrics.avgPricePerKg)}đ/kg</strong></span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Rice Variety Breakdown */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-lexend font-black text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🌱</span> Phân Bổ Sản Lượng Theo Giống Lúa (HT1, ĐV108...)
            </h3>
            <span className="text-xs font-bold text-amber-700 bg-amber-500/10 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-500/20">
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
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="riceType" tick={{ fontSize: 11, fontFamily: 'Lexend' }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${formatNumber(val)} kg`, 'Sản lượng ròng']}
                    contentStyle={{
                      backgroundColor: darkMode ? '#020617' : '#ffffff',
                      borderColor: '#f59e0b',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontFamily: 'Lexend',
                    }}
                  />
                  <Bar dataKey="netKg" name="Sản lượng (kg)" fill="#f59e0b" radius={[8, 8, 0, 0]}>
                    {riceVarietyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {riceVarietyData.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {riceVarietyData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shadow-xs" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="font-lexend font-bold text-slate-800 dark:text-slate-200">Giống {item.riceType}</span>
                    <span className="text-[10px] text-slate-400">({item.count} phiếu)</span>
                  </div>
                  <div className="text-right font-lexend">
                    <span className="font-black text-amber-700 dark:text-amber-400 mr-3">{formatNumber(item.netKg)} kg</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400">{formatVND(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart 2: Timeline Harvest Progress */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-lexend font-black text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>📅</span> Tiến Độ Cân Lúa Thu Hoạch Theo Ngày
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-500/10 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-500/20">
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
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'Lexend' }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${formatNumber(val)} kg`, 'Sản lượng']}
                    contentStyle={{
                      backgroundColor: darkMode ? '#020617' : '#ffffff',
                      borderColor: '#10b981',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontFamily: 'Lexend',
                    }}
                  />
                  <Line type="monotone" dataKey="netKg" name="Sản lượng (kg)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <span className="text-slate-500 dark:text-slate-400 block mb-0.5 font-semibold">Sản lượng TB / phiếu</span>
              <strong className="text-amber-800 dark:text-amber-300 font-lexend font-black text-base">
                {metrics.totalSessions > 0 ? `${formatNumber(Math.round(metrics.totalNetKg / metrics.totalSessions))} kg` : '0 kg'}
              </strong>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <span className="text-slate-500 dark:text-slate-400 block mb-0.5 font-semibold">Trọng lượng TB / bao</span>
              <strong className="text-emerald-800 dark:text-emerald-300 font-lexend font-black text-base">
                {metrics.totalBags > 0 ? `${(metrics.totalGrossKg / metrics.totalBags).toFixed(1)} kg` : '0 kg'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Top Rankings: Xe Nhận & Cán Bộ Cân */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Trucks */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-lexend font-black text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🚛</span> Top Xe Nhận Lúa HTX Hòa Tiến 2
            </h3>
          </div>

          {topTrucks.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Chưa có dữ liệu xe nhận</p>
          ) : (
            <div className="space-y-2.5">
              {topTrucks.map((truck, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-2xl font-lexend font-black text-xs flex items-center justify-center text-white shadow-sm ${
                      idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-400' : 'bg-slate-700'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-lexend font-bold text-sm text-slate-800 dark:text-slate-100">{truck.name}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold">{truck.count} chuyến lúa</p>
                    </div>
                  </div>

                  <div className="text-right font-lexend">
                    <div className="font-black text-amber-700 dark:text-amber-400 text-base">
                      {formatNumber(truck.totalNetKg)} kg
                    </div>
                    <div className="text-xs text-slate-500 font-bold">{formatVND(truck.totalAmount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Operators */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-lexend font-black text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>👤</span> Top Cán Bộ Cân Tại Các Điểm Cân
            </h3>
          </div>

          {topOperators.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Chưa có dữ liệu cán bộ cân</p>
          ) : (
            <div className="space-y-2.5">
              {topOperators.map((operator, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-2xl font-lexend font-black text-xs flex items-center justify-center text-white shadow-sm ${
                      idx === 0 ? 'bg-emerald-600' : idx === 1 ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-lexend font-bold text-sm text-slate-800 dark:text-slate-100">{operator.name}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold">{operator.count} lượt thực hiện cân</p>
                    </div>
                  </div>

                  <div className="text-right font-lexend">
                    <div className="font-black text-emerald-700 dark:text-emerald-400 text-base">
                      {formatNumber(operator.totalNetKg)} kg
                    </div>
                    <div className="text-xs text-slate-500 font-bold">{formatVND(operator.totalAmount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
