import { useState } from 'react';
import { Github, ArrowRight, Loader2, CheckCircle, XCircle, Download, Code, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrokenHeartLogo } from '@/components/BrokenHeartLogo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarCounter } from '@/components/StarCounter';
import { UsageInstructions } from '@/components/UsageInstructions';

// Define the API URL based on the environment
const API_URL = import.meta.env.PROD
  ? 'https://delovable.delovable.workers.dev'
  : 'http://localhost:8787';

// Define the types for our form and API responses
interface FormData {
  repositoryUrl: string;
}

interface ProcessResult {
  success: boolean;
  fileId?: string;
  error?: string;
  message?: string;
  logs?: string[];
}

interface IDEInfo {
  name: string;
  downloadUrl: string;
  icon: string;
  description: string;
}

const Index = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    repositoryUrl: '',
  });

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Post-download dialog state
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);

  // IDE recommendations
  const ideOptions: IDEInfo[] = [
    {
      name: 'VS Code',
      downloadUrl: 'https://code.visualstudio.com/download',
      icon: 'vscode',
      description: 'Popular, free editor with great extension support.'
    },
    {
      name: 'WebStorm',
      downloadUrl: 'https://www.jetbrains.com/webstorm/download/',
      icon: 'webstorm',
      description: 'Powerful IDE for web development (paid, free trial available).'
    },
    {
      name: 'Sublime Text',
      downloadUrl: 'https://www.sublimetext.com/download',
      icon: 'sublime',
      description: 'Fast, lightweight editor with minimal UI.'
    }
  ];

  // AI assistant recommendations
  const aiAssistants = [
    {
      name: 'GitHub Copilot',
      url: 'https://github.com/features/copilot',
      description: 'AI pair programmer that offers autocomplete-style suggestions.'
    },
    {
      name: 'Cursor',
      url: 'https://cursor.sh/',
      description: 'Code editor with AI-powered code completion and chat.'
    },
    {
      name: 'Windsurf',
      url: 'https://www.windsurf.io/',
      description: 'AI coding assistant that helps you navigate and understand codebases.'
    },
    {
      name: 'Augment Code',
      url: 'https://augment.dev/',
      description: 'AI coding assistant that helps you understand and modify code.'
    }
  ];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        repositoryUrl: formattedUrl,
        targetPlatform: 'none' // Default to 'none' since we removed the option
      };

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
        throw new Error(`Network error: ${fetchError.message}`);
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
        }
        throw new Error(errorMessage);
      }

      // Handle successful response
      const data = await response.json().catch(parseError => {
        throw new Error('Failed to parse server response');
      });

      setResult(data);
    } catch (err) {
      // Handle errors
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate download URL
  const getDownloadUrl = (fileId: string) => {
    return `${API_URL}/api/download/${fileId}`;
  };

  // Handle download completion
  const handleDownload = (fileId: string) => {
    // Navigate to the download URL
    window.location.href = getDownloadUrl(fileId);

    // Show instructions dialog after a short delay
    setTimeout(() => {
      setShowInstructionsDialog(true);
    }, 1000);
  };

  // Open external URL
  const openExternalUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-secondary">
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
            <StarCounter />
          </a>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Reclaim your code.
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-6">
              Delovable removes all Lovable tracking, metadata, and dependencies from your projects,
              giving you back full control of your code.
            </p>
            <p className="text-md text-primary/90 mb-12">
              Your idea. Your code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-white/90 mb-12">
            <div className="p-6 rounded-lg bg-accent/10 border border-accent/10 hover:border-accent/20 transition-all hover:translate-y-[-2px]">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-primary mr-2">✓</span> Remove Tracking
              </h3>
              <p>Eliminates all Lovable tracking scripts, analytics, and monitoring code that could compromise your privacy</p>
            </div>
            <div className="p-6 rounded-lg bg-accent/10 border border-accent/10 hover:border-accent/20 transition-all hover:translate-y-[-2px]">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-primary mr-2">✓</span> Clean Dependencies
              </h3>
              <p>Purges all Lovable-specific dependencies from package.json, giving you a lean, clean codebase that's truly yours</p>
            </div>
            <div className="p-6 rounded-lg bg-accent/10 border border-accent/10 hover:border-accent/20 transition-all hover:translate-y-[-2px]">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-primary mr-2">✓</span> Download & Go
              </h3>
              <p>Download your cleaned project and start developing locally with your favorite tools and editors</p>
            </div>
          </div>

          <Card className="mb-8 bg-white/5 backdrop-blur-sm border-white/10 text-white">
            <CardHeader>
              <CardTitle>Process GitHub Repository</CardTitle>
              <CardDescription className="text-white/70">
                Enter a GitHub repository URL to remove Lovable metadata and prepare it for download
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

                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-white mb-2">What this tool does:</h4>
                    <ul className="text-sm text-white/80 space-y-1 list-disc pl-5">
                      <li>Removes Lovable tracking scripts</li>
                      <li>Cleans package.json dependencies</li>
                      <li>Packages everything for download</li>
                    </ul>
                  </div>

                  <div className="bg-secondary/50 p-4 rounded-md border border-accent/10">
                    <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                      <span className="mr-2 text-primary">✓</span> Privacy Promise
                    </h4>
                    <p className="text-sm text-white/80">
                      We do the loving thing and never track or retain any data. All processed repositories and logs are automatically deleted within 24 hours.
                    </p>
                  </div>
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
            <Alert variant="destructive" className="mb-8 bg-secondary/30 border-primary/20 text-white">
              <XCircle className="h-4 w-4 mr-2 text-primary" />
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
            <Card className={`mb-8 ${result.success ? (result.fileId ? 'bg-secondary/30' : 'bg-secondary/30') : 'bg-secondary/30'} border-accent/10 text-white`}>
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
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    onClick={() => handleDownload(result.fileId!)}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Cleaned Repository
                  </Button>

                  <div className="text-sm text-white/70">
                    <p>Your repository has been cleaned and is ready for local development.</p>
                    <p className="mt-2">After downloading, unzip the file and open it in your favorite code editor.</p>
                  </div>
                </CardFooter>
              )}
            </Card>
          )}

          <div className="text-center text-white/60 text-sm mt-12 mb-12">
            <p className="mb-4">
              We do the loving thing and never track or retain any data.
              All data and logs are automatically deleted within 24 hours.
            </p>
            <p>
              If you find this tool useful, please <a
                href="https://github.com/neckolis/delovable"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-300 hover:underline inline-flex items-center"
              >
                <span> star us on GitHub</span>
                <span className="ml-1">★</span>
              </a>
            </p>
          </div>

          <UsageInstructions />

          {/* Post-download instructions dialog */}
          <Dialog open={showInstructionsDialog} onOpenChange={setShowInstructionsDialog}>
            <DialogContent className="sm:max-w-[600px] bg-secondary/95 backdrop-blur-md border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl">Next Steps</DialogTitle>
              </DialogHeader>

              <div className="mt-4">
                <p className="text-white/80 mb-6">
                  Your project has been cleaned and is ready for local development. Follow these steps to get started:
                </p>

                <Tabs defaultValue="setup">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="setup">Setup</TabsTrigger>
                    <TabsTrigger value="ai">AI Coding Tools</TabsTrigger>
                    <TabsTrigger value="editors">Code Editors</TabsTrigger>
                  </TabsList>

                  <TabsContent value="setup" className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-md">
                      <h3 className="font-medium mb-2">1. Extract the ZIP file</h3>
                      <p className="text-white/70 text-sm">Unzip the downloaded file to a location on your computer.</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-md">
                      <h3 className="font-medium mb-2">2. Open in your code editor</h3>
                      <p className="text-white/70 text-sm">Open the extracted folder in your favorite code editor (VS Code, WebStorm, etc.).</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-md">
                      <h3 className="font-medium mb-2">3. Vibe out</h3>
                      <p className="text-white/70 text-sm">Start coding and enjoy your clean project!</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="space-y-4">
                    <p className="text-white/80 mb-2">These AI coding tools can help you develop your project faster:</p>

                    {aiAssistants.map((assistant) => (
                      <div key={assistant.name} className="bg-white/5 p-4 rounded-md flex items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{assistant.name}</h3>
                          <p className="text-white/70 text-sm mt-1">{assistant.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4 text-white hover:text-white border-white/20 hover:border-white/40 bg-primary/20"
                          onClick={() => openExternalUrl(assistant.url)}
                        >
                          <Code className="h-4 w-4 mr-2" />
                          Learn More
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="editors" className="space-y-4">
                    <p className="text-white/80 mb-2">Here are some recommended code editors for your project:</p>

                    {ideOptions.map((ide) => (
                      <div key={ide.name} className="bg-white/5 p-4 rounded-md flex items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{ide.name}</h3>
                          <p className="text-white/70 text-sm mt-1">{ide.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4 text-white hover:text-white border-white/20 hover:border-white/40 bg-primary/20"
                          onClick={() => openExternalUrl(ide.downloadUrl)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowInstructionsDialog(false)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Got it!
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Index;
