import { WeighingSession } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateTotals } from '../utils/formatters';

const STORAGE_KEY = 'rice_weighing_history_v2';

// LocalStorage helpers
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

// Convert DB Row -> WeighingSession object
function mapRowToSession(row: any): WeighingSession {
  return {
    id: row.id,
    farmerName: row.farmer_name || '',
    farmerPhone: row.farmer_phone || '',
    buyerName: row.buyer_name || '',
    buyerPhone: row.buyer_phone || '',
    location: row.location || '',
    riceType: row.rice_type || 'OM 5451',
    unitPrice: Number(row.unit_price) || 0,
    tarePerBag: Number(row.tare_per_bag) || 0,
    impurityPercent: Number(row.impurity_percent) || 0,
    deposit: Number(row.deposit) || 0,
    date: row.date || new Date().toISOString().split('T')[0],
    note: row.note || '',
    bagWeights: Array.isArray(row.bag_weights) ? row.bag_weights : [],
    calculated: row.calculated || calculateTotals(row.bag_weights || [], row),
    createdAt: row.created_at ? new Date(row.created_at).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN'),
    areaSize: row.area_size ? Number(row.area_size) : undefined,
    areaUnit: row.area_unit || undefined,
  };
}

// Convert WeighingSession -> DB Row object
function mapSessionToRow(session: WeighingSession): any {
  return {
    id: session.id,
    farmer_name: session.farmerName,
    farmer_phone: session.farmerPhone || null,
    buyer_name: session.buyerName,
    buyer_phone: session.buyerPhone || null,
    location: session.location || null,
    rice_type: session.riceType,
    unit_price: session.unitPrice,
    tare_per_bag: session.tarePerBag,
    impurity_percent: session.impurityPercent,
    deposit: session.deposit,
    date: session.date,
    note: session.note || null,
    bag_weights: session.bagWeights,
    calculated: session.calculated || calculateTotals(session.bagWeights, session),
    area_size: session.areaSize || null,
    area_unit: session.areaUnit || null,
  };
}

/**
 * Fetch all sessions (Supabase Cloud + LocalStorage Fallback)
 */
export async function fetchSessions(): Promise<{ sessions: WeighingSession[]; isCloud: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('weighing_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const cloudSessions = data.map(mapRowToSession);
        // Sync cloud to local for offline backup
        saveLocalSessions(cloudSessions);
        return { sessions: cloudSessions, isCloud: true };
      } else {
        console.warn('Lỗi Supabase, chuyển sang dùng LocalStorage:', error?.message);
      }
    } catch (e) {
      console.error('Không thể kết nối Supabase:', e);
    }
  }

  return { sessions: getLocalSessions(), isCloud: false };
}

/**
 * Save or Update a weighing session
 */
export async function saveSession(session: WeighingSession): Promise<{ success: boolean; isCloud: boolean }> {
  // Update LocalStorage immediately
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

  // Sync to Supabase Cloud if configured
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
  // Delete from LocalStorage
  const localHistory = getLocalSessions().filter((s) => s.id !== id);
  saveLocalSessions(localHistory);

  // Delete from Supabase Cloud
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
