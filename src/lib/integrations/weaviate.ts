/**
 * Weaviate integration utilities
 */

export interface WeaviateIntegrationOptions {
  repositoryUrl: string;
  repositoryOwner: string;
  repositoryName: string;
  language: string;
  createPullRequest?: boolean;
}

export interface WeaviateIntegrationResponse {
  success: boolean;
  pullRequestUrl?: string;
  error?: string;
}

export interface LanguageDetectionOptions {
  repositoryOwner: string;
  repositoryName: string;
}

export interface LanguageDetectionResponse {
  success: boolean;
  language?: string;
  confidence?: number;
  error?: string;
}

/**
 * Detect repository language
 */
export async function detectLanguage(
  options: LanguageDetectionOptions
): Promise<LanguageDetectionResponse> {
  try {
    const response = await fetch('/api/integrations/weaviate/detect-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to detect language: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error detecting language:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add Weaviate integration to repository
 */
export async function integrateWeaviate(
  options: WeaviateIntegrationOptions
): Promise<WeaviateIntegrationResponse> {
  try {
    const response = await fetch('/api/integrations/weaviate/integrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to integrate Weaviate: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error integrating Weaviate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
