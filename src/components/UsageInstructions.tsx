import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const UsageInstructions = () => {
  return (
    <div className="text-left">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">How to Use</h3>
      
      <Tabs defaultValue="npm" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="npm">npm</TabsTrigger>
          <TabsTrigger value="npx">npx</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="web">Web UI</TabsTrigger>
        </TabsList>
        
        <TabsContent value="npm" className="bg-white/5 backdrop-blur-sm rounded-lg p-6 text-white/80">
          <h4 className="text-xl font-semibold mb-4">Install globally with npm</h4>
          <pre className="bg-black/50 p-4 rounded-md mb-4 overflow-x-auto">
            <code>npm install -g delovable</code>
          </pre>
          <p className="mb-4">Then use it on any Lovable project:</p>
          <pre className="bg-black/50 p-4 rounded-md overflow-x-auto">
            <code>delovable ./my-lovable-project --platform cloudflare</code>
          </pre>
        </TabsContent>
        
        <TabsContent value="npx" className="bg-white/5 backdrop-blur-sm rounded-lg p-6 text-white/80">
          <h4 className="text-xl font-semibold mb-4">Use with npx (no installation)</h4>
          <pre className="bg-black/50 p-4 rounded-md mb-4 overflow-x-auto">
            <code>npx delovable https://github.com/username/lovable-project</code>
          </pre>
          <p className="mb-4">With options:</p>
          <pre className="bg-black/50 p-4 rounded-md overflow-x-auto">
            <code>npx delovable ./my-project --platform vercel --verbose</code>
          </pre>
        </TabsContent>
        
        <TabsContent value="github" className="bg-white/5 backdrop-blur-sm rounded-lg p-6 text-white/80">
          <h4 className="text-xl font-semibold mb-4">Install from GitHub</h4>
          <pre className="bg-black/50 p-4 rounded-md mb-4 overflow-x-auto">
            <code>npm install -g github:neckolis/delovable</code>
          </pre>
          <p className="mb-4">Or use directly with npx:</p>
          <pre className="bg-black/50 p-4 rounded-md overflow-x-auto">
            <code>npx github:neckolis/delovable ./my-project</code>
          </pre>
        </TabsContent>
        
        <TabsContent value="web" className="bg-white/5 backdrop-blur-sm rounded-lg p-6 text-white/80">
          <h4 className="text-xl font-semibold mb-4">Use the Web UI</h4>
          <p className="mb-4">No installation required - just use our web interface:</p>
          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li>Go to the Web UI page</li>
            <li>Enter your GitHub repository URL</li>
            <li>Select your target deployment platform</li>
            <li>Click "Process Repository"</li>
            <li>Download your cleaned project</li>
          </ol>
          <p>Perfect for quick one-time cleanups without installing anything!</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
