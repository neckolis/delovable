/**
 * Cloudflare Pages API client
 */

export interface CloudflareAuthOptions {
  redirectUrl: string;
}

export interface CloudflareDeployOptions {
  repositoryUrl: string;
  repositoryOwner: string;
  repositoryName: string;
  branch?: string;
}

export interface CloudflareAuthResponse {
  success: boolean;
  authUrl?: string;
  error?: string;
}

export interface CloudflareDeployResponse {
  success: boolean;
  deploymentUrl?: string;
  error?: string;
}

/**
 * Initiate Cloudflare OAuth flow
 */
export async function initiateCloudflareAuth(
  options: CloudflareAuthOptions
): Promise<CloudflareAuthResponse> {
  try {
    const response = await fetch('/api/integrations/cloudflare/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to initiate Cloudflare auth: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error initiating Cloudflare auth:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deploy repository to Cloudflare Pages
 */
export async function deployToCloudflarePages(
  options: CloudflareDeployOptions
): Promise<CloudflareDeployResponse> {
  try {
    const response = await fetch('/api/integrations/cloudflare/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to deploy to Cloudflare Pages: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deploying to Cloudflare Pages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
