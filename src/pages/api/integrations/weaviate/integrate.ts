import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { repositoryUrl, repositoryOwner, repositoryName, language, createPullRequest = true } = req.body;

    if (!repositoryUrl || !repositoryOwner || !repositoryName || !language) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: repositoryUrl, repositoryOwner, repositoryName, language' 
      });
    }

    // Validate language
    const supportedLanguages = ['typescript', 'javascript', 'python'];
    if (!supportedLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        error: `Unsupported language: ${language}. Supported languages are: ${supportedLanguages.join(', ')}` 
      });
    }

    // Get GitHub access token from session or cookie
    const accessToken = req.cookies.githubAccessToken;

    if (!accessToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated with GitHub. Please connect your account first.' 
      });
    }

    // Create a new branch for the integration
    const branchName = `feature/add-weaviate-integration-${Date.now()}`;
    
    // Get the default branch
    const repoResponse = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Delovable-App',
      },
    });

    if (!repoResponse.ok) {
      return res.status(repoResponse.status).json({ 
        success: false, 
        error: `Failed to fetch repository information: ${repoResponse.statusText}` 
      });
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch;

    // Get the reference to the default branch
    const refResponse = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/git/refs/heads/${defaultBranch}`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Delovable-App',
      },
    });

    if (!refResponse.ok) {
      return res.status(refResponse.status).json({ 
        success: false, 
        error: `Failed to fetch branch reference: ${refResponse.statusText}` 
      });
    }

    const refData = await refResponse.json();
    const sha = refData.object.sha;

    // Create a new branch
    const createBranchResponse = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/git/refs`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Delovable-App',
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha,
      }),
    });

    if (!createBranchResponse.ok) {
      return res.status(createBranchResponse.status).json({ 
        success: false, 
        error: `Failed to create branch: ${createBranchResponse.statusText}` 
      });
    }

    // Determine file extensions and directory structure based on language
    let clientFilePath, exampleFilePath, fileExtension, directory;
    
    switch (language.toLowerCase()) {
      case 'typescript':
        fileExtension = '.ts';
        directory = 'src/lib/weaviate';
        clientFilePath = `${directory}/weaviate-client${fileExtension}`;
        exampleFilePath = `${directory}/example-search${fileExtension}`;
        break;
      case 'javascript':
        fileExtension = '.js';
        directory = 'src/lib/weaviate';
        clientFilePath = `${directory}/weaviate-client${fileExtension}`;
        exampleFilePath = `${directory}/example-search${fileExtension}`;
        break;
      case 'python':
        fileExtension = '.py';
        directory = 'weaviate';
        clientFilePath = `${directory}/weaviate_client${fileExtension}`;
        exampleFilePath = `${directory}/example_search${fileExtension}`;
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          error: `Unsupported language: ${language}` 
        });
    }

    // Read template files
    const templateDir = path.join(process.cwd(), 'src/lib/integrations/templates', language.toLowerCase());
    
    let clientTemplate, exampleTemplate;
    
    try {
      if (language.toLowerCase() === 'python') {
        clientTemplate = fs.readFileSync(path.join(templateDir, 'weaviate_client.py'), 'utf8');
        exampleTemplate = fs.readFileSync(path.join(templateDir, 'example_search.py'), 'utf8');
      } else {
        clientTemplate = fs.readFileSync(path.join(templateDir, `weaviate-client${fileExtension}`), 'utf8');
        exampleTemplate = fs.readFileSync(path.join(templateDir, `example-search${fileExtension}`), 'utf8');
      }
    } catch (error) {
      console.error('Error reading template files:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to read template files' 
      });
    }

    // Create the directory in the repository
    const createDirResponse = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/contents/${directory}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Delovable-App',
      },
      body: JSON.stringify({
        message: 'Create directory for Weaviate integration',
        content: Buffer.from('# Weaviate Integration').toString('base64'),
        path: `${directory}/README.md`,
        branch: branchName,
      }),
    });

    // Upload the client file
    const createClientFileResponse = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/contents/${clientFilePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Delovable-App',
      },
      body: JSON.stringify({
        message: 'Add Weaviate client',
        content: Buffer.from(clientTemplate).toString('base64'),
        branch: branchName,
      }),
    });

    if (!createClientFileResponse.ok) {
      return res.status(createClientFileResponse.status).json({ 
        success: false, 
        error: `Failed to create client file: ${createClientFileResponse.statusText}` 
      });
    }

    // Upload the example file
    const createExampleFileResponse = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/contents/${exampleFilePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Delovable-App',
      },
      body: JSON.stringify({
        message: 'Add Weaviate example search',
        content: Buffer.from(exampleTemplate).toString('base64'),
        branch: branchName,
      }),
    });

    if (!createExampleFileResponse.ok) {
      return res.status(createExampleFileResponse.status).json({ 
        success: false, 
        error: `Failed to create example file: ${createExampleFileResponse.statusText}` 
      });
    }

    // Create a pull request if requested
    let pullRequestUrl = '';
    
    if (createPullRequest) {
      const createPrResponse = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/pulls`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Delovable-App',
        },
        body: JSON.stringify({
          title: 'Add Weaviate Integration',
          body: `This PR adds Weaviate vector database integration to your project.

## What's included:
- Weaviate client for ${language}
- Example search implementation
- Basic document schema

## Next steps:
1. Review the code and customize it for your needs
2. Install the Weaviate client library
3. Configure your Weaviate instance

Created by [Delovable](https://delovable.dev)`,
          head: branchName,
          base: defaultBranch,
        }),
      });

      if (createPrResponse.ok) {
        const prData = await createPrResponse.json();
        pullRequestUrl = prData.html_url;
      }
    }

    return res.status(200).json({
      success: true,
      branch: branchName,
      pullRequestUrl,
      message: 'Weaviate integration added successfully',
    });
  } catch (error) {
    console.error('Error integrating Weaviate:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to integrate Weaviate',
    });
  }
}
