// ============================================================================
// Projects API - 已禁用云端功能
// ============================================================================
// 为保持代码兼容性，禁用所有 Supabase 云端逻辑
// 如需重新启用云端项目API，请还原此文件
// ============================================================================

// import { supabase } from './supabase'
import type { Project, Script, Shot, Character, Scene, VideoTask, Json } from '../types/supabase'

// =====================================================
// Projects API（本地模式）
// =====================================================

export const projectApi = {
  // 获取用户所有项目
  list: async (): Promise<Project[]> => {
    console.warn('[ProjectAPI] ☁️ 云端项目API已禁用');
    return [];
    /*
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data || []
    */
  },

  // 获取单个项目（含关联数据）
  get: async (id: string) => {
    console.warn('[ProjectAPI] ☁️ 云端项目API已禁用');
    return null;
    /*
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        scripts(
          *,
          shots(
            *,
            characters(*),
            scenes(*)
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
    */
  },

  // 创建项目
  create: async (title: string, description?: string): Promise<Project> => {
    console.warn('[ProjectAPI] ☁️ 云端项目API已禁用');
    throw new Error('云端项目API已禁用');
    /*
    const { data, error } = await supabase
      .from('projects')
      .insert({ title, description })
      .select()
      .single()
    
    if (error) throw error
    */
    return {} as Project;
  },

  // 更新项目
  update: async (id: string, updates: Partial<Project>): Promise<Project> => {
    console.warn('[ProjectAPI] ☁️ 云端项目API已禁用');
    throw new Error('云端项目API已禁用');
    /*
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    */
    return {} as Project;
  },

  // 删除项目
  delete: async (id: string): Promise<void> => {
    console.warn('[ProjectAPI] ☁️ 云端项目API已禁用');
    // 不抛出错误
  }
};
