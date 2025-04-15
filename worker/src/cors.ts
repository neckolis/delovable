/**
 * CORS handler for the Delovable Worker
 */

export function handleCORS(request: Request): Response {
  // Handle CORS preflight requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
