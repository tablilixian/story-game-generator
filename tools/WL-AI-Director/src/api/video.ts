// ============================================================================
// Video API - 已禁用云端功能
// ============================================================================
// 为保持代码兼容性，禁用所有 Supabase 云端视频API逻辑
// 如需重新启用云端视频API，请还原此文件
// ============================================================================

// import { supabase } from './supabase'

const VERCEL_FUNCTION_URL = import.meta.env.VITE_VERCEL_FUNCTION_URL || ''

type GenerateVideoRequest = {
  shotId: string
  model: string
  prompt: string
  startFrameUrl?: string
  endFrameUrl?: string
  [key: string]: unknown
}


interface VideoStatusResponse {
  shotId: string
  status: string
  videoUrl: string | null
  taskId: string | null
}

// 获取当前用户的访问令牌
const getAccessToken = async (): Promise<string> => {
  // 本地模式返回空令牌
  console.warn('[VideoAPI] ☁️ 云端视频API已禁用');
  return 'local-token';
  /*
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  return session.access_token
  */
}

// 调用 Edge Function
const callEdgeFunction = async (
  functionName: string, 
  body?: Record<string, unknown>
): Promise<Response> => {
  console.warn('[VideoAPI] ☁️ 云端视频API已禁用');
  throw new Error('云端视频API已禁用');
  /*
  const accessToken = await getAccessToken()
  
  const response = await fetch(
    `${VERCEL_FUNCTION_URL}/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: body ? JSON.stringify(body) : undefined
    }
  )
  
  return response
  */
}

// ============================================================================
// Video API - 已禁用
// ============================================================================

export const videoApi = {
  // 生成视频
  generateVideo: async (request: GenerateVideoRequest): Promise<{ taskId: string }> => {
    console.warn('[VideoAPI] ☁️ 云端视频生成已禁用');
    throw new Error('云端视频生成已禁用');
    /*
    const response = await callEdgeFunction('generate-video', request)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to generate video')
    }
    
    const data = await response.json()
    return { taskId: data.taskId }
    */
    return { taskId: '' };
  },

  // 获取视频生成状态
  getVideoStatus: async (shotId: string): Promise<VideoStatusResponse> => {
    console.warn('[VideoAPI] ☁️ 云端视频API已禁用');
    return {
      shotId,
      status: 'local_mode',
      videoUrl: null,
      taskId: null
    };
    /*
    const response = await callEdgeFunction('get-video-status', { shotId })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get video status')
    }
    
    return response.json()
    */
  },

  // 取消视频生成
  cancelVideoGeneration: async (taskId: string): Promise<void> => {
    console.warn('[VideoAPI] ☁️ 云端视频API已禁用');
    // 不抛出错误
  }
};
