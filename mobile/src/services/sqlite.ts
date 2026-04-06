import * as SQLite from 'expo-sqlite';

// Abre (ou cria) o banco SmartPanel.db

export const db = SQLite.openDatabaseSync('smartpanel.db');

export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT, -- Guardamos o JSON completo do projeto (incluindo owner e members)
        sync_status TEXT DEFAULT 'synced'
      );

      CREATE TABLE IF NOT EXISTS projects_cache (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS forms (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        title TEXT NOT NULL,
        data TEXT, -- JSON completo do formulário (incluindo os campos/fields)
        sync_status TEXT DEFAULT 'synced'
      );

      CREATE TABLE IF NOT EXISTS forms_cache (
        id TEXT PRIMARY KEY,
        projectId TEXT,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL,
        payload TEXT NOT NULL,
        method TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      // Verifica se a coluna 'status' existe na sync_queue
      db.execSync("ALTER TABLE sync_queue ADD COLUMN status TEXT DEFAULT 'pending';");
    } catch (e) {
      // Ignora se a coluna já existir
    }

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export const getLocalProjects = () => {
  return db.getAllSync('SELECT * FROM projects');
};

export const saveProjectLocal = (id: string, name: string, status: 'synced' | 'pending') => {
  db.runSync(
    'INSERT OR REPLACE INTO projects (id, name, sync_status) VALUES (?, ?, ?)',
    [id, name, status]
  );
};

