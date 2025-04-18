import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CloudflareIntegration from './CloudflareIntegration';
import WeaviateIntegration from './WeaviateIntegration';

interface WhatsNextModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositoryUrl: string;
  repositoryOwner: string;
  repositoryName: string;
}

export default function WhatsNextModal({
  isOpen,
  onClose,
  repositoryUrl,
  repositoryOwner,
  repositoryName,
}: WhatsNextModalProps) {
  const [activeTab, setActiveTab] = useState('cloudflare');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-secondary/95 backdrop-blur-md border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">What's Next for Your Project?</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-white/80 mb-6">
            Your repository has been cleaned and is ready to go! Choose from these options to take your project to the next level.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="cloudflare">Deploy to Cloudflare</TabsTrigger>
              <TabsTrigger value="weaviate">Add Weaviate AI</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cloudflare">
              <CloudflareIntegration 
                repositoryUrl={repositoryUrl}
                repositoryOwner={repositoryOwner}
                repositoryName={repositoryName}
              />
            </TabsContent>
            
            <TabsContent value="weaviate">
              <WeaviateIntegration 
                repositoryUrl={repositoryUrl}
                repositoryOwner={repositoryOwner}
                repositoryName={repositoryName}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onClose}>
            Skip for now
          </Button>
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
