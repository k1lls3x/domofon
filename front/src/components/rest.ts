const BASE_URL = 'http://194.84.56.147:8080';

export interface AuthResponse {
  message: string;
  token?: string;
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
    // Проверка ошибок по маршруту
    if (res.status === 409 && path.includes('request-phone-verification')) {
      throw new Error('Аккаунт с этим номером уже существует');
    }
    if (res.status === 409 && path.includes('register')) {
      // Если в ответе есть конкретика про username — показываем её, иначе общий текст
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
export function register(payload: RegisterPayload): Promise<AuthResponse> {
  // payload = { first_name, last_name, email, phone, password }
  return request<AuthResponse>('/auth/register', payload);
}

// Запросить SMS-код для подтверждения телефона (для регистрации или забыл пароль)
export function requestPhoneVerification(phone: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/request-phone-verification', { phone });
}

// Подтвердить телефон по коду из SMS (используется и в регистрации, и в восстановлении пароля)
export function verifyPhone(phone: string, code: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/verify-phone', { phone, code });
}

// --- Восстановление пароля ---
// 1. Запрос SMS-кода для сброса пароля
export function forgotPassword(phone: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/forgot-password', { phone });
}

// 2. Сбросить пароль после верификации телефона
export function resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/reset-password', { token, newPassword });
}

// --- Смена пароля внутри профиля (по старому паролю, опционально) ---
export function changePassword(phone: string, oldPassword: string, newPassword: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/change-password', { phone, old_password: oldPassword, new_password: newPassword });
}
