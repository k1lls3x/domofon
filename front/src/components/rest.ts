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
    const msg = (data && data.message ? data.message.toLowerCase() : '');

    // Проверка email
    if (msg.includes('email')) {
      throw new Error('Пользователь с этим email уже существует');
    }

    // Проверка username
    if (msg.includes('username') || msg.includes('юзернейм')) {
      throw new Error('Этот username уже занят');
    }

    // Проверка номера телефона (и на регистрацию, и на сброс)
    if (msg.includes('phone') || msg.includes('номер')) {
      throw new Error('Пользователь с этим номером уже существует');
    }
    // Для забыл пароль — если not found, not registered и др.
    if (
      path.includes('forgot') ||
      path.includes('reset') ||
      path.includes('password')
    ) {
      if (
        msg.includes('not found') ||
        msg.includes('не найден') ||
        msg.includes('not registered') ||
        msg.includes('does not exist') ||
        msg.includes('doesn\'t exist')
      ) {
        throw new Error('Данный номер не зарегистрирован');
      }
    }

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
  return request<AuthResponse>('/auth/forgot-password', { phone });
}

// 2. Подтвердить код сброса (тот же verifyPhone)
export { verifyPhone as verifyResetCode };

// 3. Сбросить пароль
export function resetPasswordByPhone(
  phone: string,
  newPassword: string
): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/reset-password', { phone, newPassword });
}


