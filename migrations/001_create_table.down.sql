-- Индексы (их можно удалять без IF EXISTS, но лучше с ним)
DROP INDEX IF EXISTS idx_apartments_owner;
DROP INDEX IF EXISTS idx_devices_apartment;
DROP INDEX IF EXISTS idx_access_keys_user;
DROP INDEX IF EXISTS idx_events_type_time;
DROP INDEX IF EXISTS idx_events_device_time;

-- Таблицы (в обратном порядке создания)
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS device_logs;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS access_keys;
DROP TABLE IF EXISTS sip_accounts;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS apartments;
DROP TABLE IF EXISTS users;
