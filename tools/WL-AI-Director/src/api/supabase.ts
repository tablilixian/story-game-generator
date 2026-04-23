// ============================================================================
// Supabase 客户端 - 已禁用云端功能
// ============================================================================
// 为保持代码兼容性，导出空对象
// 如需重新启用云端功能，请还原此文件
// ============================================================================

/*
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to get client with custom auth
export const getSupabaseClient = (accessToken?: string) => {
  if (!accessToken) return supabase
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}
*/

// 空实现 - 用于本地模式（不连接云端）
export const supabase = null;

export const getSupabaseClient = (accessToken?: string) => {
  console.warn('[Supabase] 云端功能已禁用，如需启用请还原 supabase.ts');
  return null;
};
