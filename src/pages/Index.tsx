import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StarCounter } from '@/components/StarCounter';
import { CommandLine } from '@/components/CommandLine';
import { BrokenHeartLogo } from '@/components/BrokenHeartLogo';
import { UsageInstructions } from '@/components/UsageInstructions';

const Index = () => {
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
            <StarCounter />
          </a>
        </header>

        <main className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Remove Lovable tracking & metadata
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-12">
            A CLI tool to clean Lovable projects by removing tracking scripts, metadata, and preparing them for deployment
          </p>

          <div className="mb-12">
            <CommandLine />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-white/80 mb-12">
            <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">Remove Tracking</h3>
              <p>Eliminates all Lovable tracking scripts and analytics from your project</p>
            </div>
            <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">Clean Dependencies</h3>
              <p>Removes Lovable-specific dependencies from package.json</p>
            </div>
            <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">Deployment Ready</h3>
              <p>Prepares your project for deployment to Cloudflare Pages, Vercel, or Netlify</p>
            </div>
          </div>

          <div className="mb-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/web-ui">
                Try the Web UI Experience
              </Link>
            </Button>
            <p className="text-white/60 text-sm mt-4">
              No installation required - process GitHub repositories directly in your browser
            </p>
          </div>

          <UsageInstructions />
        </main>
      </div>
    </div>
  );
};

export default Index;
