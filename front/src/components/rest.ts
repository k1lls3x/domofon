import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://194.84.56.147:8080';

export interface AuthResponse {
  message: string;
  token?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  // другие поля при необходимости
}

// --- Сохраняем токены ---
export async function saveTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.setItem('access_token', accessToken);
  await AsyncStorage.setItem('refresh_token', refreshToken);
}

// --- Получаем токены ---
export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem('access_token');
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem('refresh_token');
}

// --- Основная функция запроса с добавлением access токена и автоматическим обновлением ---
export async function authFetch(path: string, options: RequestInit = {}) {
  let token = await getAccessToken();

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // access токен истёк, пытаемся обновить
    try {
      await refreshToken();
      token = await getAccessToken();
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: { ...(options.headers || {}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      return retryRes;
    } catch {
      // обновить токен не удалось, пробрасываем ошибку
      throw new Error('Unauthorized');
    }
  }
  return res;
}

// --- Получение всех пользователей через authFetch ---
export async function getUsers(): Promise<User[]> {
  const res = await authFetch('/users', { method: 'GET' });
  if (!res.ok) throw new Error('Ошибка при загрузке пользователей');
  return res.json();
}

// --- Проверка email на уникальность ---
export async function checkEmail(email: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/auth/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  let data: any = {};
  let text: string = '';
  try {
    text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (res.status === 409 || res.status === 400) {
    return true; // E-mail уже занят
  }
  if (res.ok) return false; // E-mail свободен

  const message =
    (typeof data === 'object' && data && data.message) ? data.message :
    text ? text :
    `Ошибка ${res.status}`;
  throw new Error(message);
}

// --- Универсальная POST функция ---
async function request<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data: any = {};
  let text: string = '';
  try {
    text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message =
      (typeof data === 'object' && data && data.message) ? data.message :
      text ? text :
      `Ошибка ${res.status}`;
    const error: any = new Error(message);
    error.status = res.status;
    error.serverMessage = message;
    error.body = data;
    throw error;
  }

  return data as T;
}

// --- Авторизация (login) с сохранением токенов ---
export async function login(phone: string, password: string) {
  const resp = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(errorText || 'Auth failed');
  }
  const data = await resp.json();

  if (data.access_token && data.refresh_token) {
    await saveTokens(data.access_token, data.refresh_token);
  }

  return data;
}

// --- Регистрация ---
export function requestRegistrationCode(phone: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/request-registration-code', { phone });
}

export function verifyPhone(phone: string, code: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/verify-phone', { phone, code });
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  phone: string;
  role: string;
  first_name: string;
  last_name: string;
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', payload);
}

// --- Сброс пароля ---
export function requestPasswordResetCode(phone: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/forgot-password', { phone });
}

export { verifyPhone as verifyResetCode };

export function resetPasswordByPhone(
  phone: string,
  newPassword: string
): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/reset-password', { phone, newPassword });
}

// --- Обновление access и refresh токенов ---
export async function refreshToken() {
  const refresh = await getRefreshToken();
  if (!refresh) {
    throw new Error('Refresh token not found');
  }
  const resp = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!resp.ok) {
    throw new Error('Refresh failed');
  }
  const data = await resp.json();
  if (data.access_token && data.refresh_token) {
    await saveTokens(data.access_token, data.refresh_token);
  }
  return data;
}

// --- Функция для UI: возвращает message с бэка или fallback ---
export function mapError(error: any): string {
  return error?.serverMessage || error?.message || 'Произошла неизвестная ошибка';
}
