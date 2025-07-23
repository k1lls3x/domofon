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

// --- Получение всех пользователей ---
export function getUsers(): Promise<User[]> {
  return fetch(`${BASE_URL}/users`)
    .then(res => {
      if (!res.ok) throw new Error('Ошибка при загрузке пользователей');
      return res.json();
    });
}

// --- Основная функция запроса с обработкой ошибок ---
async function request<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data: any = {};
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    // Всегда используем message с бэка, если есть, иначе дефолтное
    const error: any = new Error(data.message || `Ошибка ${res.status}`);
    error.status = res.status;
    error.serverMessage = data.message;
    error.body = data;
    throw error;
  }

  return data as T;
}

// --- Авторизация ---
export function login(phone: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { phone, password });
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

// --- Функция для UI: просто возвращает message с бэка или fallback ---
export function mapError(error: any): string {
  // Показываем сообщение только с бэка, если оно есть
  return error?.serverMessage || error?.message || 'Произошла неизвестная ошибка';
}
