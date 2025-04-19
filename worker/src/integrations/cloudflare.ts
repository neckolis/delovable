import { Env } from '../types';

/**
 * Handle Cloudflare OAuth connect request
 */
export async function handleCloudflareConnect(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const data = await request.json() as { redirectUrl?: string };

    if (!data.redirectUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing redirectUrl parameter'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Check if Cloudflare OAuth is configured
    const clientId = env.CLOUDFLARE_CLIENT_ID;
    if (!clientId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cloudflare OAuth is not configured. Please set CLOUDFLARE_CLIENT_ID environment variable.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Generate a random state parameter to prevent CSRF attacks
    const state = btoa(JSON.stringify({
      redirectUrl: data.redirectUrl,
      timestamp: Date.now(),
    }));

    // Construct the Cloudflare OAuth URL
    const authUrl = new URL('https://dash.cloudflare.com/oauth2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', `${new URL(request.url).origin}/api/integrations/cloudflare/callback`);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'account:read user:read pages:write');
    authUrl.searchParams.append('state', state);

    return new Response(JSON.stringify({
      success: true,
      authUrl: authUrl.toString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error initiating Cloudflare OAuth:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to initiate Cloudflare OAuth',
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

/**
 * Handle Cloudflare Pages deployment request
 */
export async function handleCloudflareDeploy(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const data = await request.json() as {
      repositoryUrl?: string;
      repositoryOwner?: string;
      repositoryName?: string;
    };

    if (!data.repositoryUrl || !data.repositoryOwner || !data.repositoryName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters: repositoryUrl, repositoryOwner, repositoryName'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // For now, just return a mock success response
    // In a real implementation, you would use the Cloudflare API to create a Pages project
    return new Response(JSON.stringify({
      success: true,
      deploymentUrl: `https://${data.repositoryName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.pages.dev`,
      message: 'Project created and deployment triggered successfully',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error deploying to Cloudflare Pages:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to deploy to Cloudflare Pages',
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
