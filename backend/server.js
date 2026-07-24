import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const __Filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__Filename);
const frontendDir = path.join(__dirname, '..', 'frontend');
const indexPath = path.join(frontendDir, 'index.html');

http.createServer( async (request, response) => {
    
    if (request.method === 'GET' && request.url === '/') {
        try {
            const html = await fs.readFile(indexPath, 'utf-8')
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.end(html);
        } catch (err) {
            console.error(err)
            response.writeHead(500);
            response.end('Сервер недоступен. Повтрите попытку позже')
        }
    }

    if (request.method === 'GET' && request.url === "/api/todos") {
        try {
            const data = {
                message: "hello from node js API!",
                todos: [
                    { id: 1, title: 'Изучить node js', completed: false },
                    { id: 2, title: 'Сделать Todo API', completed: false },
                ] 
            };

            const jsonBody = JSON.stringify(data);

            response
                .writeHead( 200, {
                    'Content-Length': Buffer.byteLength(jsonBody),
                    'Content-Type': 'application/json',
                })
                .end(jsonBody);
        } catch ( err ){
            console.error(err)
            response.writeHead(500);
            responce.end('Сервер недоступен. Повтрите попытку позже')
        }
    }

    if (request.method === 'POST' && request.url === "/api/todos") {
        try {

        } catch ( err ){
            console.error(err)
            response.writeHead(500);
            responce.end('Сервер недоступен. Повтрите попытку позже')
        }
    }
}).listen(3000, "127.0.0.1", () => {
    console.log("Сервер начал прослушивание запросов на порту 3000.");
});