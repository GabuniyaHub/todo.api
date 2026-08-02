import { database } from '../database/initDB.js';

function getAllTodos() {
    return database.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
}

function getTodoById(id) {
    return database.prepare('SELECT * FROM todos WHERE id = ?').get(id);
}

function createTodo(todoData) {
    const insert = database.prepare(`
        INSERT INTO todos (title, description, completed, priority, due_date)
        VALUES ($title, $description, $completed, $priority, $due_date)
    `);

    const info = insert.run({
        $title: todoData.title.trim(),
        $description: todoData.description || null,
        $completed: todoData.completed || 0,
        $priority: todoData.priority || 0,
        $due_date: todoData.due_date || null
    });

    return getTodoById(info.lastInsertRowid);
}

function updateTodo(id, todoData) {
    const update = database.prepare(`
        UPDATE todos
        SET 
            title = $title, 
            description = $description, 
            completed = $completed, 
            priority = $priority, 
            due_date = $due_date,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $id
    `);

    update.run({
        $id: id,
        $title: todoData.title?.trim() || null,
        $description: todoData.description || null,
        $completed: todoData.completed !== undefined ? (todoData.completed ? 1 : 0) : null,
        $priority: todoData.priority || null,
        $due_date: todoData.due_date || null
    });

    return getTodoById(id);
}


function deleteTodoById(id) {
    return database.prepare('DELETE FROM todos WHERE id = ?').run(id)
}

function deleteAllTodos(){
    return database.prepare('DELETE FROM todos').run();
}
 
export { getAllTodos, getTodoById, createTodo, updateTodo, deleteTodoById, deleteAllTodos } ;