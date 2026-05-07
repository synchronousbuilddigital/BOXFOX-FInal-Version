export function rateLimit(options) {
    const tokenCache = new Map();
    const { interval } = options;
    let lastPruned = Date.now();

    return {
        check: (limit, token) =>
            new Promise((resolve, reject) => {
                const now = Date.now();
                // Periodically clear out old entries
                if (now - lastPruned > interval) {
                    for (const [key, timeInfo] of tokenCache.entries()) {
                        if (now - timeInfo[0] > interval) {
                            tokenCache.delete(key);
                        }
                    }
                    lastPruned = now;
                }

                const tokenCount = tokenCache.get(token) || [now, 0];
                if (now - tokenCount[0] > interval) {
                    tokenCount[0] = now;
                    tokenCount[1] = 0;
                }

                tokenCount[1] += 1;
                tokenCache.set(token, tokenCount);

                const currentUsage = tokenCount[1];
                if (currentUsage > limit) {
                    reject(new Error('Rate limit exceeded'));
                } else {
                    resolve(currentUsage);
                }
            }),
    };
}

export function getIP(req) {
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return req.headers.get('x-real-ip') || '127.0.0.1';
}
