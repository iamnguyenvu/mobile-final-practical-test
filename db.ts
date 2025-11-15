import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('contacts.db');
  }
  return db;
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call openDatabase() first.');
  }
  return db;
};
