import { writable } from 'svelte/store';
import { getApi, postApi } from './netio';

interface AuthData {
  status: number; // -1未验证  0验证中   1已验证
  data: Record<string, any> | null; // 登录后返回的用户信息
  lastRefreshedAt: number | null; // 登录时间，13位毫秒时间戳
  token: string | null; // 登录后的token
}

export const auth = writable<AuthData>({
  status: -1, // 初始状态为未验证
  data: null,
  lastRefreshedAt: null,
  token: null
});

export const signUp = async (username: string, password: string) => {
  // 模拟注册逻辑
  auth.update((state) => ({
    ...state,
    status: 0 // 注册后进入验证中状态
  }));

  try {
    // 在这里发送注册请求
    // const response = await fetch('/api/signup', { method: 'POST', body: JSON.stringify({ username, password }) });
    // const result = await response.json();
    const result = { token: 'dummyToken', data: { username }, lastRefreshedAt: Date.now() }; // 模拟返回
    auth.set({
      status: 1,
      data: result.data,
      lastRefreshedAt: result.lastRefreshedAt,
      token: result.token
    });
  } catch (error) {
    console.error('Sign up failed:', error);
    auth.update((state) => ({ ...state, status: -1 }));
  }
};

export const signIn = async (username: string, password: string) => {
  auth.update((state) => ({
    ...state,
    status: 0 // 登录时进入验证中状态
  }));

  try {
    // 在这里发送登录请求
    // const response = await fetch('/api/signin', { method: 'POST', body: JSON.stringify({ username, password }) });
    // const result = await response.json();
    const result = { token: 'dummyToken', data: { username }, lastRefreshedAt: Date.now() }; // 模拟返回
    auth.set({
      status: 1,
      data: result.data,
      lastRefreshedAt: result.lastRefreshedAt,
      token: result.token
    });
  } catch (error) {
    console.error('Sign in failed:', error);
    auth.update((state) => ({ ...state, status: -1 }));
  }
};

export const signOut = () => {
  auth.set({
    status: -1,
    data: null,
    lastRefreshedAt: null,
    token: null
  });
};

export const refresh = async () => {
  try {
    // 在这里发送刷新请求
    // const response = await fetch('/api/refresh', { method: 'POST', headers: { Authorization: `Bearer ${auth.token}` } });
    // const result = await response.json();
    const result = { token: 'newDummyToken', lastRefreshedAt: Date.now() }; // 模拟返回
    auth.update((state) => ({
      ...state,
      token: result.token,
      lastRefreshedAt: result.lastRefreshedAt
    }));
  } catch (error) {
    console.error('Token refresh failed:', error);
    auth.update((state) => ({ ...state, status: -1 }));
  }
};
