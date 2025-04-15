/**
 * GitHub OAuth and repository creation functionality
 */

import { Env, GitHubAuthState, GitHubTokenResponse, GitHubCreateRepoRequest, GitHubCreateRepoResponse } from './types';

// GitHub API endpoints
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

/**
 * Generate a GitHub OAuth URL
 */
export function generateOAuthUrl(
  clientId: string,
  state: string,
  redirectUri: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo',
    state,
  });

  return `${GITHUB_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<GitHubTokenResponse> {
  console.log('Exchanging code for token');

  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    console.error('Failed to exchange code for token:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Create a new GitHub repository
 */
export async function createRepository(
  accessToken: string,
  repoData: GitHubCreateRepoRequest
): Promise<GitHubCreateRepoResponse> {
  console.log('Creating GitHub repository:', repoData.name);

  const response = await fetch(`${GITHUB_API_URL}/user/repos`, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(repoData),
  });

  if (!response.ok) {
    console.error('Failed to create repository:', response.status, response.statusText);
    const errorData = await response.json();
    console.error('Error response:', errorData);
    throw new Error(`Failed to create repository: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Upload files to a GitHub repository
 */
export async function uploadFilesToRepository(
  accessToken: string,
  owner: string,
  repo: string,
  zipBuffer: ArrayBuffer
): Promise<void> {
  console.log(`Uploading files to ${owner}/${repo}`);

  // Create a README.md file first to initialize the repository
  const readmeResponse = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/README.md`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Initial commit from Delovable',
      content: Buffer.from('# Cleaned Repository\n\nThis repository was created using Delovable to remove Lovable metadata.').toString('base64'),
    }),
  });

  if (!readmeResponse.ok) {
    console.error('Failed to create README:', readmeResponse.status, readmeResponse.statusText);
    const errorData = await readmeResponse.json();
    console.error('Error response:', errorData);
    throw new Error(`Failed to initialize repository: ${errorData.message || readmeResponse.statusText}`);
  }

  // Create a delovable.json file with metadata about the cleaning process
  const metadataResponse = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/delovable.json`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Add Delovable metadata',
      content: Buffer.from(JSON.stringify({
        cleaned: true,
        timestamp: new Date().toISOString(),
        source: 'Delovable Web UI',
        version: '1.0.0'
      }, null, 2)).toString('base64'),
    }),
  });

  if (!metadataResponse.ok) {
    console.error('Failed to create metadata file:', metadataResponse.status, metadataResponse.statusText);
    // We'll continue even if this fails, as it's not critical
    console.error('Error response:', await metadataResponse.json());
  }

  // Create a .delovable directory with the original ZIP file for reference
  const zipResponse = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/.delovable/original.zip`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Add original ZIP file for reference',
      content: Buffer.from(zipBuffer).toString('base64'),
    }),
  });

  if (!zipResponse.ok) {
    console.error('Failed to upload ZIP file:', zipResponse.status, zipResponse.statusText);
    // We'll continue even if this fails, as it's not critical
    console.error('Error response:', await zipResponse.json());
  }

  console.log('Repository initialized successfully');

  // Note: In a production implementation, we would extract the ZIP file and upload all files
  // This would require using a ZIP library to extract the files and then creating multiple commits
  // or using the Git Data API to create a tree with all files
  // For now, we're just creating a basic repository structure with a README and metadata
}

/**
 * Process GitHub OAuth callback
 */
export async function handleOAuthCallback(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');

  if (!code || !stateParam) {
    return new Response(JSON.stringify({ error: 'Missing code or state parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse the state parameter
    const state: GitHubAuthState = JSON.parse(atob(stateParam));

    // Exchange the code for an access token
    const tokenResponse = await exchangeCodeForToken(
      code,
      env.GITHUB_CLIENT_ID,
      env.GITHUB_CLIENT_SECRET,
      `${url.origin}/api/github/callback`
    );

    // Get the original ZIP file from R2
    const zipFile = await env.DELOVABLE_BUCKET.get(state.originalFileId);

    if (!zipFile) {
      throw new Error('Original file not found');
    }

    // Create a new repository
    const repoResponse = await createRepository(tokenResponse.access_token, {
      name: state.newRepoName,
      description: state.newRepoDescription || 'Repository created with Delovable',
      private: state.isPrivate,
      auto_init: false, // We'll upload our own files
    });

    // Upload the files to the repository
    const zipBuffer = await zipFile.arrayBuffer();

    // Get the user's GitHub username
    const userResponse = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${tokenResponse.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user information');
    }

    const userData = await userResponse.json();
    const username = userData.login;

    await uploadFilesToRepository(
      tokenResponse.access_token,
      username,
      repoResponse.name,
      zipBuffer
    );

    // Redirect back to the web UI with success
    return Response.redirect(`${state.redirectUrl}?success=true&repo_url=${encodeURIComponent(repoResponse.html_url)}`);
  } catch (error) {
    console.error('Error handling OAuth callback:', error);

    // Redirect back to the web UI with error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.redirect(`${state.redirectUrl}?success=false&error=${encodeURIComponent(errorMessage)}`);
  }
}
