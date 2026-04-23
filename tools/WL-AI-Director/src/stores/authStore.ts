// ============================================================================
// 认证 Store - 已禁用云端认证功能
// ============================================================================
// 为保持代码兼容性，禁用所有 Supabase 认证逻辑
// 如需重新启用云端认证，请还原此文件
// ============================================================================

import { create } from 'zustand'
/*
import { supabase } from '../api/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types/supabase'
*/

// 本地模式下的空类型定义
interface LocalUser {
  id: string;
  email: string;
}

interface LocalProfile {
  id: string;
  email: string;
}

interface LocalSession {
  access_token: string;
  user: LocalUser;
}

interface AuthState {
  user: LocalUser | null;
  profile: LocalProfile | null;
  session: LocalSession | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<LocalProfile>) => Promise<void>;
  clearError: () => void;
}

// 创建本地虚拟用户（用于本地模式）
const createLocalUser = (): LocalUser => ({
  id: 'local-user-' + Date.now(),
  email: 'local@example.com'
});

const createLocalProfile = (user: LocalUser): LocalProfile => ({
  id: user.id,
  email: user.email
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: false,
  error: null,
  
  initialize: async () => {
    // 本地模式：直接使用本地用户，无需认证
    console.log('[AuthStore] 本地模式：跳过云端认证');
    
    // 创建本地虚拟用户
    const localUser = createLocalUser();
    const localProfile = createLocalProfile(localUser);
    
    set({
      user: localUser,
      profile: localProfile,
      session: { access_token: 'local-token', user: localUser },
      loading: false,
      error: null
    });
  },
  
  signIn: async (email: string, password: string) => {
    // 本地模式：模拟登录成功
    console.log('[AuthStore] 本地模式：模拟登录');
    
    const localUser = createLocalUser();
    localUser.email = email;
    const localProfile = createLocalProfile(localUser);
    
    set({
      user: localUser,
      profile: localProfile,
      session: { access_token: 'local-token', user: localUser },
      loading: false,
      error: null
    });
  },
  
  signUp: async (email: string, password: string) => {
    // 本地模式：模拟注册成功
    console.log('[AuthStore] 本地模式：模拟注册');
    
    const localUser = createLocalUser();
    localUser.email = email;
    const localProfile = createLocalProfile(localUser);
    
    set({
      user: localUser,
      profile: localProfile,
      session: { access_token: 'local-token', user: localUser },
      loading: false,
      error: null
    });
  },
  
  signOut: async () => {
    // 本地模式：模拟登出
    console.log('[AuthStore] 本地模式：模拟登出');
    
    // 创建新的本地虚拟用户，保持登录状态
    const localUser = createLocalUser();
    const localProfile = createLocalProfile(localUser);
    
    set({
      user: localUser,
      profile: localProfile,
      session: { access_token: 'local-token', user: localUser },
      loading: false,
      error: null
    });
  },
  
  updateProfile: async (updates: Partial<LocalProfile>) => {
    const { profile } = get();
    if (!profile) return;
    
    // 本地模式：直接更新本地 profile
    set({
      profile: { ...profile, ...updates }
    });
  },
  
  clearError: () => set({ error: null })
}));

/*
// 以下是原 Supabase 认证逻辑，已注释掉

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,
  
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        set({ 
          session, 
          user: session.user, 
          profile,
          loading: false 
        })
      } else {
        set({ session: null, user: null, profile: null, loading: false })
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          set({ session, user: session.user, profile })
          
          // 登录成功后同步资产库
          setTimeout(() => {
            import('../../services/hybridStorageService').then(({ hybridStorage }) => {
              hybridStorage.getAllAssetLibraryItems().then((items) => {
                console.log(`[Auth] Auth state change 资产库同步完成: ${items.length} 个资产`)
              }).catch(console.error)
            }).catch(console.error)
          }, 100)
        } else {
          set({ session: null, user: null, profile: null })
        }
      })
    } catch (error) {
      console.error('Auth init error:', error)
      set({ loading: false, error: 'Failed to initialize auth' })
    }
  },
  
  signIn: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        set({ 
          user: data.user, 
          session: data.session, 
          profile,
          loading: false 
        })
        
        // 登录成功后触发云端双向同步
        setTimeout(() => {
          import('../../services/hybridStorageService').then(({ syncFromCloud, hybridStorage }) => {
            // 同步项目
            syncFromCloud().then((result: { uploaded: number; downloaded: number; conflicts: number }) => {
              console.log(`[Auth] 登录双向同步完成: 上传 ${result.uploaded}, 下载 ${result.downloaded}, 冲突 ${result.conflicts}`)
              if (result.uploaded > 0 || result.downloaded > 0) {
                window.dispatchEvent(new CustomEvent('projects-synced'))
              }
            }).catch(console.error)
            
            // 同步资产库
            hybridStorage.getAllAssetLibraryItems().then((items) => {
              console.log(`[Auth] 登录后资产库同步完成: ${items.length} 个资产`)
            }).catch(console.error)
          }).catch(console.error)
        }, 100)
      }
    } catch (error: any) {
      set({ loading: false, error: error.message })
      throw error
    }
  },
  
  signUp: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email
          }
        }
      })
      
      if (error) throw error
      
      // Auto sign in after signup (if email confirmation is disabled)
      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user?.id)
          .single()
        
        set({ 
          user: data.user, 
          session: data.session, 
          profile,
          loading: false 
        })
      } else {
        set({ loading: false })
      }
    } catch (error: any) {
      set({ loading: false, error: error.message })
      throw error
    }
  },
  
  signOut: async () => {
    set({ loading: true })
    try {
      await supabase.auth.signOut()
      set({ user: null, session: null, profile: null, loading: false })
    } catch (error: any) {
      set({ loading: false, error: error.message })
    }
  },
  
  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return
    
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      
      set({ profile: data, loading: false })
    } catch (error: any) {
      set({ loading: false, error: error.message })
      throw error
    }
  },
  
  clearError: () => set({ error: null })
}))
*/
