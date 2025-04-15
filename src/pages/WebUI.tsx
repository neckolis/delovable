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
  ? 'https://delovable-worker.neckolis.workers.dev'
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setIsProcessing(true);
    setResult(null);
    setError(null);
    
    try {
      // Validate the repository URL
      if (!formData.repositoryUrl.trim()) {
        throw new Error('Repository URL is required');
      }
      
      // Call the API to process the repository
      const response = await fetch(`${API_URL}/api/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process repository');
      }
      
      // Handle successful response
      const data = await response.json();
      setResult(data);
    } catch (err) {
      // Handle errors
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
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
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Target Platform</Label>
                  <RadioGroup 
                    value={formData.targetPlatform} 
                    onValueChange={handlePlatformChange}
                    className="flex flex-wrap gap-4"
                    disabled={isProcessing}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cloudflare" id="cloudflare" />
                      <Label htmlFor="cloudflare" className="text-white/90">Cloudflare</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vercel" id="vercel" />
                      <Label htmlFor="vercel" className="text-white/90">Vercel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="netlify" id="netlify" />
                      <Label htmlFor="netlify" className="text-white/90">Netlify</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none" className="text-white/90">None</Label>
                    </div>
                  </RadioGroup>
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
            <Alert variant="destructive" className="mb-8">
              <XCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Processing result */}
          {result && (
            <Card className={`mb-8 ${result.success ? 'bg-green-950/20' : 'bg-red-950/20'} backdrop-blur-sm border-white/10 text-white`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {result.success ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Success
                    </>
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
                        <span className="text-green-400">✓</span> {log}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
              
              {result.success && result.fileId && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = getDownloadUrl(result.fileId!)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Cleaned Repository
                  </Button>
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
