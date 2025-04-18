import { NextApiRequest, NextApiResponse } from 'next';

// Cloudflare OAuth configuration
const CLOUDFLARE_CLIENT_ID = process.env.CLOUDFLARE_CLIENT_ID || '';
const CLOUDFLARE_OAUTH_URL = 'https://dash.cloudflare.com/oauth2/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { redirectUrl } = req.body;

    if (!redirectUrl) {
      return res.status(400).json({ success: false, error: 'Missing redirectUrl parameter' });
    }

    if (!CLOUDFLARE_CLIENT_ID) {
      return res.status(500).json({ 
        success: false, 
        error: 'Cloudflare OAuth is not configured. Please set CLOUDFLARE_CLIENT_ID environment variable.' 
      });
    }

    // Generate a random state parameter to prevent CSRF attacks
    const state = Buffer.from(JSON.stringify({
      redirectUrl,
      timestamp: Date.now(),
    })).toString('base64');

    // Store the state in a cookie or session for validation when the user returns

    // Construct the Cloudflare OAuth URL
    const authUrl = new URL(CLOUDFLARE_OAUTH_URL);
    authUrl.searchParams.append('client_id', CLOUDFLARE_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_API_URL || ''}/api/integrations/cloudflare/callback`);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'account:read user:read pages:write');
    authUrl.searchParams.append('state', state);

    return res.status(200).json({
      success: true,
      authUrl: authUrl.toString(),
    });
  } catch (error) {
    console.error('Error initiating Cloudflare OAuth:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate Cloudflare OAuth',
    });
  }
}
