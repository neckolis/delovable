export interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

export async function detectRepositoryLanguage(
  owner: string,
  repo: string
): Promise<LanguageDetectionResult | null> {
  try {
    // Use GitHub API to detect the primary language
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repository languages: ${response.status}`);
    }
    
    const languages = await response.json();
    
    // Find the language with the highest byte count
    const entries = Object.entries(languages) as [string, number][];
    if (entries.length === 0) {
      return null;
    }
    
    // Sort by byte count (descending)
    entries.sort((a, b) => b[1] - a[1]);
    
    const [topLanguage, topBytes] = entries[0];
    const totalBytes = entries.reduce((sum, [_, bytes]) => sum + bytes, 0);
    
    return {
      language: topLanguage,
      confidence: topBytes / totalBytes
    };
  } catch (error) {
    console.error('Error detecting repository language:', error);
    return null;
  }
}
