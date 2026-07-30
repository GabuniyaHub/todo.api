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

function getAllTodos() {
    return database.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
}

function getTodoById(id) {
    return database.prepare('SELECT * FROM todos WHERE id = ?').get(id);
}

function deleteTodoById(id) {
    return database.prepare('DELETE FROM todos WHERE id = ?').run(id)
}

function deleteAllTodos(){
    return database.prepare('DELETE FROM todos').run();
}
 
export { database, getAllTodos, getTodoById, deleteTodoById, deleteAllTodos, inicializationDB } ;