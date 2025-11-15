import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('contacts.db');
    await initializeDatabase(db);
  }
  return db;
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call openDatabase() first.');
  }
  return db;
};

// Hàm để xóa và tạo lại database
export const resetDatabase = async () => {
  try {
    const database = await openDatabase();
    await database.execAsync('DROP TABLE IF EXISTS contacts');
    await initializeDatabase(database);
  } catch (error) {
    console.error('❌ Lỗi reset database:', error);
    throw error;
  }
};

const initializeDatabase = async (database: SQLite.SQLiteDatabase) => {
  try {
    // Tạo bảng contacts
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        favorite INTEGER DEFAULT 0,
        created_at INTEGER
      );
    `);

    // Kiểm tra xem đã có dữ liệu mẫu chưa
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM contacts'
    );

    // Seed dữ liệu mẫu nếu chưa có
    if (result && result.count === 0) {
      const now = Date.now();
      
      await database.runAsync(
        'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)',
        ['Nguyễn Văn A', '0901234567', 'nguyenvana@email.com', 0, now]
      );
      await database.runAsync(
        'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)',
        ['Trần Thị B', '0912345678', 'tranthib@email.com', 1, now]
      );
      await database.runAsync(
        'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)',
        ['Lê Văn C', '0923456789', 'levanc@email.com', 0, now]
      );
      
      console.log('✅ Seed dữ liệu mẫu thành công');
    }
  } catch (error) {
    console.error('❌ Lỗi khởi tạo database:', error);
    throw error;
  }
};
