-- 1. USERS (Пользователи системы)
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(64) UNIQUE NOT NULL,
    password_hash   VARCHAR(128) NOT NULL,
    email           VARCHAR(128),
    phone           VARCHAR(32),
    role            VARCHAR(32) DEFAULT 'user', -- admin, user, service
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. APARTMENTS (Квартиры/офисы/объекты)
CREATE TABLE apartments (
    id              SERIAL PRIMARY KEY,
    address         VARCHAR(255) NOT NULL,
    number          VARCHAR(32),                -- номер квартиры/офиса
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
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. DEVICES (Домофоны, контроллеры)
CREATE TABLE devices (
    id              SERIAL PRIMARY KEY,
    serial_number   VARCHAR(64) UNIQUE NOT NULL,
    model           VARCHAR(64),
    apartment_id    INTEGER REFERENCES apartments(id) ON DELETE SET NULL,
    sip_account_id  INTEGER REFERENCES sip_accounts(id) ON DELETE SET NULL,
    status          VARCHAR(16) DEFAULT 'active', -- active, offline, error
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_apartment ON devices (apartment_id);
CREATE INDEX idx_devices_sip_account ON devices (sip_account_id);

-- 5. KEYS (RFID-ключи, коды доступа, метки и т.п.)
CREATE TABLE keys (
    id              SERIAL PRIMARY KEY,
    key_code        VARCHAR(64) UNIQUE NOT NULL,   -- номер карты/ключа
    key_type        VARCHAR(32) DEFAULT 'rfid',    -- rfid, pin, etc.
    owner_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    issued_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description     VARCHAR(128)
);

CREATE INDEX idx_keys_owner ON keys (owner_id);

-- 6. ACCESS_HISTORY (История использования ключей/доступа)
CREATE TABLE access_history (
    id              SERIAL PRIMARY KEY,
    key_id          INTEGER REFERENCES keys(id) ON DELETE SET NULL,
    device_id       INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    access_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result          VARCHAR(32),        -- success, denied, error
    description     VARCHAR(255)
);

CREATE INDEX idx_access_history_key ON access_history (key_id);
CREATE INDEX idx_access_history_device ON access_history (device_id);
CREATE INDEX idx_access_history_user ON access_history (user_id);

-- 7. EVENTS (События домофона и системы)
CREATE TABLE events (
    id              SERIAL PRIMARY KEY,
    device_id       INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    event_type      VARCHAR(64) NOT NULL,           -- call, access_granted, access_denied, alarm и т.д.
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description     VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_device ON events (device_id);
CREATE INDEX idx_events_user ON events (user_id);

-- 8. DEVICE_LOGS (Журналы работы устройств)
CREATE TABLE device_logs (
    id              SERIAL PRIMARY KEY,
    device_id       INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    log_time        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    log_level       VARCHAR(16),                 -- info, warning, error
    message         TEXT
);

CREATE INDEX idx_device_logs_device ON device_logs (device_id);

-- 9. APARTMENT_RESIDENTS (Связь пользователей с квартирами/офисами, если нужно больше одного жильца на квартиру)
CREATE TABLE apartment_residents (
    id              SERIAL PRIMARY KEY,
    apartment_id    INTEGER REFERENCES apartments(id) ON DELETE CASCADE,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    resident_type   VARCHAR(32) DEFAULT 'resident', -- resident, guest, owner
    is_active       BOOLEAN DEFAULT TRUE,
    since           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apartment_residents_apartment ON apartment_residents (apartment_id);
CREATE INDEX idx_apartment_residents_user ON apartment_residents (user_id);

-- (Если нужны ещё таблицы — напиши, что добавить)

-- USERS
CREATE INDEX idx_users_username ON users (username);                   -- поиск по логину
CREATE INDEX idx_users_email ON users (email);                         -- поиск по email
CREATE INDEX idx_users_phone ON users (phone);                         -- поиск по телефону
CREATE INDEX idx_users_role ON users (role);                           -- фильтрация по ролям
CREATE INDEX idx_users_is_active ON users (is_active);                 -- активные/неактивные

-- APARTMENTS
CREATE INDEX idx_apartments_address ON apartments (address);           -- поиск по адресу
CREATE INDEX idx_apartments_number ON apartments (number);             -- поиск по номеру квартиры
-- idx_apartments_owner уже есть выше

-- SIP_ACCOUNTS
CREATE INDEX idx_sip_accounts_username ON sip_accounts (username);     -- поиск по имени аккаунта

-- DEVICES
CREATE INDEX idx_devices_serial_number ON devices (serial_number);     -- поиск по серийному номеру
CREATE INDEX idx_devices_status ON devices (status);                   -- фильтрация по статусу

-- KEYS
CREATE INDEX idx_keys_key_code ON keys (key_code);                     -- поиск по коду ключа
CREATE INDEX idx_keys_key_type ON keys (key_type);                     -- фильтрация по типу ключа
CREATE INDEX idx_keys_is_active ON keys (is_active);                   -- активные/неактивные

-- ACCESS_HISTORY
CREATE INDEX idx_access_history_access_time ON access_history (access_time DESC);  -- последние события
-- Индексы по key_id, device_id, user_id уже есть

-- EVENTS
CREATE INDEX idx_events_event_type ON events (event_type);             -- фильтрация по типу события
CREATE INDEX idx_events_created_at ON events (created_at DESC);        -- последние события
-- Индексы по device_id, user_id уже есть

-- DEVICE_LOGS
CREATE INDEX idx_device_logs_log_time ON device_logs (log_time DESC);  -- последние логи
CREATE INDEX idx_device_logs_log_level ON device_logs (log_level);     -- фильтрация по уровню

-- APARTMENT_RESIDENTS
CREATE INDEX idx_apartment_residents_resident_type ON apartment_residents (resident_type); -- фильтрация по типу жильца
CREATE INDEX idx_apartment_residents_is_active ON apartment_residents (is_active);         -- активные/неактивные
