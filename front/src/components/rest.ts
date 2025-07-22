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
    // Общая обработка ошибок
    if (res.status === 409 && path.includes('request-phone-verification')) {
      throw new Error('Аккаунт с этим номером уже существует');
    }
    if (res.status === 409 && path.includes('register')) {
      if (data?.message && data.message.toLowerCase().includes('username')) {
        throw new Error('Этот username уже занят');
      }
      throw new Error('Такой username или номер телефона уже используется');
    }
    throw new Error((data && data.message) || 'Ошибка');
  }
  return data as T;
}

// --- Авторизация ---
export function login(phone: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { phone, password });
}

// --- Регистрация ---
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

// --- Трёхшаговый сброс пароля ---

// 1. Запросить SMS-код для подтверждения телефона (регистрация или сброс)
export function requestPhoneVerification(phone: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/request-phone-verification', { phone });
}

// 2. Подтвердить телефон кодом из SMS
export function verifyPhone(phone: string, code: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/verify-phone', { phone, code });
}

// 3. Сбросить пароль после подтверждения телефона
export function resetPasswordByPhone(phone: string, newPassword: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/reset-password', { phone, newPassword });
}

// --- Смена пароля внутри профиля ---
export function changePassword(phone: string, oldPassword: string, newPassword: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/change-password', { phone, old_password: oldPassword, new_password: newPassword });
}
