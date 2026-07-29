import { WeighingSession } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateTotals } from '../utils/formatters';

const STORAGE_KEY = 'rice_weighing_history_v2';

export function getLocalSessions(): WeighingSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Lỗi đọc LocalStorage:', e);
    return [];
  }
}

export function saveLocalSessions(sessions: WeighingSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Lỗi ghi LocalStorage:', e);
  }
}

function mapRowToSession(row: any): WeighingSession {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    operatorName: row.operator_name || 'Phạm Công Tuân',
    farmerName: row.farmer_name || '',
    farmerPhone: row.farmer_phone || '',
    truckInfo: row.truck_info || row.buyer_name || 'Xe HTX',
    truckPhone: row.truck_phone || row.buyer_phone || '',
    location: row.location || 'Đồng ruộng HTX Hòa Tiến 2',
    riceType: row.rice_type || 'HT1',
    unitPrice: Number(row.unit_price) || 0,

    tareType: row.tare_type || 'per_bag',
    tarePerBag: Number(row.tare_per_bag) || 0,
    tareFixedTotal: row.tare_fixed_total ? Number(row.tare_fixed_total) : undefined,

    impurityType: row.impurity_type || 'percent',
    impurityPercent: Number(row.impurity_percent) || 0,
    impurityFixedKg: row.impurity_fixed_kg ? Number(row.impurity_fixed_kg) : undefined,
    moisturePercent: row.moisture_percent ? Number(row.moisture_percent) : undefined,

    deposit: Number(row.deposit) || 0,
    date: row.date || new Date().toISOString().split('T')[0],
    note: row.note || '',
    bagWeights: Array.isArray(row.bag_weights) ? row.bag_weights : [],
    calculated: row.calculated || calculateTotals(row.bag_weights || [], row),
    createdAt: row.created_at ? new Date(row.created_at).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN'),
    areaSize: row.area_size ? Number(row.area_size) : undefined,
    areaUnit: row.area_unit || 'sao_trung_bo',
  };
}

function mapSessionToRow(session: WeighingSession): any {
  return {
    id: session.id,
    user_id: session.userId || null,
    operator_name: session.operatorName,
    farmer_name: session.farmerName,
    farmer_phone: session.farmerPhone || null,
    truck_info: session.truckInfo,
    truck_phone: session.truckPhone || null,
    location: session.location || null,
    rice_type: session.riceType,
    unit_price: session.unitPrice,

    tare_type: session.tareType,
    tare_per_bag: session.tarePerBag,
    tare_fixed_total: session.tareFixedTotal || null,

    impurity_type: session.impurityType,
    impurity_percent: session.impurityPercent,
    impurity_fixed_kg: session.impurityFixedKg || null,
    moisture_percent: session.moisturePercent || null,

    deposit: session.deposit,
    date: session.date,
    note: session.note || null,
    bag_weights: session.bagWeights,
    calculated: session.calculated || calculateTotals(session.bagWeights, session),
    area_size: session.areaSize || null,
    area_unit: session.areaUnit || 'sao_trung_bo',
  };
}

/**
 * Fetch all sessions (Supabase Cloud + LocalStorage Fallback)
 * Filter by userId if specified
 */
export async function fetchSessions(filterUserId?: string): Promise<{ sessions: WeighingSession[]; isCloud: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('weighing_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterUserId) {
        query = query.eq('user_id', filterUserId);
      }

      const { data, error } = await query;

      if (!error && data) {
        const cloudSessions = data.map(mapRowToSession);
        saveLocalSessions(cloudSessions);
        return { sessions: cloudSessions, isCloud: true };
      } else {
        console.warn('Lỗi Supabase, chuyển sang dùng LocalStorage:', error?.message);
      }
    } catch (e) {
      console.error('Không thể kết nối Supabase:', e);
    }
  }

  let local = getLocalSessions();
  if (filterUserId) {
    local = local.filter((s) => !s.userId || s.userId === filterUserId);
  }
  return { sessions: local, isCloud: false };
}

/**
 * Save or Update a weighing session
 */
export async function saveSession(session: WeighingSession): Promise<{ success: boolean; isCloud: boolean }> {
  const localHistory = getLocalSessions();
  const existingIdx = localHistory.findIndex((s) => s.id === session.id);
  let updatedLocal: WeighingSession[] = [];

  if (existingIdx >= 0) {
    updatedLocal = [...localHistory];
    updatedLocal[existingIdx] = session;
  } else {
    updatedLocal = [session, ...localHistory];
  }
  saveLocalSessions(updatedLocal);

  if (isSupabaseConfigured && supabase) {
    try {
      const dbRow = mapSessionToRow(session);
      const { error } = await supabase
        .from('weighing_sessions')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.error('Lỗi khi lưu Supabase:', error.message);
        return { success: true, isCloud: false };
      }
      return { success: true, isCloud: true };
    } catch (e) {
      console.error('Supabase Exception:', e);
    }
  }

  return { success: true, isCloud: false };
}

/**
 * Delete a weighing session
 */
export async function deleteSession(id: string): Promise<{ success: boolean; isCloud: boolean }> {
  const localHistory = getLocalSessions().filter((s) => s.id !== id);
  saveLocalSessions(localHistory);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('weighing_sessions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Lỗi xóa Supabase:', error.message);
        return { success: true, isCloud: false };
      }
      return { success: true, isCloud: true };
    } catch (e) {
      console.error('Supabase Delete Error:', e);
    }
  }

  return { success: true, isCloud: false };
}
