import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CommandLine = () => {
  const [copied, setCopied] = useState(false);
  const command = 'npx delovable https://github.com/username/lovable-project';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-black/50 rounded-lg p-4 flex items-center justify-between overflow-x-auto">
      <pre className="font-mono text-white/90 text-sm md:text-base overflow-x-auto scrollbar-hide">
        $ {command}
      </pre>
      <Button
        variant="ghost"
        size="icon"
        onClick={copyToClipboard}
        className="ml-2 text-white/70 hover:text-white hover:bg-white/10"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};
