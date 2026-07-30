import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

import { database, getAllTodos, getTodoById, deleteTodoById, deleteAllTodos, inicializationDB } from './database/initDB.js';
import { validateTodo } from './utils/validation.js'

const __Filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__Filename);
const publicDir = path.join(__dirname, '..', 'public');
const indexPath = path.join(publicDir, 'index.html');

inicializationDB(); 

http.createServer( async (request, response) => {

    console.log({
        method: request.method,
        url: request.url,
        httpVersion: request.httpVersion,
        headers: request.headers,
        timestamp: new Date().toISOString()
    });
    
    if (request.method === 'GET' && request.url === '/') {
        try {
            const html = await fs.readFile(indexPath, 'utf-8')
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.end(html);
            return;
        } catch (err) {
            console.error(err);
            response.writeHead(500);
            response.end('Сервер недоступен. Повтрите попытку позже');
            return;
        }
    }

    if (request.method === 'GET' && request.url === '/todos') {
        try {

            const data = getAllTodos();

            const jsonBody = JSON.stringify(data);

            response
                .writeHead( 200, {
                    'Content-Length': Buffer.byteLength(jsonBody),
                    'Content-Type': 'application/json',
                })
                .end(jsonBody);
            return;
        } catch ( err ){
            console.error(err);
            response.writeHead(500, { 'Content-Type': 'application/json'});
            response.end(JSON.stringify({ error: 'Сервер недоступен. Повтрите попытку позже'}));
            return;
        }
    }

    if (request.method === 'POST' && request.url === '/todos') {
        try {
            // 1️⃣ Читаем тело запроса
            const buffers = [];
            for await (const chunk of request) {
                buffers.push(chunk);
            }
            const body = Buffer.concat(buffers).toString();

            // 2️⃣ Проверяем, что тело НЕ пустое
            if (!body) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Тело запроса не может быть пустым' }));
                return;
            }

            // 3️⃣ Парсим JSON (ОДИН РАЗ)
            const todoData = JSON.parse(body);

            // 4️⃣ Валидация
            if (!todoData.title || todoData.title.trim() === "") {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Заголовок обязателен' }));
                return;
            }

            // 5️⃣ Подготавливаем INSERT
            const insert = database.prepare(`
                INSERT INTO todos (title, description, completed, priority, due_date)
                VALUES ($title, $description, $completed, $priority, $due_date)
            `);

            // 6️⃣ Выполняем INSERT
            const info = insert.run({
                $title: todoData.title.trim(),
                $description: todoData.description || null,
                $completed: todoData.completed || 0,
                $priority: todoData.priority || 0,
                $due_date: todoData.due_date || null
            });

            const newTodo = getTodoById(info.lastInsertRowid);

            // 8️⃣ Отправляем ответ клиенту
            response.writeHead(201, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(newTodo), 'utf8', () => {
                console.log('задача создана.');
            });
            
            return;

        } catch (err) {
            // 9️⃣ Обрабатываем ошибки
            if (err instanceof SyntaxError) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Неверный формат JSON' }));
            } else {
                console.error('❌ Ошибка:', err);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Внутренняя ошибка сервера' }));
            }
            return;
        }
    }

    if (request.method === 'PUT' && request.url.startsWith('/todos/')) {
        try {
            const id = parseInt(request.url.split('/').pop());

            if (isNaN(id) || id < 0){
                response
                    .writeHead(400, {'Content-Type': 'application/json'})
                    .end(JSON.stringify({ error: 'Некоректный ID задачи'}));
                return;
            }

            const existingTodo = getTodoById(id);
            if (!existingTodo) {
                response
                    .writeHead(404, {'Content-Type': 'application/json'})
                    .end(JSON.stringify({ error: `Задача с ID ${id} не найдена.`}));
                return;
            }

            const buffers = [];

            for await (const chunk of request) {
                buffers.push(chunk);
            }

            const body = Buffer.concat(buffers).toString();

            if (!body) {
                response
                    .writeHead(400, {'Content-Type': 'application/json'})
                    .end(JSON.stringify({error: 'Ошибка: тело запроса не может быть пустым. '}));
                return
            }

            const todoData = JSON.parse(body);
            const errors = validateTodo(todoData);

            if ( errors.length > 0 ) {
                response.writeHead(400, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(errors));
                return;
            }

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

            const updatedTodo = getTodoById(id);

            response
                .writeHead(200, {'Content-Type': 'application/json'})
                .end(JSON.stringify(updatedTodo));
            return;
        } catch ( err ){
            console.error(err);
            response
                .writeHead(500, { 'Content-Type': 'application/json'})
                .end(JSON.stringify({error: 'Сервер недоступен. Повтрите попытку позже'}));
            return;
        }
    }

    if (request.method === 'DELETE' && request.url.startsWith('/todos/')) {
        try {
            const id = parseInt(request.url.split('/').pop());

            if ( isNaN(id) || id < 0 ) {
                response
                    .writeHead(400, {"Content-Type": "application/json"})
                    .end(JSON.stringify({ error: "Некорретный ID задачи."}));
                return;
            }

            const existingTodo = getTodoById(id);
            if ( !existingTodo) {
                response
                    .writeHead(404, {"Content-Type": "application/json"})
                    .end(JSON.stringify({ error: "Задача не найдена."}));
                return;
            }

            const result = deleteTodoById(id);
            if (!result) {
                response
                    .writeHead(404, {"Content-Type":"application/json"})
                    .end(JSON.stringify({error: `Задача с id ${id} не найдена.`}));
                return;
            }

            response
                .writeHead(204)
                .end();
            return;


        } catch ( err ){
            console.error('Ошибка: ', err);
            response
                .writeHead(500, {"Content-Type": "application/json"})
                .end(JSON.stringify({error: "Внутренняя ошибка сервера."}));
            return;
        }
    }

    if (request.method === 'DELETE' && request.url === '/todos') {
        try {

            const result = deleteAllTodos();
            if (!result.changes) {
                response
                    .writeHead(404, {"Content-Type":"application/json"})
                    .end(JSON.stringify({error: "Список задач уже пуст."}));
                return;
            }

            response
                .writeHead(200, {"Content-Type":"application/json"})
                .end(JSON.stringify({ message: `Удалено задач: ${result.changes}`}));
            return;
        } catch ( err ){
            console.error(err);
            response
                .writeHead(500, {"Content-Type":"application/json"})
                .end(JSON.stringify({error: "Внутренняя ошибка сервера."}));
            return;
        }
    }

    // Обработка статики
    async function serveStatic(request, response){
        try {
            const filePath = path.join(publicDir, request.url);

            await fs.access(filePath);

            const ext = path.extname(filePath);
            const mimeTypes = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            }

            const contentType = mimeTypes[ext] || 'application/octet-stream';

            const fileContent = await fs.readFile(filePath);
            response
                .writeHead(200, {'Content-Type': contentType})
                .end(fileContent);
            return true;
        } catch (err) {
            // 404
            if (err.code === 'ENOENT') {
                return false;
            } else {
                console.error('Error:', err);
                response
                    .writeHead(500)
                    .end('Internal server error');
            }
            return true;
        }
    }

    const isStaticServed = await serveStatic(request, response);
    if (isStaticServed) return 
    response
        .writeHead(404)
        .end('404 Not Found');

}).listen(3000, "localhost", () => {
    console.log("Сервер начал прослушивание запросов на порту 3000.");
});