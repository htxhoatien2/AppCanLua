import { AdminConfig, User, WeighingSession } from '../types';
import { HTX_INFO, POPULAR_RICE_VARIETIES, HOA_TIEN_LOCATIONS, SAMPLE_TRUCKS, SAMPLE_OPERATORS } from '../data/riceData';
import { getLocalSessions, saveLocalSessions } from './sessionService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ADMIN_CONFIG_KEY = 'htx_hoatien2_admin_config_v1';
const ADMIN_USERS_KEY = 'htx_hoatien2_admin_users_v1';

export const DEFAULT_USERS: User[] = [
  { id: 'pham_cong_tuan', username: 'pham_cong_tuan', fullName: 'Phạm Công Tuân', role: 'admin', phone: '0916199945' },
  { id: 'can_bo_1', username: 'can_bo_1', fullName: 'Nguyễn Văn A (Điểm Gò Tháp)', role: 'operator', phone: '0913000001' },
  { id: 'can_bo_2', username: 'can_bo_2', fullName: 'Trần Văn B (Điểm Cửa Kho)', role: 'operator', phone: '0913000002' },
];

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  htxInfo: HTX_INFO,
  varieties: POPULAR_RICE_VARIETIES,
  locations: HOA_TIEN_LOCATIONS,
  trucks: SAMPLE_TRUCKS,
  operators: SAMPLE_OPERATORS,
};

// --- Config Management ---
export function getLocalAdminConfig(): AdminConfig {
  try {
    const stored = localStorage.getItem(ADMIN_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        htxInfo: parsed.htxInfo || HTX_INFO,
        varieties: parsed.varieties || POPULAR_RICE_VARIETIES,
        locations: parsed.locations || HOA_TIEN_LOCATIONS,
        trucks: parsed.trucks || SAMPLE_TRUCKS,
        operators: parsed.operators || SAMPLE_OPERATORS,
      };
    }
  } catch (e) {
    console.error('Lỗi đọc cấu hình Admin:', e);
  }
  return DEFAULT_ADMIN_CONFIG;
}

export function saveLocalAdminConfig(config: AdminConfig): void {
  try {
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Lỗi ghi cấu hình Admin:', e);
  }
}

export async function fetchAdminConfig(): Promise<AdminConfig> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('*')
        .eq('id', 'default_config')
        .single();

      if (!error && data && data.config_json) {
        saveLocalAdminConfig(data.config_json);
        return data.config_json;
      }
    } catch (e) {
      console.warn('Lỗi đọc Supabase Admin Config, dùng LocalConfig:', e);
    }
  }
  return getLocalAdminConfig();
}

export async function saveAdminConfig(config: AdminConfig): Promise<boolean> {
  saveLocalAdminConfig(config);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('admin_config')
        .upsert({ id: 'default_config', config_json: config, updated_at: new Date().toISOString() });

      if (error) {
        console.error('Lỗi lưu Supabase Admin Config:', error.message);
      }
    } catch (e) {
      console.error('Supabase save error:', e);
    }
  }
  return true;
}

// --- Users Management ---
export function getLocalUsers(): User[] {
  try {
    const stored = localStorage.getItem(ADMIN_USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Lỗi đọc Users:', e);
  }
  return DEFAULT_USERS;
}

export function saveLocalUsers(users: User[]): void {
  try {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Lỗi ghi Users:', e);
  }
}

// --- Backup & Restore Payload ---
export interface BackupPayload {
  version: string;
  timestamp: string;
  htx: string;
  config: AdminConfig;
  users: User[];
  sessions: WeighingSession[];
}

export function createBackupPayload(): BackupPayload {
  return {
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    htx: HTX_INFO.name,
    config: getLocalAdminConfig(),
    users: getLocalUsers(),
    sessions: getLocalSessions(),
  };
}

export function restoreBackupPayload(payload: BackupPayload, merge: boolean = true): { success: boolean; sessionCount: number } {
  if (!payload || !payload.version) {
    throw new Error('Định dạng file sao lưu không hợp lệ!');
  }

  if (payload.config) {
    saveLocalAdminConfig(payload.config);
  }
  if (payload.users && Array.isArray(payload.users)) {
    saveLocalUsers(payload.users);
  }

  const existingSessions = getLocalSessions();
  let finalSessions: WeighingSession[] = [];

  if (merge) {
    const sessionMap = new Map<string, WeighingSession>();
    existingSessions.forEach((s) => sessionMap.set(s.id, s));
    (payload.sessions || []).forEach((s) => sessionMap.set(s.id, s));
    finalSessions = Array.from(sessionMap.values());
  } else {
    finalSessions = payload.sessions || [];
  }

  saveLocalSessions(finalSessions);
  return { success: true, sessionCount: finalSessions.length };
}
