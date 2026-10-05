-- شذرات: جدول الإعجابات (يُشغَّل مرة واحدة في D1 Console)
CREATE TABLE IF NOT EXISTS likes (
  sid TEXT NOT NULL,          -- رقم الحكمة مثل m123
  dev TEXT NOT NULL,          -- معرّف عشوائي لجهاز الزائر (لا يحمل أي بيانات شخصية)
  ts  INTEGER NOT NULL,       -- وقت الإعجاب (ثوانٍ)
  PRIMARY KEY (sid, dev)
);
CREATE INDEX IF NOT EXISTS likes_ts ON likes (ts);
CREATE INDEX IF NOT EXISTS likes_dev ON likes (dev, ts);
