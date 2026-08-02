import http from 'node:http';
import path from 'node:path';
import url from 'node:url';

import { inicializationDB } from './database/initDB.js';
import { serveStatic } from './utils/serveStatic.js';
import { todosRouter } from './routes/todos.js';
import { staticRouter } from './routes/static.js';
import { logRequest, logError, logSuccess } from './utils/logger.js';

const __Filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__Filename);
const publicDir = path.join(__dirname, '..', 'public');
const indexPath = path.join(publicDir, 'index.html');

inicializationDB(); 

http.createServer( async (request, response) => {

    logRequest(request);
    
    const isStatic = await staticRouter(request, response, publicDir, indexPath);
    if (isStatic) return;

    const todos = await todosRouter(request, response);
    if (todos) return;

    const isStaticServed = await serveStatic(request, response, publicDir);
    if (isStaticServed) return 

    response
        .writeHead(404)
        .end('404 Not Found');

}).listen(3000, "localhost", () => {
    console.log("Сервер начал прослушивание запросов на порту 3000.");
});