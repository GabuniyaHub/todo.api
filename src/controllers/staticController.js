import fs from 'node:fs/promises';

export async function getIndex(request, response, indexPath) {
    try {
        const html = await fs.readFile(indexPath, 'utf8');
        response
            .writeHead(200, {'Content-Type':'text/html'})
            .end(html);
        return true;
    } catch ( err ) {
        console.error(err);
        response
            .writeHead(500, {'Content-Type':'application/json'})
            .end(JSON.stringify({error: "Внутренняя ошибка сервера."}));
        return true;
    }
}