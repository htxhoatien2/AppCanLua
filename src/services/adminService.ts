import { AdminConfig, RiceVariety } from '../types';
import { HTX_INFO, POPULAR_RICE_VARIETIES, HOA_TIEN_LOCATIONS, SAMPLE_TRUCKS, SAMPLE_OPERATORS } from '../data/riceData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ADMIN_CONFIG_KEY = 'htx_hoatien2_admin_config_v1';

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  htxInfo: HTX_INFO,
  varieties: POPULAR_RICE_VARIETIES,
  locations: HOA_TIEN_LOCATIONS,
  trucks: SAMPLE_TRUCKS,
  operators: SAMPLE_OPERATORS,
};

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
