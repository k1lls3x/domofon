-- Удаляем индексы (они часто удаляются автоматически вместе с таблицей, но для чистоты явно удаляем)
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_phone;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_is_active;

DROP INDEX IF EXISTS idx_apartments_owner;
DROP INDEX IF EXISTS idx_apartments_address;
DROP INDEX IF EXISTS idx_apartments_number;

DROP INDEX IF EXISTS idx_sip_accounts_username;

DROP INDEX IF EXISTS idx_devices_apartment;
DROP INDEX IF EXISTS idx_devices_sip_account;
DROP INDEX IF EXISTS idx_devices_serial_number;
DROP INDEX IF EXISTS idx_devices_status;

DROP INDEX IF EXISTS idx_keys_owner;
DROP INDEX IF EXISTS idx_keys_key_code;
DROP INDEX IF EXISTS idx_keys_key_type;
DROP INDEX IF EXISTS idx_keys_is_active;

DROP INDEX IF EXISTS idx_access_history_key;
DROP INDEX IF EXISTS idx_access_history_device;
DROP INDEX IF EXISTS idx_access_history_user;
DROP INDEX IF EXISTS idx_access_history_access_time;

DROP INDEX IF EXISTS idx_events_device;
DROP INDEX IF EXISTS idx_events_user;
DROP INDEX IF EXISTS idx_events_event_type;
DROP INDEX IF EXISTS idx_events_created_at;

DROP INDEX IF EXISTS idx_media_event;

DROP INDEX IF EXISTS idx_device_logs_device;
DROP INDEX IF EXISTS idx_device_logs_log_time;
DROP INDEX IF EXISTS idx_device_logs_log_level;

DROP INDEX IF EXISTS idx_apartment_residents_apartment;
DROP INDEX IF EXISTS idx_apartment_residents_user;
DROP INDEX IF EXISTS idx_apartment_residents_resident_type;
DROP INDEX IF EXISTS idx_apartment_residents_is_active;

-- Могли быть ещё кастомные индексы:
DROP INDEX IF EXISTS idx_access_keys_user;
DROP INDEX IF EXISTS idx_events_type_time;
DROP INDEX IF EXISTS idx_events_device_time;

-- Удаляем таблицы в обратном порядке связей (от самых зависимых к базовым)
DROP TABLE IF EXISTS device_logs;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS access_history;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS apartment_residents;
DROP TABLE IF EXISTS keys;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS sip_accounts;
DROP TABLE IF EXISTS apartments;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;
