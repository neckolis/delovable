import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';

interface CloudflareIntegrationProps {
  repositoryUrl: string;
  repositoryOwner: string;
  repositoryName: string;
}

export default function CloudflareIntegration({
  repositoryUrl,
  repositoryOwner,
  repositoryName,
}: CloudflareIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Initiate Cloudflare OAuth flow
      const response = await fetch('/api/integrations/cloudflare/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectUrl: window.location.origin + '/web-ui',
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        // Redirect to Cloudflare OAuth
        window.location.href = data.authUrl;
      } else {
        setError(data.error || 'Failed to connect to Cloudflare');
      }
    } catch (err) {
      setError('Failed to connect to Cloudflare');
      console.error('Error connecting to Cloudflare:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError('');
    
    try {
      const response = await fetch('/api/integrations/cloudflare/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryUrl,
          repositoryOwner,
          repositoryName,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsDeployed(true);
        setDeploymentUrl(data.deploymentUrl);
      } else {
        setError(data.error || 'Failed to deploy to Cloudflare Pages');
      }
    } catch (err) {
      setError('Failed to deploy to Cloudflare Pages');
      console.error('Error deploying to Cloudflare Pages:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/30 border-accent/10">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Deploy to Cloudflare Pages</h3>
          <p className="text-white/70 mb-4">
            Deploy your project to Cloudflare Pages for fast, secure hosting with automatic builds and deployments.
          </p>
          
          {error && (
            <div className="bg-red-900/20 text-red-300 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <span className="text-white">1</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Connect your Cloudflare account</h4>
                {!isConnected && (
                  <Button 
                    onClick={handleConnect} 
                    disabled={isConnecting}
                    className="mt-2"
                  >
                    {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Connect to Cloudflare
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
                {isDeployed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <span className="text-white">2</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Deploy your repository</h4>
                {isConnected && !isDeployed && (
                  <Button 
                    onClick={handleDeploy} 
                    disabled={isDeploying}
                    className="mt-2"
                  >
                    {isDeploying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Deploy to Cloudflare Pages
                  </Button>
                )}
                
                {isDeployed && deploymentUrl && (
                  <div className="mt-2">
                    <a 
                      href={deploymentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      View your deployment <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
