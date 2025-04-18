import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { repositoryOwner, repositoryName } = req.body;

    if (!repositoryOwner || !repositoryName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: repositoryOwner, repositoryName' 
      });
    }

    // Use GitHub API to detect the primary language
    const response = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/languages`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Delovable-App',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ 
          success: false, 
          error: 'Repository not found' 
        });
      }
      
      return res.status(response.status).json({ 
        success: false, 
        error: `Failed to fetch repository languages: ${response.statusText}` 
      });
    }

    const languages = await response.json();
    
    // Find the language with the highest byte count
    const entries = Object.entries(languages) as [string, number][];
    if (entries.length === 0) {
      return res.status(200).json({
        success: true,
        language: null,
        message: 'No languages detected in repository',
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

    return res.status(200).json({
      success: true,
      language: mappedLanguage,
      originalLanguage: topLanguage,
      confidence,
      allLanguages: languages,
    });
  } catch (error) {
    console.error('Error detecting repository language:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to detect repository language',
    });
  }
}
