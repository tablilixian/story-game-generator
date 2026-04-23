// ============================================================================
// 画布云端 API - 已禁用云端功能
// ============================================================================
// 为保持代码兼容性，禁用所有 Supabase 云端逻辑
// 如需重新启用云端画布API，请还原此文件
// ============================================================================

// import { supabase } from '../src/api/supabase';
import { logger, LogCategory } from './logger';

/**
 * 云端画布数据结构
 */
export interface CloudCanvasData {
  projectId: string;
  layers: any[];
  offset: { x: number; y: number };
  scale: number;
  version: number;
  savedAt: number;
}

/**
 * Supabase 返回的原始数据结构
 */
interface SupabaseCanvasData {
  id: string;
  project_id: string;
  layers: any[];
  canvas_offset: { x: number; y: number };
  scale: number;
  version: number;
  saved_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * 画布云端 API（本地模式）
 */
export const canvasCloudApi = {
  /**
   * 获取画布数据
   * 
   * @param projectId 项目 ID
   * @returns 画布数据，如果不存在返回 null
   * @throws 网络错误或权限错误
   */
  async get(projectId: string): Promise<CloudCanvasData | null> {
    logger.warn(LogCategory.CANVAS, `[CanvasCloudApi] ☁️ 云端画布已禁用`);
    return null;
    /*
    logger.debug(LogCategory.CANVAS, `[CanvasCloudApi] 获取云端画布数据，项目: ${projectId}`);
    
    try {
      const { data, error } = await supabase
        .from('canvas_data')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        // PGRST116 表示未找到数据，这是正常情况
        if (error.code === 'PGRST116') {
          logger.debug(LogCategory.CANVAS, `[CanvasCloudApi] 云端无画布数据，项目: ${projectId}`);
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      const result: SupabaseCanvasData = data;
      
      logger.debug(LogCategory.CANVAS, `[CanvasCloudApi] 获取成功，项目: ${projectId}, 版本: ${result.version}`);
      
      return {
        projectId: result.project_id,
        layers: result.layers || [],
        offset: result.canvas_offset || { x: 0, y: 0 },
        scale: result.scale || 1,
        version: result.version || 1,
        savedAt: new Date(result.saved_at).getTime(),
      };
    } catch (error) {
      logger.error(LogCategory.CANVAS, `[CanvasCloudApi] 获取失败:`, error);
      throw error;
    }
    */
  },

  /**
   * 保存画布数据（upsert）
   * 
   * @param data 画布数据
   * @throws 网络错误或权限错误
   */
  async save(data: CloudCanvasData): Promise<void> {
    logger.warn(LogCategory.CANVAS, `[CanvasCloudApi] ☁️ 云端画布已禁用`);
    // 不抛出错误，静默失败
    /*
    logger.debug(LogCategory.CANVAS, `[CanvasCloudApi] 保存到云端，项目: ${data.projectId}, 版本: ${data.version}`);
    
    try {
      const { error } = await supabase
        .from('canvas_data')
        .upsert({
          project_id: data.projectId,
          layers: data.layers,
          canvas_offset: data.offset,
          scale: data.scale,
          version: data.version,
          saved_at: new Date(data.savedAt).toISOString(),
        }, {
          onConflict: 'project_id',
        });

      if (error) {
        throw error;
      }

      logger.debug(LogCategory.CANVAS, `[CanvasCloudApi] 保存成功，项目: ${data.projectId}`);
    } catch (error) {
      logger.error(LogCategory.CANVAS, `[CanvasCloudApi] 保存失败:`, error);
      throw error;
    }
    */
  },

  /**
   * 删除画布数据
   * 
   * @param projectId 项目 ID
   */
  async delete(projectId: string): Promise<void> {
    logger.warn(LogCategory.CANVAS, `[CanvasCloudApi] ☁️ 云端画布已禁用`);
    // 不抛出错误
    /*
    logger.debug(LogCategory.CANVAS, `[CanvasCloudApi] 删除云端画布数据，项目: ${projectId}`);
    
    try {
      const { error } = await supabase
        .from('canvas_data')
        .delete()
        .eq('project_id', projectId);

      if (error) {
        throw error;
      }

      logger.debug(LogCategory.CANVAS, `[CanvasCloudApi] 删除成功，项目: ${projectId}`);
    } catch (error) {
      logger.error(LogCategory.CANVAS, `[CanvasCloudApi] 删除失败:`, error);
      throw error;
    }
    */
  }
};
