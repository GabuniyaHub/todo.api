import * as todoService from '../services/todoService.js';
import  { validateTodo } from '../utils/validation.js';

export async function getTodos(request, response) {
    try {
        const data = todoService.getAllTodos();
        const jsonBody = JSON.stringify(data);
        response
            .writeHead( 200, {
                'Content-Length': Buffer.byteLength(jsonBody),
                'Content-Type': 'application/json',
            })
            .end(jsonBody);
        return true;
    } catch ( err ){
        console.error(err);
        response.writeHead(500, { 'Content-Type': 'application/json'});
        response.end(JSON.stringify({ error: 'Сервер недоступен. Повтрите попытку позже'}));
        return true;
    }
}

export async function postTodo(request, response) {
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
            return true;
        }

        // 3️⃣ Парсим JSON (ОДИН РАЗ)
        const todoData = JSON.parse(body);

        // 4️⃣ Валидация
        if (!todoData.title || todoData.title.trim() === "") {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Заголовок обязателен' }));
            return true;
        }

        const newTodo = todoService.createTodo(todoData);

        // 8️⃣ Отправляем ответ клиенту
        response.writeHead(201, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(newTodo), 'utf8', () => {
            console.log('задача создана.');
        });
        
        return true;

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
        return true;
    }
}

export async function putTodo(request, response) {
    try {
        const id = parseInt(request.url.split('/').pop());

        if (isNaN(id) || id < 0){
            response
                .writeHead(400, {'Content-Type': 'application/json'})
                .end(JSON.stringify({ error: 'Некоректный ID задачи'}));
            return true;
        }

        const existingTodo = todoService.getTodoById(id);
        if (!existingTodo) {
            response
                .writeHead(404, {'Content-Type': 'application/json'})
                .end(JSON.stringify({ error: `Задача с ID ${id} не найдена.`}));
            return true;
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
            return true;
        }

        const todoData = JSON.parse(body);
        const errors = validateTodo(todoData);

        if ( errors.length > 0 ) {
            response.writeHead(400, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(errors));
            return true;
        }


        const updatedTodo = todoService.updateTodo(id, todoData);

        response
            .writeHead(200, {'Content-Type': 'application/json'})
            .end(JSON.stringify(updatedTodo));
        return true;
    } catch ( err ){
        console.error(err);
        response
            .writeHead(500, { 'Content-Type': 'application/json'})
            .end(JSON.stringify({error: 'Сервер недоступен. Повтрите попытку позже'}));
        return true;
    }
}

export async function deleteTodoById(request, response) {
    try {
        const id = parseInt(request.url.split('/').pop());

        if ( isNaN(id) || id < 0 ) {
            response
                .writeHead(400, {"Content-Type": "application/json"})
                .end(JSON.stringify({ error: "Некорретный ID задачи."}));
            return true;
        }

        const existingTodo = todoService.getTodoById(id);
        if ( !existingTodo) {
            response
                .writeHead(404, {"Content-Type": "application/json"})
                .end(JSON.stringify({ error: "Задача не найдена."}));
            return true;
        }

        const result = todoService.deleteTodoById(id);
        if (result.changes === 0) {
            response
                .writeHead(404, {"Content-Type":"application/json"})
                .end(JSON.stringify({error: `Задача с id ${id} не найдена.`}));
            return true;
        }

        response
            .writeHead(204)
            .end();
        return true;


    } catch ( err ){
        console.error('Ошибка: ', err);
        response
            .writeHead(500, {"Content-Type": "application/json"})
            .end(JSON.stringify({error: "Внутренняя ошибка сервера."}));
        return true;
    }
}

export async function deleteAllTodos(request, response) {
    try {
        const result = todoService.deleteAllTodos();
        if (!result.changes) {
            response
                .writeHead(404, {"Content-Type":"application/json"})
                .end(JSON.stringify({error: "Список задач уже пуст."}));
            return true;
        }

        response
            .writeHead(200, {"Content-Type":"application/json"})
            .end(JSON.stringify({ message: `Удалено задач: ${result.changes}`}));
        return true;
    } catch ( err ){
        console.error(err);
        response
            .writeHead(500, {"Content-Type":"application/json"})
            .end(JSON.stringify({error: "Внутренняя ошибка сервера."}));
        return true;
    }
}