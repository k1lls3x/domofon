-- 1. USERS (Пользователи системы)
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(64) UNIQUE NOT NULL,
    password_hash   VARCHAR(128) NOT NULL,
    email           VARCHAR(128) UNIQUE NOT NULL,
    phone           VARCHAR(32) UNIQUE NOT NULL,
    role            VARCHAR(32) DEFAULT 'user',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_name      VARCHAR(64),
    last_name       VARCHAR(64),
    avatar_url      VARCHAR(255) -- вот это поле!
);

-- 2. APARTMENTS (Квартиры/офисы/объекты)
CREATE TABLE apartments (
    id              SERIAL PRIMARY KEY,
    address         VARCHAR(255) NOT NULL,
    number          VARCHAR(32),
    description     VARCHAR(128),
    owner_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apartments_owner ON apartments (owner_id);

-- 3. SIP_ACCOUNTS (SIP-аккаунты для устройств)
CREATE TABLE sip_accounts (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(64) UNIQUE NOT NULL,
    password        VARCHAR(128) NOT NULL,
    server          VARCHAR(128),
    port            INTEGER DEFAULT 5060,
    protocol        VARCHAR(16) DEFAULT 'UDP',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sip_accounts_username ON sip_accounts (username);

-- 4. DEVICES (Домофоны, контроллеры)
CREATE TABLE devices (
    id              SERIAL PRIMARY KEY,
    serial_number   VARCHAR(64) UNIQUE NOT NULL,
    model           VARCHAR(64),
    apartment_id    INTEGER REFERENCES apartments(id) ON DELETE SET NULL,
    sip_account_id  INTEGER REFERENCES sip_accounts(id) ON DELETE SET NULL,
    status          VARCHAR(16) DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_apartment ON devices (apartment_id);
CREATE INDEX idx_devices_sip_account ON devices (sip_account_id);
CREATE INDEX idx_devices_serial_number ON devices (serial_number);
CREATE INDEX idx_devices_status ON devices (status);

-- 5. KEYS (RFID-ключи, коды доступа, метки и т.п.)
CREATE TABLE keys (
    id              SERIAL PRIMARY KEY,
    key_code        VARCHAR(64) UNIQUE NOT NULL,
    key_type        VARCHAR(32) DEFAULT 'rfid',
    owner_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    issued_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_from      TIMESTAMP,
    valid_to        TIMESTAMP,
    description     VARCHAR(128)
);

CREATE INDEX idx_keys_owner ON keys (owner_id);
CREATE INDEX idx_keys_key_code ON keys (key_code);
CREATE INDEX idx_keys_key_type ON keys (key_type);
CREATE INDEX idx_keys_is_active ON keys (is_active);

-- 6. ACCESS_HISTORY (История использования ключей/доступа)
CREATE TABLE access_history (
    id              SERIAL PRIMARY KEY,
    key_id          INTEGER REFERENCES keys(id) ON DELETE SET NULL,
    device_id       INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    access_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result          VARCHAR(32),
    description     VARCHAR(255)
);


CREATE INDEX idx_access_history_key ON access_history (key_id);
CREATE INDEX idx_access_history_device ON access_history (device_id);
CREATE INDEX idx_access_history_user ON access_history (user_id);
CREATE INDEX idx_access_history_access_time ON access_history (access_time DESC);

-- 7. EVENTS (События домофона и системы)
CREATE TABLE events (
    id              SERIAL PRIMARY KEY,
    device_id       INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    event_type      VARCHAR(64) NOT NULL,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description     VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_device ON events (device_id);
CREATE INDEX idx_events_user ON events (user_id);
CREATE INDEX idx_events_event_type ON events (event_type);
CREATE INDEX idx_events_created_at ON events (created_at DESC);

-- 8. MEDIA (Фото/видео события)
CREATE TABLE media (
    id              SERIAL PRIMARY KEY,
    event_id        INTEGER REFERENCES events(id) ON DELETE CASCADE,
    file_path       VARCHAR(255) NOT NULL,
    media_type      VARCHAR(16) DEFAULT 'photo',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_event ON media (event_id);

-- 9. DEVICE_LOGS (Журналы работы устройств)
CREATE TABLE device_logs (
    id              SERIAL PRIMARY KEY,
    device_id       INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    log_time        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    log_level       VARCHAR(16),
    message         TEXT,
    payload         JSONB
);

CREATE INDEX idx_device_logs_device ON device_logs (device_id);
CREATE INDEX idx_device_logs_log_time ON device_logs (log_time DESC);
CREATE INDEX idx_device_logs_log_level ON device_logs (log_level);

-- 10. APARTMENT_RESIDENTS
CREATE TABLE apartment_residents (
    id              SERIAL PRIMARY KEY,
    apartment_id    INTEGER REFERENCES apartments(id) ON DELETE CASCADE,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    resident_type   VARCHAR(32) DEFAULT 'resident',
    is_active       BOOLEAN DEFAULT TRUE,
    since           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apartment_residents_apartment ON apartment_residents (apartment_id);
CREATE INDEX idx_apartment_residents_user ON apartment_residents (user_id);
CREATE INDEX idx_apartment_residents_resident_type ON apartment_residents (resident_type);
CREATE INDEX idx_apartment_residents_is_active ON apartment_residents (is_active);

-- USERS индексы
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_phone ON users (phone);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_is_active ON users (is_active);

-- APARTMENTS индексы
CREATE INDEX idx_apartments_address ON apartments (address);
CREATE INDEX idx_apartments_number ON apartments (number);

-- SIP_ACCOUNTS индексы
CREATE INDEX idx_sip_accounts_username ON sip_accounts (username);

-- DEVICES индексы
CREATE INDEX idx_devices_serial_number ON devices (serial_number);
CREATE INDEX idx_devices_status ON devices (status);

-- KEYS индексы
CREATE INDEX idx_keys_key_code ON keys (key_code);
CREATE INDEX idx_keys_key_type ON keys (key_type);
CREATE INDEX idx_keys_is_active ON keys (is_active);

-- ACCESS_HISTORY индексы
CREATE INDEX idx_access_history_access_time ON access_history (access_time DESC);

-- EVENTS индексы
CREATE INDEX idx_events_event_type ON events (event_type);
CREATE INDEX idx_events_created_at ON events (created_at DESC);

-- DEVICE_LOGS индексы
CREATE INDEX idx_device_logs_log_time ON device_logs (log_time DESC);
CREATE INDEX idx_device_logs_log_level ON device_logs (log_level);

-- APARTMENT_RESIDENTS индексы
CREATE INDEX idx_apartment_residents_resident_type ON apartment_residents (resident_type);
CREATE INDEX idx_apartment_residents_is_active ON apartment_residents (is_active);

-- PASSWORD_RESET_TOKENS
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens (token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);

-- PHONE_VERIFICATION_TOKENS
CREATE TABLE phone_verification_tokens (
    phone VARCHAR(15) PRIMARY KEY,
    verification_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- JWT_TOKENS
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    jti TEXT,
    expires_at TIMESTAMP NOT NULL
);
