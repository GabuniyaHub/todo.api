// Обработка статики
import fs from 'node:fs/promises';
import path from 'node:path';


async function serveStatic(request, response, publicDir){
    try {
        const filePath = path.join(publicDir, request.url);

        await fs.access(filePath, fs.constants.F_OK); // проверяем есть ли доступ к файлам или дерриктории 
        // F_OK	Флаг, указывающий, что файл виден вызывающему процессу. Это полезно для определения существования файла, но ничего не говорит о rwx разрешениях. Значение по умолчанию, если режим не указан.

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

export { serveStatic }