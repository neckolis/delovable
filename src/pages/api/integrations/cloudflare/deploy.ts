import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { repositoryUrl, repositoryOwner, repositoryName } = req.body;

    if (!repositoryUrl || !repositoryOwner || !repositoryName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: repositoryUrl, repositoryOwner, repositoryName' 
      });
    }

    // Get the Cloudflare access token from the session or cookie
    const accessToken = req.cookies.cloudflareAccessToken;

    if (!accessToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated with Cloudflare. Please connect your account first.' 
      });
    }

    // Get the Cloudflare account ID
    const accountResponse = await fetch('https://api.cloudflare.com/client/v4/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!accountResponse.ok) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to get Cloudflare account information' 
      });
    }

    const accountData = await accountResponse.json();
    
    if (!accountData.success || !accountData.result || accountData.result.length === 0) {
      return res.status(500).json({ 
        success: false, 
        error: 'No Cloudflare accounts found for this user' 
      });
    }

    const accountId = accountData.result[0].id;

    // Create a new Cloudflare Pages project
    const projectName = repositoryName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    const createProjectResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        source: {
          type: 'github',
          config: {
            owner: repositoryOwner,
            repo_name: repositoryName,
            production_branch: 'main',
            pr_comments_enabled: true,
            deployments_enabled: true,
          },
        },
        build_config: {
          build_command: 'npm run build',
          destination_dir: 'build',
          root_dir: '',
        },
      }),
    });

    if (!createProjectResponse.ok) {
      const errorData = await createProjectResponse.json();
      return res.status(500).json({ 
        success: false, 
        error: `Failed to create Cloudflare Pages project: ${errorData.errors?.[0]?.message || 'Unknown error'}` 
      });
    }

    const projectData = await createProjectResponse.json();
    
    if (!projectData.success) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create Cloudflare Pages project' 
      });
    }

    // Trigger a deployment
    const deploymentResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!deploymentResponse.ok) {
      // Even if deployment trigger fails, the project was created successfully
      return res.status(200).json({
        success: true,
        deploymentUrl: `https://${projectName}.pages.dev`,
        message: 'Project created successfully, but deployment could not be triggered automatically. It will deploy when you push to the repository.',
      });
    }

    return res.status(200).json({
      success: true,
      deploymentUrl: `https://${projectName}.pages.dev`,
      message: 'Project created and deployment triggered successfully',
    });
  } catch (error) {
    console.error('Error deploying to Cloudflare Pages:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to deploy to Cloudflare Pages',
    });
  }
}
