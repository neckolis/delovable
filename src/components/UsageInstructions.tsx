import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

export const UsageInstructions = () => {
  return (
    <div className="text-left bg-accent/10 rounded-lg p-6 border border-accent/10">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">Other Ways to Use</h3>

      <Tabs defaultValue="npm" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 bg-secondary/50">
          <TabsTrigger value="npm" className="data-[state=active]:bg-primary data-[state=active]:text-white">npm</TabsTrigger>
          <TabsTrigger value="npx" className="data-[state=active]:bg-primary data-[state=active]:text-white">npx</TabsTrigger>
          <TabsTrigger value="github" className="data-[state=active]:bg-primary data-[state=active]:text-white">GitHub</TabsTrigger>
          <TabsTrigger value="web" className="data-[state=active]:bg-primary data-[state=active]:text-white">Web UI</TabsTrigger>
        </TabsList>

        <TabsContent value="npm" className="bg-secondary/30 rounded-lg p-6 text-white/80 border border-accent/5">
          <h4 className="text-xl font-semibold mb-4">Install globally with npm</h4>
          <pre className="bg-black/50 p-4 rounded-md mb-4 overflow-x-auto">
            <code>npm install -g delovable</code>
          </pre>
          <p className="mb-4">Then use it on any Lovable project:</p>
          <pre className="bg-black/50 p-4 rounded-md overflow-x-auto">
            <code>delovable ./my-lovable-project --platform cloudflare</code>
          </pre>
        </TabsContent>

        <TabsContent value="npx" className="bg-secondary/30 rounded-lg p-6 text-white/80 border border-accent/5">
          <h4 className="text-xl font-semibold mb-4">Use with npx (no installation)</h4>
          <pre className="bg-black/50 p-4 rounded-md mb-4 overflow-x-auto">
            <code>npx delovable https://github.com/username/lovable-project</code>
          </pre>
          <p className="mb-4">With options:</p>
          <pre className="bg-black/50 p-4 rounded-md overflow-x-auto">
            <code>npx delovable ./my-project --platform vercel --verbose</code>
          </pre>
        </TabsContent>

        <TabsContent value="github" className="bg-secondary/30 rounded-lg p-6 text-white/80 border border-accent/5">
          <h4 className="text-xl font-semibold mb-4">Install from GitHub</h4>
          <pre className="bg-black/50 p-4 rounded-md mb-4 overflow-x-auto">
            <code>npm install -g github:neckolis/delovable</code>
          </pre>
          <p className="mb-4">Or use directly with npx:</p>
          <pre className="bg-black/50 p-4 rounded-md overflow-x-auto">
            <code>npx github:neckolis/delovable ./my-project</code>
          </pre>
        </TabsContent>

        <TabsContent value="web" className="bg-secondary/30 rounded-lg p-6 text-white/80 border border-accent/5">
          <h4 className="text-xl font-semibold mb-4">Use the Web UI</h4>
          <p className="mb-4">No installation required - just use our <Link to="/web-ui" className="text-primary hover:text-primary/80 underline">web interface</Link>:</p>
          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li>Enter your GitHub repository URL (public repos only)</li>
            <li>Select your target deployment platform</li>
            <li>Click "Process Repository"</li>
            <li>Download your cleaned project or create a new GitHub repository</li>
          </ol>
          <div className="bg-secondary/50 p-4 rounded-md mt-6 flex items-start border border-accent/5">
            <span className="text-primary mr-2 text-lg">✓</span>
            <div>
              <p className="mb-2">Perfect for quick one-time cleanups without installing anything!</p>
              <p className="text-xs text-white/70">We do the loving thing and never track or retain any data. All data and logs are deleted within 24 hours.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
