import * as todoController from '../controllers/todoController.js';

export async function todosRouter( request, response ) {
    const method = request.method;
    const url = request.url;

    // GET todos
    if (method === 'GET' && url ==='/todos') {
        return await todoController.getTodos(request, response);
    }

    // POST /todos
    if (method === 'POST' && url === '/todos') {
        return await todoController.postTodo(request, response);
    }

    // PUT /todos/:id
    if (method === 'PUT' && url.startsWith('/todos/')) {
        return await todoController.putTodo(request, response);
    }

    // DELETE /todos/:id
    if (method === 'DELETE' && url.startsWith('/todos/')) {
        return await todoController.deleteTodoById(request, response);
    }

    // DELETE /todos
    if (method === 'DELETE' && url === '/todos') {
        return await todoController.deleteAllTodos(request, response);
    }

    // Если маршрут не найден
    return false;
}