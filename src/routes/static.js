import { getIndex } from '../controllers/staticController.js';

export async function staticRouter(request, response, publicDir, indexPath) {
    const method = request.method;
    const url = request.url;

    if ( method === 'GET' && url === '/') {
        return await getIndex(request, response, indexPath);
    }

    return false;
}