CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  status TEXT NOT NULL,
  last_update TEXT NOT NULL,
  valid_until TEXT,
  consultation_hours INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cn_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  supplier_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS supplier_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  supplier_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  date_received TEXT NOT NULL,
  document_type TEXT NOT NULL,
  filesize INTEGER NOT NULL,
  url TEXT NOT NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
