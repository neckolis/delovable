import { useState } from 'react';
import { Github, ArrowRight, Loader2, CheckCircle, XCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrokenHeartLogo } from '@/components/BrokenHeartLogo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Define the API URL based on the environment
const API_URL = import.meta.env.PROD
  ? 'https://delovable.workers.dev'
  : 'http://localhost:8787';

// Define the types for our form and API responses
interface FormData {
  repositoryUrl: string;
  targetPlatform: 'cloudflare' | 'vercel' | 'netlify' | 'none';
}

interface ProcessResult {
  success: boolean;
  fileId?: string;
  error?: string;
  message?: string;
  logs?: string[];
}

const WebUI = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    repositoryUrl: '',
    targetPlatform: 'cloudflare',
  });

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle platform selection
  const handlePlatformChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      targetPlatform: value as 'cloudflare' | 'vercel' | 'netlify' | 'none'
    }));
  };

  // Format and validate the repository URL
  const formatRepositoryUrl = (url: string): string => {
    try {
      // Check if it's already a valid URL
      new URL(url);
      return url;
    } catch (e) {
      // If it's not a valid URL, check if it's in the format username/repo
      if (url.includes('/') && !url.includes(' ')) {
        return `https://github.com/${url}`;
      }
      return url;
    }
  };

  // Validate GitHub URL
  const isValidGitHubUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      // Check if it's a GitHub URL
      if (!['github.com', 'www.github.com'].includes(parsedUrl.hostname)) {
        return false;
      }
      // Check if it has a path with at least username/repo
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      return pathParts.length >= 2;
    } catch (e) {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setIsProcessing(true);
    setResult(null);
    setError(null);

    console.log('Starting repository processing...');
    console.log('API URL:', API_URL);

    try {
      // Validate and format the repository URL
      const rawUrl = formData.repositoryUrl.trim();
      if (!rawUrl) {
        throw new Error('Repository URL is required');
      }

      const formattedUrl = formatRepositoryUrl(rawUrl);
      if (!isValidGitHubUrl(formattedUrl)) {
        throw new Error('Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo or username/repo)');
      }

      const processData = {
        ...formData,
        repositoryUrl: formattedUrl
      };

      console.log('Formatted data:', processData);
      console.log('Making API request to:', `${API_URL}/api/process`);

      // Show a more detailed processing message
      setResult({
        success: true,
        message: 'Processing repository...',
        logs: ['Connecting to GitHub...', 'This may take a minute or two depending on repository size.']
      });

      // Call the API to process the repository
      const response = await fetch(`${API_URL}/api/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processData),
        mode: 'cors',
      }).catch(fetchError => {
        console.error('Fetch error:', fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries([...response.headers.entries()]));

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          const errorText = await response.text();
          console.error('Error response text:', errorText);
        }
        throw new Error(errorMessage);
      }

      // Handle successful response
      const data = await response.json().catch(parseError => {
        console.error('Error parsing success response:', parseError);
        throw new Error('Failed to parse server response');
      });

      console.log('API response data:', data);
      setResult(data);
    } catch (err) {
      // Handle errors
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResult(null);
    } finally {
      setIsProcessing(false);
      console.log('Repository processing completed');
    }
  };

  // Generate download URL
  const getDownloadUrl = (fileId: string) => {
    return `${API_URL}/api/download/${fileId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-secondary/95">
      <div className="container mx-auto px-4 py-20">
        <header className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-4">
            <BrokenHeartLogo />
            <h1 className="text-white/90 font-mono text-xl">delovable</h1>
          </div>
          <a
            href="https://github.com/neckolis/delovable"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </a>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Web UI for Delovable
            </h2>
            <p className="text-lg md:text-xl text-white/80">
              Clean Lovable projects directly in your browser - no installation required
            </p>
          </div>

          <Card className="mb-8 bg-white/5 backdrop-blur-sm border-white/10 text-white">
            <CardHeader>
              <CardTitle>Process GitHub Repository</CardTitle>
              <CardDescription className="text-white/70">
                Enter a GitHub repository URL to remove Lovable metadata and prepare it for deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="repositoryUrl" className="text-white">GitHub Repository URL</Label>
                  <Input
                    id="repositoryUrl"
                    name="repositoryUrl"
                    placeholder="https://github.com/username/repository"
                    value={formData.repositoryUrl}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-white/60 mt-1">
                    You can enter a full URL (https://github.com/username/repo) or just username/repo
                  </p>
                  <p className="text-xs text-white/60 mt-1 font-semibold">
                    Note: Only public repositories are supported. Private repositories will not work.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Target Platform</Label>
                  <RadioGroup
                    value={formData.targetPlatform}
                    onValueChange={handlePlatformChange}
                    className="grid grid-cols-2 md:flex md:flex-wrap gap-4"
                    disabled={isProcessing}
                  >
                    <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                      <RadioGroupItem value="cloudflare" id="cloudflare" />
                      <Label htmlFor="cloudflare" className="text-white/90 cursor-pointer">Cloudflare</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                      <RadioGroupItem value="vercel" id="vercel" />
                      <Label htmlFor="vercel" className="text-white/90 cursor-pointer">Vercel</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                      <RadioGroupItem value="netlify" id="netlify" />
                      <Label htmlFor="netlify" className="text-white/90 cursor-pointer">Netlify</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none" className="text-white/90 cursor-pointer">None</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-white/60 mt-1">
                    Select the platform where you plan to deploy your project
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-white mb-2">What this tool does:</h4>
                  <ul className="text-sm text-white/80 space-y-1 list-disc pl-5">
                    <li>Removes Lovable tracking scripts</li>
                    <li>Cleans package.json dependencies</li>
                    <li>Prepares deployment configuration</li>
                    <li>Packages everything for download</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Process Repository
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mb-8 bg-red-950/20 backdrop-blur-sm border-white/10">
              <XCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                {error}
                {error.includes('private') && (
                  <div className="mt-2 text-sm">
                    <p>To make a repository public:</p>
                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                      <li>Go to your repository on GitHub</li>
                      <li>Click on "Settings"</li>
                      <li>Scroll down to the "Danger Zone"</li>
                      <li>Click "Change visibility"</li>
                      <li>Select "Make public"</li>
                    </ol>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Processing result */}
          {result && (
            <Card className={`mb-8 ${result.success ? (result.fileId ? 'bg-green-950/20' : 'bg-blue-950/20') : 'bg-red-950/20'} backdrop-blur-sm border-white/10 text-white`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {result.success ? (
                    result.fileId ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        Success
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 text-blue-500 animate-spin" />
                        Processing
                      </>
                    )
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2 text-red-500" />
                      Error
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-white/70">
                  {result.message}
                </CardDescription>
              </CardHeader>

              {result.logs && result.logs.length > 0 && (
                <CardContent>
                  <div className="bg-black/30 rounded-md p-4 font-mono text-sm">
                    {result.logs.map((log, index) => (
                      <div key={index} className="py-1">
                        {result.success ? (
                          <span className="text-green-400">✓</span>
                        ) : (
                          <span className="text-red-400">✗</span>
                        )} {log}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}

              {result.success && result.fileId && (
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = getDownloadUrl(result.fileId!)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Cleaned Repository
                  </Button>

                  <div className="text-sm text-white/70">
                    <p>Your repository has been cleaned and is ready for deployment.</p>
                    <p className="mt-2">The download contains all the files from your repository with Lovable metadata removed.</p>
                  </div>
                </CardFooter>
              )}
            </Card>
          )}

          <div className="text-center text-white/60 text-sm mt-12">
            <p>
              This web UI uses Cloudflare Workers and R2 storage to process repositories.
              For more advanced usage, consider using the CLI version.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WebUI;
