// ============================================================================
// Storage API - 已禁用云端功能
// ============================================================================
// 为保持代码兼容性，禁用所有 Supabase 云端存储逻辑
// 如需重新启用云端存储，请还原此文件
// ============================================================================

// import { supabase } from './supabase'

type BucketName = 'avatars' | 'projects' | 'videos'

// =====================================================
// Storage API（本地模式）
// =====================================================

export const storageApi = {
  // 上传图片
  uploadImage: async (
    userId: string, 
    file: File, 
    options: {
      bucket?: BucketName
      path: string
    }
  ): Promise<string> => {
    console.warn('[StorageAPI] ☁️ 云端存储已禁用');
    throw new Error('云端存储已禁用，请使用本地存储');
    /*
    const { bucket = 'projects', path } = options
    const filePath = `users/${userId}/${path}/${file.name}`
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type
      })
    
    if (error) throw error
    
    // 获取公开 URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return publicUrl
    */
  },

  // 上传视频
  uploadVideo: async (
    userId: string, 
    file: File, 
    shotId: string
  ): Promise<string> => {
    console.warn('[StorageAPI] ☁️ 云端存储已禁用');
    throw new Error('云端存储已禁用，请使用本地存储');
    /*
    const filePath = `users/${userId}/videos/${shotId}/${file.name}`
    
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type
      })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)
    
    return publicUrl
    */
  },

  // 删除文件
  delete: async (url: string, bucket: BucketName = 'projects'): Promise<void> => {
    console.warn('[StorageAPI] ☁️ 云端存储已禁用');
    // 不抛出错误
    /*
    // 从 URL 提取路径
    const path = url.split(`/storage/v1/object/public/${bucket}/`)[1]
    if (!path) return
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
    */
  },

  // 获取公开 URL
  getPublicUrl: (path: string, bucket: BucketName = 'projects'): string => {
    // 本地模式返回空字符串
    console.warn('[StorageAPI] ☁️ 云端存储已禁用');
    return '';
    /*
    return supabase.storage
      .from(bucket)
      .getPublicUrl(path).data.publicUrl
    */
  }
};
