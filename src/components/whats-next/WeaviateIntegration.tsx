import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, Code, GitBranch } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface WeaviateIntegrationProps {
  repositoryUrl: string;
  repositoryOwner: string;
  repositoryName: string;
}

export default function WeaviateIntegration({
  repositoryUrl,
  repositoryOwner,
  repositoryName,
}: WeaviateIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);
  const [isIntegrated, setIsIntegrated] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('typescript');
  const [error, setError] = useState('');
  const [pullRequestUrl, setPullRequestUrl] = useState('');

  // Detect repository language
  useEffect(() => {
    const detectLanguage = async () => {
      try {
        const response = await fetch(`/api/integrations/weaviate/detect-language`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repositoryOwner,
            repositoryName,
          }),
        });
        
        const data = await response.json();
        
        if (data.success && data.language) {
          setDetectedLanguage(data.language.toLowerCase());
          setSelectedLanguage(data.language.toLowerCase());
        }
      } catch (err) {
        console.error('Error detecting language:', err);
      } finally {
        setIsDetecting(false);
      }
    };
    
    detectLanguage();
  }, [repositoryOwner, repositoryName]);

  const handleIntegrate = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/integrations/weaviate/integrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryUrl,
          repositoryOwner,
          repositoryName,
          language: selectedLanguage,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsIntegrated(true);
        if (data.pullRequestUrl) {
          setPullRequestUrl(data.pullRequestUrl);
        }
      } else {
        setError(data.error || 'Failed to integrate Weaviate');
      }
    } catch (err) {
      setError('Failed to integrate Weaviate');
      console.error('Error integrating Weaviate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/30 border-accent/10">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Add Weaviate AI Integration</h3>
          <p className="text-white/70 mb-4">
            Enhance your project with Weaviate vector database for AI-powered search and recommendations.
          </p>
          
          {error && (
            <div className="bg-red-900/20 text-red-300 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Select your project language:</h4>
              
              {isDetecting ? (
                <div className="flex items-center text-white/70">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detecting project language...
                </div>
              ) : (
                <>
                  {detectedLanguage && (
                    <div className="mb-2 text-white/70">
                      <span className="text-green-400">✓</span> Detected language: <span className="font-semibold">{detectedLanguage}</span>
                    </div>
                  )}
                  
                  <RadioGroup 
                    value={selectedLanguage} 
                    onValueChange={setSelectedLanguage}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                      <RadioGroupItem value="typescript" id="typescript" />
                      <Label htmlFor="typescript" className="text-white/90 cursor-pointer">TypeScript</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                      <RadioGroupItem value="javascript" id="javascript" />
                      <Label htmlFor="javascript" className="text-white/90 cursor-pointer">JavaScript</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                      <RadioGroupItem value="python" id="python" />
                      <Label htmlFor="python" className="text-white/90 cursor-pointer">Python</Label>
                    </div>
                  </RadioGroup>
                </>
              )}
            </div>
            
            <div>
              {!isIntegrated ? (
                <Button 
                  onClick={handleIntegrate} 
                  disabled={isLoading || isDetecting}
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Code className="mr-2 h-4 w-4" />
                  Add Weaviate Integration
                </Button>
              ) : (
                <div className="bg-green-900/20 text-green-300 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Weaviate integration added!</span>
                  </div>
                  
                  {pullRequestUrl && (
                    <a 
                      href={pullRequestUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline mt-2"
                    >
                      <GitBranch className="mr-2 h-4 w-4" />
                      View Pull Request
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
