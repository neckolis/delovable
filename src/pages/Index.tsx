import React from "react";

// Mock components for preview
const BrokenHeartLogo = () => (
  <div className="w-12 h-12 flex items-center justify-center">
    <span className="text-3xl">💔</span>
  </div>
);

const StarCounter = () => <span className="text-sm tracking-wide">⭐ 1.2k</span>;

const CommandLine = () => (
  <div className="bg-black/90 backdrop-blur text-green-400 font-mono p-6 rounded-xl text-left shadow-inner border border-white/10">
    <div>$ npx delovable my-project</div>
    <div className="opacity-70">✔ Removing Lovable tracking...</div>
    <div className="opacity-70">✔ Cleaning dependencies...</div>
    <div className="opacity-70">✔ Ready to deploy</div>
  </div>
);

const UsageInstructions = () => (
  <div className="mt-20 text-white/80 text-left">
    <h3 className="text-2xl font-semibold mb-6 tracking-wide">How it works</h3>
    <ol className="list-decimal ml-6 space-y-3 text-lg">
      <li>Connect your GitHub repository</li>
      <li>Run Delovable</li>
      <li>Deploy anywhere you want</li>
    </ol>
  </div>
);

export default function IndexPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-[ui-serif]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <BrokenHeartLogo />
            <h1 className="text-xl tracking-widest uppercase opacity-90">delovable</h1>
          </div>
          <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
            <span>🐙</span>
            <StarCounter />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-24">
        <main className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-8 leading-tight">
            Reclaim your code. Deploy anywhere.
          </h2>
          <p className="text-xl md:text-2xl opacity-80 mb-6 leading-relaxed">
            Delovable removes all Lovable tracking, metadata, and dependencies from your projects.
          </p>
          <p className="text-primary mb-16 tracking-wide text-lg">Your idea. Your code. Your future.</p>

          <div className="mb-16">
            <CommandLine />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left mb-16">
            {[
              "Remove Tracking",
              "Clean Dependencies",
              "Deployment Ready",
            ].map((title) => (
              <div
                key={title}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <h3 className="text-2xl font-semibold mb-3">✓ {title}</h3>
                <p className="opacity-80 text-lg">
                 sorry was in hurry... please add your info here. if you see this line.
                </p>
              </div>
            ))}
          </div>

          <button className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full font-semibold text-lg shadow-lg hover:shadow-indigo-500/40 hover:scale-105 transition">
            Try the Web UI Experience
          </button>

          <UsageInstructions />
        </main>
      </div>
    </div>
  );
}
