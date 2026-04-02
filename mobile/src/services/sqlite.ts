import * as SQLite from 'expo-sqlite';

// Abre (ou cria) o banco SmartPanel.db
const db = SQLite.openDatabaseSync('smartpanel.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      sync_status TEXT DEFAULT 'synced' -- 'synced' ou 'pending'
    );
    
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      title TEXT NOT NULL,
      data TEXT, -- JSON do formulário
      sync_status TEXT DEFAULT 'synced'
    );
  `);
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

