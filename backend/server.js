import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

http.createServer( async (request, response) => {
    
    const __Filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__Filename);
    const frontendDir = path.join(__dirname, '..', 'frontend');
    const indexPath = path.join(frontendDir, 'index.html');
    
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
            response.end('404 ошибка')
        }
    }
}).listen(3000, "127.0.0.1", () => {
    console.log("Сервер начал прослушивание запросов на порту 3000.");
});