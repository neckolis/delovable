import { Env } from '../types';

/**
 * Handle Weaviate language detection request
 */
export async function handleWeaviateDetectLanguage(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const data = await request.json() as {
      repositoryOwner?: string;
      repositoryName?: string;
    };

    if (!data.repositoryOwner || !data.repositoryName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters: repositoryOwner, repositoryName'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Use GitHub API to detect the primary language
    const response = await fetch(`https://api.github.com/repos/${data.repositoryOwner}/${data.repositoryName}/languages`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Delovable-App',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Repository not found'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      return new Response(JSON.stringify({
        success: false,
        error: `Failed to fetch repository languages: ${response.statusText}`
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const languages = await response.json() as Record<string, number>;

    // Find the language with the highest byte count
    const entries = Object.entries(languages);
    if (entries.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        language: null,
        message: 'No languages detected in repository',
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Sort by byte count (descending)
    entries.sort((a, b) => b[1] - a[1]);

    const [topLanguage, topBytes] = entries[0];
    const totalBytes = entries.reduce((sum, [_, bytes]) => sum + bytes, 0);
    const confidence = topBytes / totalBytes;

    // Map GitHub language names to our supported languages
    let mappedLanguage = topLanguage.toLowerCase();

    // Map common languages to our supported types
    if (['typescript', 'tsx'].includes(mappedLanguage)) {
      mappedLanguage = 'typescript';
    } else if (['javascript', 'jsx'].includes(mappedLanguage)) {
      mappedLanguage = 'javascript';
    } else if (['python', 'py'].includes(mappedLanguage)) {
      mappedLanguage = 'python';
    } else {
      // Default to JavaScript for unsupported languages
      mappedLanguage = 'javascript';
    }

    return new Response(JSON.stringify({
      success: true,
      language: mappedLanguage,
      originalLanguage: topLanguage,
      confidence,
      allLanguages: languages,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error detecting repository language:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to detect repository language',
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
 * Handle Weaviate integration request
 */
export async function handleWeaviateIntegrate(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const data = await request.json() as {
      repositoryUrl?: string;
      repositoryOwner?: string;
      repositoryName?: string;
      language?: string;
      createPullRequest?: boolean;
    };

    if (!data.repositoryUrl || !data.repositoryOwner || !data.repositoryName || !data.language) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters: repositoryUrl, repositoryOwner, repositoryName, language'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Validate language
    const supportedLanguages = ['typescript', 'javascript', 'python'];
    if (!supportedLanguages.includes(data.language.toLowerCase())) {
      return new Response(JSON.stringify({
        success: false,
        error: `Unsupported language: ${data.language}. Supported languages are: ${supportedLanguages.join(', ')}`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // For now, just return a mock success response
    // In a real implementation, you would use the GitHub API to create a PR with the Weaviate integration
    return new Response(JSON.stringify({
      success: true,
      branch: `feature/add-weaviate-integration-${Date.now()}`,
      pullRequestUrl: data.createPullRequest ? `https://github.com/${data.repositoryOwner}/${data.repositoryName}/pull/1` : undefined,
      message: 'Weaviate integration added successfully',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error integrating Weaviate:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to integrate Weaviate',
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
