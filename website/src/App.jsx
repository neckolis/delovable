import { useState } from 'react'
import { CodeBracketIcon, CommandLineIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'

function App() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const features = [
    {
      name: 'Remove Lovable Metadata',
      description: 'Clean up package.json by removing Lovable-specific dependencies and scripts.',
      icon: CodeBracketIcon,
    },
    {
      name: 'Clean HTML Files',
      description: 'Remove Lovable tracking scripts and meta tags from your HTML files.',
      icon: CommandLineIcon,
    },
    {
      name: 'Deployment Ready',
      description: 'Prepare your project for deployment to Cloudflare, Vercel, or Netlify.',
      icon: CloudArrowUpIcon,
    },
  ]

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <div className="mt-24 sm:mt-32 lg:mt-16">
                  <a href="https://github.com/neckolis/delovable" className="inline-flex space-x-6">
                    <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                      Latest version: v0.1.0
                    </span>
                  </a>
                </div>
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Delovable
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  A CLI tool to remove Lovable metadata and tracking from Lovable projects and prepare them for deployment to various platforms.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <a
                    href="https://github.com/neckolis/delovable"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400 text-xs">Terminal</div>
              </div>
              <div className="font-mono text-sm text-gray-300">
                <p className="text-green-400">$ npx delovable ./my-lovable-project --platform cloudflare</p>
                <p className="mt-2">🔍 Scanning project at: ./my-lovable-project</p>
                <p>🎯 Target platform: cloudflare</p>
                <p>🧹 Cleaning package.json...</p>
                <p className="text-gray-500">  - Removed dependency: lovable-analytics</p>
                <p className="text-gray-500">  - Removed dependency: @lovable/core</p>
                <p className="text-gray-500">  - Removed dependency: @lovable/tracking</p>
                <p className="text-gray-500">  - Removed script: lovable-deploy</p>
                <p className="text-gray-500">  - Removed script: lovable-build</p>
                <p className="text-gray-500">  - Removed lovable configuration</p>
                <p className="text-gray-500">  ✅ Updated package.json</p>
                <p>🧹 Cleaning HTML files...</p>
                <p className="text-gray-500">  - Removed Lovable metadata from index.html</p>
                <p className="text-gray-500">  ✅ Updated index.html</p>
                <p>🔧 Setting up deployment configuration for cloudflare...</p>
                <p className="text-gray-500">  ✅ Created wrangler.toml for Cloudflare Pages</p>
                <p>✅ Lovable metadata removal complete!</p>
                <p>✅ Successfully removed Lovable metadata</p>
                <p>🚀 Project is now ready for deployment to cloudflare</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Installation section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Get Started</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Installation</p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Delovable can be installed globally or used directly with npx.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <button
                  onClick={() => copyToClipboard('npm install -g delovable')}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 font-mono text-sm">
                <code className="text-green-400">npm install -g delovable</code>
              </div>
            </div>

            <p className="mt-8 text-lg text-center text-gray-600">Or use it directly with npx:</p>

            <div className="mt-4 bg-gray-900 rounded-lg overflow-hidden shadow-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <button
                  onClick={() => copyToClipboard('npx delovable <project-path> [options]')}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 font-mono text-sm">
                <code className="text-green-400">npx delovable &lt;project-path&gt; [options]</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Powerful Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need</p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Delovable provides a comprehensive set of tools to clean your Lovable projects and prepare them for deployment.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Usage section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Usage</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple and powerful</p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Delovable is designed to be easy to use with a simple command-line interface.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400 text-sm">Usage</div>
              </div>
              <div className="p-6 font-mono text-sm text-gray-300">
                <p className="text-white font-bold mb-4">Arguments:</p>
                <p><span className="text-indigo-400">project-path</span>: Path to your Lovable project (required)</p>

                <p className="text-white font-bold mt-6 mb-4">Options:</p>
                <p><span className="text-indigo-400">-p, --platform &lt;platform&gt;</span>: Target deployment platform (cloudflare, vercel, netlify, none) (default: "none")</p>
                <p><span className="text-indigo-400">-v, --verbose</span>: Enable verbose output</p>
                <p><span className="text-indigo-400">--version</span>: Show version number</p>
                <p><span className="text-indigo-400">-h, --help</span>: Display help</p>

                <p className="text-white font-bold mt-6 mb-4">Examples:</p>
                <p className="text-green-400">delovable ./my-lovable-project</p>
                <p className="text-green-400 mt-2">delovable ./my-lovable-project --platform cloudflare</p>
                <p className="text-green-400 mt-2">delovable ./my-lovable-project --verbose</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://github.com/neckolis/delovable" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2025 Delovable. MIT License.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
