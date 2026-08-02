export function logRequest(request, prefix = '') {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.url;
    const httpVersion = request.httpVersion;
    const userAgent = request.headers['user-agent'] || 'unknown';
    const referer = request.headers['referer'] || 'direct';

    console.log({
        timestamp,
        method,
        url,
        httpVersion,
        userAgent,
        referer,
    });
}

export function logError(error, context = '') {
    const timestamp = new Date().toISOString();
    console.error({
        timestamp,
        context,
        message: error.message,
        stack: error.stack,
    });
}

export function logSuccess(message, data = {}) {
    const timestamp = new Date().toISOString();
    console.log({
        timestamp,
        message,
        ...data,
    });
}

