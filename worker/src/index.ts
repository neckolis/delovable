/**
 * Delovable Worker API
 * 
 * This worker handles GitHub repository processing for the delovable tool.
 * It provides an API endpoint to clean Lovable metadata from GitHub repositories.
 */

import { Env } from './types';
import { handleCORS } from './cors';
import { processRepository } from './repository';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    // Add CORS headers to all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
      const url = new URL(request.url);
      
      // Route handling
      if (url.pathname === '/api/process' && request.method === 'POST') {
        const data = await request.json();
        
        // Validate input
        if (!data.repositoryUrl) {
          return new Response(JSON.stringify({ error: 'Repository URL is required' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        if (!data.targetPlatform) {
          data.targetPlatform = 'none'; // Default to 'none' if not specified
        }

        // Process the repository
        const result = await processRepository(data.repositoryUrl, data.targetPlatform, env);
        
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Handle download request for processed repository
      if (url.pathname.startsWith('/api/download/') && request.method === 'GET') {
        const fileId = url.pathname.replace('/api/download/', '');
        
        if (!fileId) {
          return new Response(JSON.stringify({ error: 'File ID is required' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        // Get the file from R2 storage
        const file = await env.DELOVABLE_BUCKET.get(fileId);
        
        if (!file) {
          return new Response(JSON.stringify({ error: 'File not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        // Return the file for download
        return new Response(file.body, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="delovable-${fileId}.zip"`,
            ...corsHeaders
          }
        });
      }
      
      // Health check endpoint
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Handle 404 for all other routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
      
    } catch (error) {
      // Handle errors
      console.error('Worker error:', error);
      
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};
