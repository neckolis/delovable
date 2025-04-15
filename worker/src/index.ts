/**
 * Delovable Worker API
 *
 * This worker handles GitHub repository processing for the delovable tool.
 * It provides an API endpoint to clean Lovable metadata from GitHub repositories.
 */

import { Env, GitHubAuthState } from './types';
import { handleCORS, createCORSHeaders } from './cors';
import { processRepository } from './repository';
import { generateOAuthUrl, handleOAuthCallback } from './github';

// Helper function to log request details
function logRequest(request: Request, url: URL) {
  console.log('Request method:', request.method);
  console.log('Request URL:', url.toString());
  console.log('Request headers:', Object.fromEntries([...request.headers.entries()]));
  console.log('Request pathname:', url.pathname);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    // Add CORS headers to all responses
    const corsHeaders = createCORSHeaders(request);

    try {
      const url = new URL(request.url);

      // Log request details
      logRequest(request, url);

      // Health check endpoint
      if (url.pathname === '/api/health') {
        console.log('Health check requested');
        return new Response(JSON.stringify({ status: 'ok', environment: env.WORKER_ENV }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Route handling
      if (url.pathname === '/api/process' && request.method === 'POST') {
        console.log('Processing repository request received');
        const data = await request.json();

        console.log('Request body:', data);

        // Validate input
        if (!data.repositoryUrl) {
          console.error('Repository URL is required');
          return new Response(JSON.stringify({ error: 'Repository URL is required' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        if (!data.targetPlatform) {
          console.log('No target platform specified, defaulting to "none"');
          data.targetPlatform = 'none'; // Default to 'none' if not specified
        }

        console.log('Processing repository:', data.repositoryUrl, 'for platform:', data.targetPlatform);

        try {
          // Process the repository
          const result = await processRepository(data.repositoryUrl, data.targetPlatform, env);

          console.log('Repository processed successfully:', result);

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error processing repository:', error);

          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to process repository',
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

      // Handle download request for processed repository
      if (url.pathname.startsWith('/api/download/') && request.method === 'GET') {
        console.log('Download request received');
        const fileId = url.pathname.replace('/api/download/', '');
        console.log('Requested file ID:', fileId);

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
        console.log('Fetching file from R2 bucket:', env.DELOVABLE_BUCKET.name);
        const file = await env.DELOVABLE_BUCKET.get(fileId);

        if (!file) {
          console.error('File not found in R2 bucket:', fileId);
          return new Response(JSON.stringify({ error: 'File not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // Return the file for download
        console.log('File found, returning for download');
        return new Response(file.body, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="delovable-${fileId}.zip"`,
            ...corsHeaders
          }
        });
      }

      // Handle GitHub OAuth initiation
      if (url.pathname === '/api/github/auth' && request.method === 'POST') {
        console.log('GitHub OAuth initiation request received');

        try {
          const data = await request.json();
          console.log('Request body:', data);

          if (!data.fileId || !data.redirectUrl || !data.newRepoName) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Missing required parameters'
            }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }

          // Create state object
          const state: GitHubAuthState = {
            redirectUrl: data.redirectUrl,
            originalFileId: data.fileId,
            newRepoName: data.newRepoName,
            newRepoDescription: data.newRepoDescription,
            isPrivate: data.isPrivate === true
          };

          // Encode state as base64
          const stateParam = btoa(JSON.stringify(state));

          // Generate OAuth URL
          const oauthUrl = generateOAuthUrl(
            env.GITHUB_CLIENT_ID,
            stateParam,
            `${url.origin}/api/github/callback`
          );

          return new Response(JSON.stringify({
            success: true,
            oauthUrl
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error initiating GitHub OAuth:', error);

          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to initiate GitHub OAuth',
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

      // Handle GitHub OAuth callback
      if (url.pathname === '/api/github/callback' && request.method === 'GET') {
        console.log('GitHub OAuth callback received');
        return handleOAuthCallback(request, env);
      }

      // Catch-all for unhandled routes
      console.log('Unhandled route:', url.pathname);
      return new Response(JSON.stringify({ error: 'Not found', path: url.pathname }), {
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
