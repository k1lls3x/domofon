// /src/rest.ts
const BASE_URL = 'http://a7b7aa3ee7.vps.myjino.ru:49217';

export interface AuthResponse {
  message: string;
  token?: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

async function request<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Считаем, что сервер отдаёт { message: string }
    throw new Error((data as any).message || `Ошибка ${res.status}`);
  }
  return data as T;
}

export function login(phone: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { phone, password });
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', payload);
}

export function forgotPassword(phone: string): Promise<AuthResponse> {
  // на вашем бэке маршрут называется /auth/forgot-password
  return request<AuthResponse>('/auth/forgot-password', { phone });
}
