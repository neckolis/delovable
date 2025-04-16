/**
 * GitHub OAuth and repository creation functionality
 */

import { Env, GitHubAuthState, GitHubTokenResponse, GitHubCreateRepoRequest, GitHubCreateRepoResponse } from './types';

// GitHub API endpoints
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

/**
 * Convert an ArrayBuffer to a base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  // Convert ArrayBuffer to Uint8Array
  const bytes = new Uint8Array(buffer);

  // Use TextEncoder/TextDecoder API for binary data
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  // Use btoa for base64 encoding
  return btoa(binary);
}

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
  console.log('Client ID:', clientId ? 'Present' : 'Missing');
  console.log('Client Secret:', clientSecret ? 'Present' : 'Missing');
  console.log('Redirect URI:', redirectUri);

  try {
    // Let's try a completely different approach - using a direct HTTP request with minimal headers
    console.log('Attempting direct HTTP request for token exchange');

    // Create a simple request with minimal headers
    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Delovable-GitHub-App',
      },
      body: `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`,
    };

    // Log the request we're about to make (redacting sensitive info)
    console.log('Making token request with options:', {
      method: requestOptions.method,
      headers: requestOptions.headers,
      bodyLength: requestOptions.body.length,
    });

    // Make the request
    const response = await fetch('https://github.com/login/oauth/access_token', requestOptions);

    console.log('Token response status:', response.status);
    console.log('Token response headers:', Object.fromEntries([...response.headers.entries()]));

    // Get the full response text
    const responseText = await response.text();
    console.log('Raw response text (first 100 chars):', responseText.substring(0, 100));

    // If the response is not OK, handle the error
    if (!response.ok) {
      console.error('Failed to exchange code for token:', response.status, response.statusText);
      console.error('Error response text:', responseText);

      // Provide a more helpful error message
      if (response.status === 403) {
        throw new Error('GitHub authorization failed (403 Forbidden). Please check your OAuth app configuration.');
      } else {
        throw new Error(`Failed to exchange code for token: ${response.status} ${response.statusText}`);
      }
    }

    // First, try to handle it as a URL-encoded response
    if (responseText.includes('access_token=')) {
      console.log('Response appears to be URL-encoded');
      const urlParams = new URLSearchParams(responseText);
      const accessToken = urlParams.get('access_token');
      const tokenType = urlParams.get('token_type');
      const scope = urlParams.get('scope');

      if (accessToken) {
        console.log('Found access token in URL-encoded format');
        return {
          access_token: accessToken,
          token_type: tokenType || 'bearer',
          scope: scope || '',
        };
      } else {
        console.error('No access token found in URL-encoded response');
      }
    }

    // If not URL-encoded, try JSON
    try {
      const data = JSON.parse(responseText);
      console.log('Successfully parsed response as JSON');

      if (data.access_token) {
        console.log('Found access token in JSON response');
        return {
          access_token: data.access_token,
          token_type: data.token_type || 'bearer',
          scope: data.scope || '',
        };
      } else {
        console.error('No access token in JSON response:', data);
        throw new Error('No access token in GitHub response');
      }
    } catch (jsonError) {
      console.error('Failed to parse response as JSON:', jsonError);

      // If we get here, we couldn't parse the response in any expected format
      console.error('Could not extract access token from response');

      // Check for specific error messages in the response
      if (responseText.includes('Request forbidden by administrative rules')) {
        throw new Error('GitHub OAuth request forbidden. Please check your OAuth app configuration.');
      }

      if (responseText.includes('bad_verification_code')) {
        throw new Error('Invalid authorization code. The code may have expired or been used already.');
      }

      // Return a generic error with the response content
      throw new Error('Could not parse GitHub response: ' + responseText.substring(0, 100));
    }
  } catch (error) {
    console.error('Error in exchangeCodeForToken:', error);
    throw error;
  }
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
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Delovable-GitHub-App/1.0.0',
    },
    body: JSON.stringify(repoData),
  });

  // Get the response as text first
  const responseText = await response.text();
  console.log('Repository creation response status:', response.status);
  console.log('Raw response text (first 200 chars):', responseText.substring(0, 200));

  if (!response.ok) {
    console.error('Failed to create repository:', response.status, response.statusText);

    // Try to parse the error response as JSON, but handle non-JSON responses
    try {
      const errorData = JSON.parse(responseText);
      console.error('Error response:', errorData);
      throw new Error(`Failed to create repository: ${errorData.message || response.statusText}`);
    } catch (jsonError) {
      // If we can't parse as JSON, use the raw text
      console.error('Error response is not valid JSON:', jsonError);
      throw new Error(`Failed to create repository: ${responseText.substring(0, 100)}`);
    }
  }

  // Try to parse the success response as JSON
  try {
    return JSON.parse(responseText);
  } catch (jsonError) {
    console.error('Failed to parse repository response as JSON:', jsonError);
    throw new Error('Repository was created but response could not be parsed as JSON');
  }
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
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Delovable-GitHub-App/1.0.0',
    },
    body: JSON.stringify({
      message: 'Initial commit from Delovable',
      content: btoa('# Cleaned Repository\n\nThis repository was created using Delovable to remove Lovable metadata.'),
    }),
  });

  // Get the response as text first
  const readmeResponseText = await readmeResponse.text();
  console.log('README creation response status:', readmeResponse.status);

  if (!readmeResponse.ok) {
    console.error('Failed to create README:', readmeResponse.status, readmeResponse.statusText);
    console.error('Raw response text:', readmeResponseText);

    // Try to parse the error response as JSON, but handle non-JSON responses
    try {
      const errorData = JSON.parse(readmeResponseText);
      console.error('Error response:', errorData);
      throw new Error(`Failed to initialize repository: ${errorData.message || readmeResponse.statusText}`);
    } catch (jsonError) {
      // If we can't parse as JSON, use the raw text
      console.error('Error response is not valid JSON:', jsonError);
      throw new Error(`Failed to initialize repository: ${readmeResponseText.substring(0, 100)}`);
    }
  }

  // Create a delovable.json file with metadata about the cleaning process
  const metadataResponse = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/delovable.json`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Delovable-GitHub-App/1.0.0',
    },
    body: JSON.stringify({
      message: 'Add Delovable metadata',
      content: btoa(JSON.stringify({
        cleaned: true,
        timestamp: new Date().toISOString(),
        source: 'Delovable Web UI',
        version: '1.0.0'
      }, null, 2)),
    }),
  });

  // Get the response as text first
  const metadataResponseText = await metadataResponse.text();
  console.log('Metadata creation response status:', metadataResponse.status);

  if (!metadataResponse.ok) {
    console.error('Failed to create metadata file:', metadataResponse.status, metadataResponse.statusText);
    console.error('Raw response text:', metadataResponseText);

    // We'll continue even if this fails, as it's not critical
    try {
      const errorData = JSON.parse(metadataResponseText);
      console.error('Error response:', errorData);
    } catch (jsonError) {
      console.error('Error response is not valid JSON:', jsonError);
    }
  }

  // Create a .delovable directory with the original ZIP file for reference
  const zipResponse = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/.delovable/original.zip`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Delovable-GitHub-App/1.0.0',
    },
    body: JSON.stringify({
      message: 'Add original ZIP file for reference',
      content: arrayBufferToBase64(zipBuffer),
    }),
  });

  // Get the response as text first
  const zipResponseText = await zipResponse.text();
  console.log('ZIP file upload response status:', zipResponse.status);

  if (!zipResponse.ok) {
    console.error('Failed to upload ZIP file:', zipResponse.status, zipResponse.statusText);
    console.error('Raw response text:', zipResponseText);

    // We'll continue even if this fails, as it's not critical
    try {
      const errorData = JSON.parse(zipResponseText);
      console.error('Error response:', errorData);
    } catch (jsonError) {
      console.error('Error response is not valid JSON:', jsonError);
    }
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
  // Only show the code if explicitly requested
  const showCode = false;

  // Log all request details for debugging
  console.log('OAuth callback received');
  console.log('Full URL:', url.toString());
  console.log('Request headers:', Object.fromEntries([...request.headers.entries()]));
  console.log('All URL parameters:', Object.fromEntries([...url.searchParams.entries()]));
  console.log('Code parameter:', code);
  console.log('State parameter:', stateParam ? stateParam.substring(0, 10) + '...' : '[MISSING]');
  console.log('Show code parameter:', showCode);

  // If show_code=true is in the URL, display the code for debugging
  if (showCode && code) {
    const html = '<!DOCTYPE html>' +
      '<html>' +
      '  <head>' +
      '    <title>GitHub OAuth Code</title>' +
      '    <style>' +
      '      body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }' +
      '      .code-box { background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }' +
      '      .code { font-family: monospace; font-size: 18px; font-weight: bold; }' +
      '      button { padding: 10px 15px; background: #0366d6; color: white; border: none; border-radius: 5px; cursor: pointer; }' +
      '      button:hover { background: #0256b9; }' +
      '      .debug-form { margin-top: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }' +
      '      .debug-form input { padding: 8px; margin: 5px 0; width: 100%; }' +
      '      .debug-form button { margin-top: 10px; }' +
      '    </style>' +
      '  </head>' +
      '  <body>' +
      '    <h1>GitHub OAuth Authorization Code</h1>' +
      '    <p>Here is your GitHub authorization code:</p>' +
      '    <div class="code-box">' +
      '      <div class="code">' + code + '</div>' +
      '    </div>' +
      '    <p>Copy this code and use it in the debug tool.</p>' +
      '    <button onclick="copyCode()">Copy Code</button>' +
      '    <a href="/debug"><button style="margin-left: 10px;">Go to Debug Tool</button></a>' +
      '    ' +
      '    <div class="debug-form">' +
      '      <h2>Quick Debug Form</h2>' +
      '      <form id="oauth-form">' +
      '        <div>' +
      '          <label for="client-id">Client ID:</label><br>' +
      '          <input type="text" id="client-id" name="client_id" value="' + (env.GITHUB_CLIENT_ID || '') + '" required>' +
      '        </div>' +
      '        <div>' +
      '          <label for="client-secret">Client Secret:</label><br>' +
      '          <input type="password" id="client-secret" name="client_secret" placeholder="Enter your client secret" required>' +
      '        </div>' +
      '        <div>' +
      '          <label for="code">Authorization Code:</label><br>' +
      '          <input type="text" id="code" name="code" value="' + code + '" required>' +
      '        </div>' +
      '        <div>' +
      '          <label for="redirect-uri">Redirect URI:</label><br>' +
      '          <input type="text" id="redirect-uri" name="redirect_uri" value="' + url.origin + '/api/github/callback" required>' +
      '        </div>' +
      '        <button type="submit">Exchange Code for Token</button>' +
      '      </form>' +
      '      <div id="result" style="margin-top: 20px;"></div>' +
      '    </div>' +
      '    ' +
      '    <script>' +
      '      function copyCode() {' +
      '        navigator.clipboard.writeText("' + code + '").then(() => {' +
      '          alert("Code copied to clipboard!");' +
      '        });' +
      '      }' +
      '      ' +
      '      document.getElementById("oauth-form").addEventListener("submit", async function(e) {' +
      '        e.preventDefault();' +
      '        ' +
      '        const resultDiv = document.getElementById("result");' +
      '        resultDiv.innerHTML = "<p>Sending request...</p>";' +
      '        ' +
      '        const formData = new FormData(this);' +
      '        const params = new URLSearchParams();' +
      '        ' +
      '        for (const [key, value] of formData.entries()) {' +
      '          params.append(key, value);' +
      '        }' +
      '        ' +
      '        try {' +
      '          // Use our worker as a proxy instead of calling GitHub directly (to avoid CORS issues)' +
      '          const response = await fetch("/api/github/token-proxy", {' +
      '            method: "POST",' +
      '            headers: {' +
      '              "Content-Type": "application/x-www-form-urlencoded"' +
      '            },' +
      '            body: params.toString()' +
      '          });' +
      '          ' +
      '          resultDiv.innerHTML = "<p>Response status: " + response.status + " " + response.statusText + "</p>";' +
      '          ' +
      '          const text = await response.text();' +
      '          resultDiv.innerHTML += "<p>Raw response:</p><pre style=\"background:#f5f5f5;padding:10px;overflow-x:auto;\">" + text + "</pre>";' +
      '          ' +
      '          try {' +
      '            const json = JSON.parse(text);' +
      '            resultDiv.innerHTML += "<p>Parsed as JSON:</p><pre style=\"background:#f5f5f5;padding:10px;overflow-x:auto;\">" + ' +
      '              JSON.stringify(json, null, 2) + ' +
      '              "</pre>";' +
      '              ' +
      '            if (json.access_token) {' +
      '              resultDiv.innerHTML += "<p style=\"color:green;\">Successfully obtained access token!</p>";' +
      '            } else {' +
      '              resultDiv.innerHTML += "<p style=\"color:red;\">No access token in response.</p>";' +
      '            }' +
      '          } catch (e) {' +
      '            resultDiv.innerHTML += "<p style=\"color:red;\">Not valid JSON. Trying as URL-encoded:</p>";' +
      '            ' +
      '            if (text.includes("access_token=")) {' +
      '              const urlParams = new URLSearchParams(text);' +
      '              const accessToken = urlParams.get("access_token");' +
      '              ' +
      '              resultDiv.innerHTML += "<pre style=\"background:#f5f5f5;padding:10px;overflow-x:auto;\">" + ' +
      '                JSON.stringify(Object.fromEntries([...urlParams.entries()]), null, 2) + ' +
      '                "</pre>";' +
      '                ' +
      '              if (accessToken) {' +
      '                resultDiv.innerHTML += "<p style=\"color:green;\">Successfully obtained access token!</p>";' +
      '              } else {' +
      '                resultDiv.innerHTML += "<p style=\"color:red;\">No access token in URL-encoded response.</p>";' +
      '              }' +
      '            } else {' +
      '              resultDiv.innerHTML += "<p style=\"color:red;\">Could not extract access token from response.</p>";' +
      '            }' +
      '          }' +
      '        } catch (error) {' +
      '          resultDiv.innerHTML = "<p style=\"color:red;\">Error: " + error.message + "</p>";' +
      '        }' +
      '      });' +
      '    </script>' +
      '  </body>' +
      '</html>';

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (!code || !stateParam) {
    console.error('Missing code or state parameter');

    // Create a more helpful error page instead of just returning JSON
    const errorHtml = '<!DOCTYPE html>' +
      '<html>' +
      '  <head>' +
      '    <title>GitHub OAuth Error</title>' +
      '    <style>' +
      '      body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }' +
      '      .error-box { background: #fff0f0; border: 1px solid #ffcaca; padding: 20px; border-radius: 5px; margin: 20px 0; }' +
      '      h1 { color: #e53e3e; }' +
      '      pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }' +
      '      .debug-info { margin-top: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }' +
      '    </style>' +
      '  </head>' +
      '  <body>' +
      '    <h1>GitHub OAuth Error</h1>' +
      '    <div class="error-box">' +
      '      <h2>Missing Required Parameters</h2>' +
      '      <p>The GitHub OAuth callback is missing required parameters (code or state).</p>' +
      '    </div>' +
      '    <div class="debug-info">' +
      '      <h3>Debug Information</h3>' +
      '      <p>URL: ' + url.toString() + '</p>' +
      '      <p>Code parameter: ' + (code || 'Missing') + '</p>' +
      '      <p>State parameter: ' + (stateParam ? 'Present' : 'Missing') + '</p>' +
      '      <h4>All URL Parameters:</h4>' +
      '      <pre>' + JSON.stringify(Object.fromEntries([...url.searchParams.entries()]), null, 2) + '</pre>' +
      '    </div>' +
      '    <p><a href="/debug">Go to Debug Tool</a></p>' +
      '  </body>' +
      '</html>';

    return new Response(errorHtml, {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  let redirectUrl = '/';

  try {
    // Parse the state parameter
    console.log('Decoding state parameter...');
    let state: GitHubAuthState;
    try {
      const decodedState = atob(stateParam);
      console.log('Decoded state:', decodedState);

      // Wrap JSON.parse in its own try-catch to handle parsing errors
      try {
        state = JSON.parse(decodedState);
      } catch (jsonError) {
        console.error('Error parsing state as JSON:', jsonError);
        console.error('Raw state content:', decodedState);
        throw new Error('Invalid state format - could not parse as JSON');
      }

      redirectUrl = state.redirectUrl; // Save for error handling
    } catch (parseError) {
      console.error('Error parsing state parameter:', parseError);
      throw new Error('Invalid state parameter');
    }

    console.log('State parsed successfully:', {
      redirectUrl: state.redirectUrl,
      originalFileId: state.originalFileId,
      newRepoName: state.newRepoName,
      isPrivate: state.isPrivate
    });

    // MANUAL TOKEN EXCHANGE - Bypass the exchangeCodeForToken function
    console.log('Manually exchanging code for token...');

    // Create the request body
    const params = new URLSearchParams();
    params.append('client_id', env.GITHUB_CLIENT_ID);
    params.append('client_secret', env.GITHUB_CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', `${url.origin}/api/github/callback`);

    // Make the request
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Delovable-OAuth-App',
      },
      body: params.toString(),
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries([...tokenResponse.headers.entries()]));

    // Get the response as text
    const responseText = await tokenResponse.text();
    console.log('Raw token response (first 100 chars):', responseText.substring(0, 100));

    // Extract the access token manually
    let accessToken = '';

    // Try parsing as JSON first
    try {
      // Check if the response starts with "Request fo" which indicates an error
      if (responseText.trim().startsWith('Request fo')) {
        console.error('Response appears to be an error message:', responseText);
        throw new Error('GitHub returned an error: ' + responseText.substring(0, 100));
      }

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText);
        console.log('Token response parsed as JSON');
        accessToken = data.access_token;
      } catch (jsonError) {
        console.error('Failed to parse as JSON:', jsonError);

        // If not JSON, try as URL-encoded
        console.log('Token response is not JSON, trying URL-encoded format');
        if (responseText.includes('access_token=')) {
          const urlParams = new URLSearchParams(responseText);
          accessToken = urlParams.get('access_token') || '';
        } else {
          console.error('Response does not contain access_token');
          throw new Error('GitHub response format not recognized');
        }
      }
    } catch (e) {
      console.error('Error processing token response:', e);
      throw e;
    }

    if (!accessToken) {
      console.error('Failed to extract access token from response');
      throw new Error('Could not get access token from GitHub');
    }

    console.log('Successfully extracted access token');

    // Get the original ZIP file from R2
    console.log('Fetching original file from R2:', state.originalFileId);
    const zipFile = await env.DELOVABLE_BUCKET.get(state.originalFileId);

    if (!zipFile) {
      console.error('Original file not found in R2 bucket');
      throw new Error('Original file not found');
    }

    // Create a new repository
    console.log('Creating new GitHub repository:', state.newRepoName);
    const repoResponse = await createRepository(accessToken, {
      name: state.newRepoName,
      description: state.newRepoDescription || 'Repository created with Delovable',
      private: state.isPrivate,
      auto_init: false, // We'll upload our own files
    });

    // Upload the files to the repository
    console.log('Reading ZIP file contents...');
    const zipBuffer = await zipFile.arrayBuffer();

    // Get the user's GitHub username
    console.log('Fetching GitHub user information...');
    const userResponse = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Delovable-GitHub-App/1.0.0',
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to get user information:', userResponse.status, userResponse.statusText);
      throw new Error('Failed to get user information');
    }

    const userData = await userResponse.json();
    const username = userData.login;
    console.log('GitHub username:', username);

    console.log('Uploading files to repository...');
    await uploadFilesToRepository(
      accessToken,
      username,
      repoResponse.name,
      zipBuffer
    );

    console.log('Repository created successfully:', repoResponse.html_url);

    // Redirect back to the web UI with success
    return Response.redirect(`${state.redirectUrl}?success=true&repo_url=${encodeURIComponent(repoResponse.html_url)}`);
  } catch (error) {
    console.error('Error handling OAuth callback:', error);

    // Redirect back to the web UI with error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.redirect(`${redirectUrl}?success=false&error=${encodeURIComponent(errorMessage)}`);
  }
}
