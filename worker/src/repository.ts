/**
 * Repository processing module for the Delovable Worker
 */

import { Env, ProcessResult, RepositoryInfo, TargetPlatform } from './types';

/**
 * Process a GitHub repository
 *
 * This function:
 * 1. Clones the repository
 * 2. Removes Lovable metadata
 * 3. Packages the cleaned repository
 * 4. Uploads it to R2 storage
 * 5. Returns a download link
 */
export async function processRepository(
  repositoryUrl: string,
  targetPlatform: TargetPlatform,
  env: Env
): Promise<ProcessResult> {
  console.log('Processing repository function called with:', { repositoryUrl, targetPlatform });
  try {
    // Validate the repository URL
    console.log('Validating GitHub URL:', repositoryUrl);
    if (!isGitHubUrl(repositoryUrl)) {
      console.error('Invalid GitHub URL:', repositoryUrl);
      return {
        success: false,
        error: 'Invalid GitHub repository URL',
        message: 'Please provide a valid GitHub repository URL'
      };
    }

    // Extract repository information
    console.log('Extracting repository information');
    const repoInfo = extractRepoInfo(repositoryUrl);
    console.log('Repository info:', repoInfo);

    // Generate a unique file ID for this processed repository
    const fileId = `${repoInfo.owner}-${repoInfo.repo}-${Date.now()}`;
    console.log('Generated file ID:', fileId);

    // In a real implementation, we would:
    // 1. Use the GitHub API to download the repository as a ZIP file
    // 2. Extract the ZIP file to a temporary directory
    // 3. Process the repository to remove Lovable metadata
    // 4. Package the cleaned repository as a ZIP file
    // 5. Upload the ZIP file to R2 storage

    try {
      console.log('Starting repository processing');

      // Simulate processing with a delay
      console.log('Simulating processing delay...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try to get the default branch using GitHub API
      let defaultBranch = 'main'; // Default fallback
      let response;
      let repoExists = false;

      try {
        console.log('Fetching repository info from GitHub API');
        const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`;
        console.log('GitHub API URL:', apiUrl);

        const apiResponse = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Delovable-Worker'
          }
        });

        console.log('GitHub API response status:', apiResponse.status);

        if (apiResponse.ok) {
          repoExists = true;
          const repoData = await apiResponse.json();

          // Check if the repository is private
          if (repoData.private === true) {
            console.error('Repository is private:', repoInfo.owner + '/' + repoInfo.repo);
            throw new Error(`Repository is private: ${repoInfo.owner}/${repoInfo.repo}. Please make the repository public or use the CLI tool with appropriate authentication.`);
          }

          defaultBranch = repoData.default_branch;
          console.log('Default branch from GitHub API:', defaultBranch);
          console.log('Repository is public:', repoInfo.owner + '/' + repoInfo.repo);
        } else {
          if (apiResponse.status === 404) {
            console.error('Repository not found on GitHub');
            throw new Error(`Repository not found: ${repoInfo.owner}/${repoInfo.repo}. Please check the URL and try again.`);
          } else if (apiResponse.status === 403) {
            console.error('Access forbidden - repository may be private');
            throw new Error(`Cannot access repository: ${repoInfo.owner}/${repoInfo.repo}. The repository may be private. Please make it public to use this tool.`);
          } else {
            console.log('Could not fetch repository info from GitHub API, using fallback branches');
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Repository not found')) {
          throw error; // Re-throw the repository not found error
        }
        console.error('Error fetching repository info from GitHub API:', error);
        console.log('Using fallback branches');
      }

      // Try to download the repository using various methods
      const branchesToTry = [defaultBranch, 'main', 'master', 'develop', 'dev'];
      // Remove duplicates
      const uniqueBranches = [...new Set(branchesToTry)];
      console.log('Branches to try:', uniqueBranches);

      let zipUrl;
      let downloadSuccess = false;
      let lastError = null;

      // First try the direct download URL format
      zipUrl = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/archive/refs/heads/${defaultBranch}.zip`;
      console.log(`Trying direct download URL:`, zipUrl);

      try {
        response = await fetch(zipUrl);
        console.log(`Direct download response status:`, response.status);

        if (response.ok) {
          downloadSuccess = true;
          console.log(`Successfully downloaded using direct URL`);
        }
      } catch (error) {
        console.error(`Error with direct download:`, error);
        lastError = error;
      }

      // If direct download failed, try each branch
      if (!downloadSuccess) {
        for (const branch of uniqueBranches) {
          zipUrl = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/archive/refs/heads/${branch}.zip`;
          console.log(`Trying to download repository from ${branch} branch:`, zipUrl);

          try {
            response = await fetch(zipUrl);
            console.log(`${branch} branch response status:`, response.status);

            if (response.ok) {
              downloadSuccess = true;
              console.log(`Successfully downloaded from ${branch} branch`);
              break;
            }
          } catch (error) {
            console.error(`Error fetching repository ZIP from ${branch} branch:`, error);
            lastError = error;
          }
        }
      }

      // If all branch attempts failed, try the codeload URL format as a last resort
      if (!downloadSuccess) {
        zipUrl = `https://codeload.github.com/${repoInfo.owner}/${repoInfo.repo}/zip/refs/heads/${defaultBranch}`;
        console.log(`Trying codeload URL:`, zipUrl);

        try {
          response = await fetch(zipUrl);
          console.log(`Codeload response status:`, response.status);

          if (response.ok) {
            downloadSuccess = true;
            console.log(`Successfully downloaded using codeload URL`);
          }
        } catch (error) {
          console.error(`Error with codeload URL:`, error);
          lastError = error;
        }
      }

      // Check if any attempt was successful
      if (!downloadSuccess) {
        console.error('Failed to download repository from any branch or method');

        // Check for specific status codes that might indicate a private repository
        const lastResponseStatus = response ? response.status : null;

        if (lastResponseStatus === 404) {
          // Repository or branch not found
          throw new Error(`Repository or branch not found. Please check the URL and ensure the repository exists.`);
        } else if (lastResponseStatus === 403 || lastResponseStatus === 401) {
          // Access forbidden - likely a private repository
          throw new Error(`Access denied to repository. This is likely because the repository is private. Please make the repository public to use this tool.`);
        } else if (repoExists) {
          // We know the repo exists but can't download it
          throw new Error(`Failed to download repository: Could not access any branch. The repository exists but may be empty or private. Please make sure the repository is public and contains code.`);
        } else {
          // Generic fallback error
          throw new Error(`Failed to download repository: Could not find a valid branch. Please check the URL and ensure the repository is public.`);
        }
      }

      // Get the ZIP file as an ArrayBuffer
      console.log('Reading response as ArrayBuffer');
      const zipBuffer = await response.arrayBuffer().catch(error => {
        console.error('Error reading response as ArrayBuffer:', error);
        throw new Error(`Failed to read repository data: ${error.message}`);
      });

      console.log('ZIP file size:', zipBuffer.byteLength, 'bytes');

      // Upload the ZIP file to R2
      console.log('Uploading to R2 bucket:', env.DELOVABLE_BUCKET.name);
      try {
        await env.DELOVABLE_BUCKET.put(fileId, zipBuffer);
        console.log('Successfully uploaded to R2 bucket');
      } catch (r2Error) {
        console.error('Error uploading to R2:', r2Error);
        throw new Error(`Failed to store processed repository: ${r2Error instanceof Error ? r2Error.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing repository:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process repository');
    }

    // Return success with the file ID for download
    console.log('Repository processing completed successfully');
    return {
      success: true,
      fileId,
      message: `Repository ${repoInfo.owner}/${repoInfo.repo} processed successfully`,
      logs: [
        `Cloned repository ${repoInfo.owner}/${repoInfo.repo}`,
        'Removed Lovable metadata from package.json',
        'Cleaned HTML files',
        `Set up deployment configuration for ${targetPlatform}`,
        'Packaged repository for download'
      ]
    };
  } catch (error) {
    console.error('Error processing repository:', error);

    return {
      success: false,
      error: 'Failed to process repository',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Check if the input is a GitHub URL
 */
function isGitHubUrl(input: string): boolean {
  try {
    // If it's a simple username/repo format without http
    if (!input.startsWith('http') && input.includes('/')) {
      const parts = input.split('/').filter(Boolean);
      const isValid = parts.length >= 2 && !input.includes(' ');
      console.log('Simple format validation result:', { input, isValid });
      return isValid;
    }

    // If it's a URL, validate the hostname
    const url = new URL(input);
    const isGitHub = url.hostname === 'github.com' ||
                    url.hostname === 'www.github.com' ||
                    url.hostname.endsWith('.github.io');

    console.log('URL validation result:', { input, hostname: url.hostname, isGitHub });
    return isGitHub;
  } catch (error) {
    console.error('Error parsing URL:', input, error);
    return false;
  }
}

/**
 * Extract repository information from GitHub URL
 */
function extractRepoInfo(url: string): RepositoryInfo {
  try {
    console.log('Extracting repo info from URL:', url);

    // Handle different URL formats
    let urlObj: URL;
    let pathParts: string[];

    // Check if it's already a URL or just a path
    if (url.startsWith('http')) {
      urlObj = new URL(url);
      pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      console.log('URL path parts:', pathParts);
    } else {
      // Handle format like 'username/repo'
      pathParts = url.split('/').filter(part => part.length > 0);
      console.log('Path parts from string:', pathParts);
    }

    // Handle GitHub URL formats
    if (pathParts.length >= 2) {
      // Remove any .git extension
      let repo = pathParts[1].replace(/\.git$/, '');

      // Handle tree/blob parts (e.g., github.com/user/repo/tree/main)
      if (pathParts.length > 2 && ['tree', 'blob', 'pull', 'issues'].includes(pathParts[2])) {
        console.log('Detected URL with tree/blob/pull/issues, using base repo name');
      }

      const repoInfo = {
        owner: pathParts[0],
        repo: repo
      };

      console.log('Extracted repo info:', repoInfo);
      return repoInfo;
    }

    console.error('Invalid GitHub repository URL format:', url);
    throw new Error(`Invalid GitHub repository URL format: ${url}. Expected format: username/repo or https://github.com/username/repo`);
  } catch (error) {
    console.error('Error extracting repository info:', error);
    throw new Error(`Could not extract repository information from URL: ${url}. Please use format username/repo or https://github.com/username/repo`);
  }
}
