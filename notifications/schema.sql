CREATE TABLE IF NOT EXISTS oem_notification_outbox (
 enquiry_id TEXT PRIMARY KEY, state TEXT NOT NULL DEFAULT 'pending',
 attempts INTEGER NOT NULL DEFAULT 0, retry_at INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL, error_code TEXT);
