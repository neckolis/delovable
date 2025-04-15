/**
 * CORS handler for the Delovable Worker
 */

// Define allowed origins
const ALLOWED_ORIGINS = [
  'https://delovable.pages.dev',
  'https://*.delovable.pages.dev',
  'http://localhost:3000',
  'http://localhost:8787',
];

// Create CORS headers
export function createCORSHeaders(request: Request) {
  const origin = request.headers.get('Origin') || '';

  // Check if the origin is allowed
  const isAllowed = ALLOWED_ORIGINS.some(allowedOrigin => {
    if (allowedOrigin === '*') return true;
    if (allowedOrigin === origin) return true;
    if (allowedOrigin.includes('*')) {
      const pattern = allowedOrigin.replace('*', '.*');
      return new RegExp(pattern).test(origin);
    }
    return false;
  });

  // Use the actual origin if it's allowed, otherwise use '*'
  const allowOrigin = isAllowed ? origin : '*';

  console.log('Request origin:', origin);
  console.log('CORS allow origin:', allowOrigin);

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function handleCORS(request: Request): Response {
  // Handle CORS preflight requests
  const corsHeaders = createCORSHeaders(request);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
