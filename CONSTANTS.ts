globalThis.IS_DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
globalThis.API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'http://10.8.0.99:8000';
globalThis.FAIRWATT_ACCESS_TOKEN_NAME = 'fairwatt_access_token';