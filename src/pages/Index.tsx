import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StarCounter } from '@/components/StarCounter';
import { CommandLine } from '@/components/CommandLine';
import { BrokenHeartLogo } from '@/components/BrokenHeartLogo';
import { UsageInstructions } from '@/components/UsageInstructions';

const Index = () => {
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

        <main className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Reclaim your code. Deploy anywhere.
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-6">
            Delovable removes all Lovable tracking, metadata, and dependencies from your projects,
            giving you back full control of your code and making deployment a breeze.
          </p>
          <p className="text-md text-primary/90 mb-12">
            Your idea. Your code. Your future.
          </p>

          <div className="mb-12">
            <CommandLine />
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
                <span className="text-primary mr-2">✓</span> Deployment Ready
              </h3>
              <p>Automatically configures your project for seamless deployment to Cloudflare Pages, Vercel, or Netlify with zero hassle</p>
            </div>
          </div>

          <div className="mb-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white transition-all hover:translate-y-[-2px]">
              <Link to="/web-ui">
                Try the Web UI Experience
              </Link>
            </Button>
            <p className="text-white/70 text-sm mt-4">
              No installation required - process GitHub repositories directly in your browser
            </p>
            <p className="text-white/60 text-xs mt-2">
              We do the loving thing and never track or retain any data. All data and logs are deleted within 24 hours.
            </p>
          </div>

          <UsageInstructions />
        </main>
      </div>
    </div>
  );
};

export default Index;
