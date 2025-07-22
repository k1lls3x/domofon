const BASE_URL = 'http://194.84.56.147:8080';

export interface AuthResponse {
  message: string;
  token?: string;
}

async function request<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error((data && data.message) || 'Ошибка');
  }
  return data as T;
}

// --- Авторизация ---
export function login(phone: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { phone, password });
}

// --- Смена пароля внутри профиля ---
export function changePassword(
  phone: string,
  oldPassword: string,
  newPassword: string
): Promise<AuthResponse> {
  return request<AuthResponse>(
    '/auth/change-password',
    { phone, old_password: oldPassword, new_password: newPassword }
  );
}

// --- Регистрация (отдельный поток) ---

// 1. Запросить код для регистрации на свободный номер
export function requestRegistrationCode(phone: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/request-registration-code', { phone });
}

// 2. Подтвердить код регистрации
export function verifyPhone(phone: string, code: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/verify-phone', { phone, code });
}

// 3. Завершить регистрацию — создать нового пользователя
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

// --- Сброс пароля (три шага) ---

// 1. Запросить код для сброса на существующий номер
export function requestPasswordResetCode(phone: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/request-phone-verification', { phone });
}

// 2. Подтвердить код сброса (тот же verifyPhone)
export { verifyPhone as verifyResetCode }

// 3. Сбросить пароль
export function resetPasswordByPhone(
  phone: string,
  newPassword: string
): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/reset-password', { phone, newPassword });
}
