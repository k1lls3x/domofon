-- 1. USERS
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

-- 2. APARTMENTS (объекты/квартиры/офисы)
CREATE TABLE apartments (
    id              SERIAL PRIMARY KEY,
    address         VARCHAR(255) NOT NULL,
    number          VARCHAR(32),          -- номер квартиры/офиса
    description     VARCHAR(128),
    owner_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DEVICES (Домофоны, контроллеры)
CREATE TABLE devices (
    id              SERIAL PRIMARY KEY,
    serial_number   VARCHAR(64) UNIQUE NOT NULL,
    model           VARCHAR(64),
    apartment_id    INTEGER REFERENCES apartments(id) ON DELETE SET NULL,
    sip_account_id  INTEGER REFERENCES sip_accounts(id) ON DELETE SET NULL,
    status          VARCHAR(16) DEFAULT 'active', -- active, offline, error
    firmware        VARCHAR(64),
    ip_address      INET,
    last_seen       TIMESTAMP,
    settings        JSONB,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. SIP ACCOUNTS
CREATE TABLE sip_accounts (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(64) UNIQUE NOT NULL,
    password        VARCHAR(64) NOT NULL,
    server          VARCHAR(128) NOT NULL,
    port            INTEGER DEFAULT 5060,
    protocol        VARCHAR(16) DEFAULT 'UDP', -- UDP/TCP/TLS
    description     VARCHAR(128)
);

-- 5. ACCESS KEYS (RFID/NFC/Пин-коды)
CREATE TABLE access_keys (
    id              SERIAL PRIMARY KEY,
    key_type        VARCHAR(32) NOT NULL, -- rfid, nfc, pin, virtual
    key_value       VARCHAR(64) NOT NULL,
    description     VARCHAR(128),
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    apartment_id    INTEGER REFERENCES apartments(id) ON DELETE SET NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    valid_from      TIMESTAMP,
    valid_to        TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. EVENTS (Журнал событий)
CREATE TABLE events (
    id              SERIAL PRIMARY KEY,
    device_id       INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    apartment_id    INTEGER REFERENCES apartments(id) ON DELETE SET NULL,
    event_type      VARCHAR(32) NOT NULL, -- call, open, access_granted, access_denied, alarm, etc.
    event_time      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description     TEXT,
    access_key_id   INTEGER REFERENCES access_keys(id) ON DELETE SET NULL,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    media_id        INTEGER REFERENCES media(id) ON DELETE SET NULL
);

-- 7. MEDIA (фото/видео события)
CREATE TABLE media (
    id              SERIAL PRIMARY KEY,
    file_path       VARCHAR(255) NOT NULL,
    media_type      VARCHAR(16) NOT NULL, -- photo, video
    event_id        INTEGER REFERENCES events(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. DEVICE LOGS (сырая телеметрия, диагностика)
CREATE TABLE device_logs (
    id              SERIAL PRIMARY KEY,
    device_id       INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    log_time        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level           VARCHAR(16), -- info, warning, error
    message         TEXT,
    payload         JSONB
);

-- 9. SYSTEM SETTINGS
CREATE TABLE settings (
    id              SERIAL PRIMARY KEY,
    key             VARCHAR(64) UNIQUE NOT NULL,
    value           TEXT NOT NULL,
    description     VARCHAR(255)
);

-- Индексы для ускорения поиска по частым сценариям
CREATE INDEX idx_events_device_time ON events (device_id, event_time DESC);
CREATE INDEX idx_events_type_time ON events (event_type, event_time DESC);
CREATE INDEX idx_access_keys_user ON access_keys (user_id, is_active);
CREATE INDEX idx_devices_apartment ON devices (apartment_id);
CREATE INDEX idx_apartments_owner ON apartments (owner_id);
