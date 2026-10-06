-- شذرات: جدول الإعجابات (يُشغَّل مرة واحدة في D1 Console)
CREATE TABLE IF NOT EXISTS likes (
  sid TEXT NOT NULL,          -- رقم الحكمة مثل m123
  dev TEXT NOT NULL,          -- معرّف عشوائي لجهاز الزائر (لا يحمل أي بيانات شخصية)
  ts  INTEGER NOT NULL,       -- وقت الإعجاب (ثوانٍ)
  PRIMARY KEY (sid, dev)
);
CREATE INDEX IF NOT EXISTS likes_ts ON likes (ts);
CREATE INDEX IF NOT EXISTS likes_dev ON likes (dev, ts);

-- admin tables (edits made from the site's admin panel)
CREATE TABLE IF NOT EXISTS edits (id TEXT PRIMARY KEY, op TEXT NOT NULL, data TEXT, ts INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS attempts (ip TEXT NOT NULL, ts INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS attempts_ip ON attempts (ip, ts);
