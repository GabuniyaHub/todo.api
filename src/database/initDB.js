import { DatabaseSync } from 'node:sqlite';

const database = new DatabaseSync('todos.db');

function inicializationDB() {

    database.exec(`
        CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        priority INTEGER DEFAULT 0,
        due_date TEXT
        ) STRICT
    `);
    console.log("База данных инициализирована.")
}

 
export { database, inicializationDB } ;