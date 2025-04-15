# Delovable

A tool to remove Lovable metadata and tracking from Lovable projects and prepare them for deployment to various platforms. Available as both a CLI tool and a web UI.

## Features

- Removes Lovable-specific dependencies from package.json
- Cleans up Lovable tracking scripts and metadata from HTML files
- Sets up deployment configurations for popular platforms:
  - Cloudflare Pages
  - Vercel
  - Netlify
- Available as both a CLI tool and a web-based UI

## Installation

### Option 1: Clone and Use Locally

```bash
# Clone the repository
git clone https://github.com/neckolis/delovable.git
cd delovable

# Install dependencies
npm install

# Build the project
npm run build

# Run the tool directly
node dist/index.js <project-path> [options]
```

### Option 2: Install from GitHub

```bash
npm install -g github:neckolis/delovable
```

### Option 3: Using npx with GitHub

```bash
npx github:neckolis/delovable <project-path> [options]
```

### Option 4: Global Installation from npm

```bash
npm install -g delovable
```

## Usage

### CLI Usage

```bash
delovable <project-source> [options]
```

#### Arguments

- `project-source`: Path to your Lovable project or GitHub repository URL (required)
  - Local path: `delovable ./my-lovable-project`
  - GitHub URL: `delovable https://github.com/username/lovable-project`

### Web UI Usage

You can also use the web-based UI at [https://delovable.pages.dev](https://delovable.pages.dev):

1. Visit the web UI page
2. Enter your GitHub repository URL
3. Select your target deployment platform
4. Click "Process Repository"
5. Download your cleaned project

#### CLI Options

- `-p, --platform <platform>`: Target deployment platform (cloudflare, vercel, netlify, none) (default: "none")
- `-v, --verbose`: Enable verbose output
- `-o, --output <output-dir>`: Output directory for repository-based projects
- `--version`: Show version number
- `-h, --help`: Display help

### Examples

Remove Lovable metadata from a local project:

```bash
delovable ./my-lovable-project
```

Remove Lovable metadata from a GitHub repository and save to an output directory:

```bash
delovable https://github.com/username/lovable-project --output ./cleaned-project
```

Remove Lovable metadata and prepare for Cloudflare Pages deployment:

```bash
delovable ./my-lovable-project --platform cloudflare
```

Process a GitHub repository, prepare for Vercel deployment, and save with verbose output:

```bash
delovable https://github.com/username/lovable-project --platform vercel --output ./cleaned-project --verbose
```

## Step-by-Step Guide

### 1. Prepare Your Lovable Project

Make sure you have a Lovable project that you want to clean up. This could be:
- A project created with Lovable CLI
- A project that uses Lovable libraries
- Any project with Lovable metadata and tracking

### 2. Clone the Delovable Repository

```bash
git clone https://github.com/neckolis/delovable.git
cd delovable
```

### 3. Install Dependencies and Build

```bash
npm install
npm run build
```

### 4. Run Delovable on Your Project

```bash
# Basic usage with local project
node dist/index.js /path/to/your/lovable-project

# With GitHub repository
node dist/index.js https://github.com/username/lovable-project --output ./cleaned-project

# With verbose output
node dist/index.js /path/to/your/lovable-project --verbose

# Prepare for deployment to Cloudflare
node dist/index.js /path/to/your/lovable-project --platform cloudflare
```

### 5. Verify the Changes

After running the tool, check your project to ensure:
- Lovable dependencies have been removed from package.json
- Lovable scripts have been removed from package.json
- Lovable tracking scripts have been removed from HTML files
- Lovable meta tags have been removed from HTML files
- Deployment configuration has been set up (if specified)

## What Gets Removed

- Lovable-specific dependencies in package.json
- Lovable-specific scripts in package.json
- Lovable tracking scripts in HTML files
- Lovable meta tags in HTML files
- Lovable configuration in package.json

## Deployment Configuration

When specifying a target platform, Delovable will create the necessary configuration files:

### Cloudflare Pages

Creates a `wrangler.toml` file configured for static site deployment.

### Vercel

Creates a `vercel.json` file configured for static site deployment.

### Netlify

Creates a `netlify.toml` file configured for static site deployment.

## Troubleshooting

### Error: "Command not found"

If you get a "command not found" error when trying to run `delovable`, make sure you're either:

1. Running it with the full path: `node dist/index.js` from the repository directory
2. Using it after installing globally: `npm install -g delovable`

### Web UI Issues

If you encounter issues with the web UI:

1. Make sure you're using a valid GitHub repository URL
2. Check that the repository is public and accessible
3. Try using a different browser or clearing your cache

### Other Issues

If you encounter any other issues:

1. Make sure you're using the latest version by pulling from the repository
2. Try running with the `--verbose` flag to get more detailed output
3. Open an issue on the [GitHub repository](https://github.com/neckolis/delovable/issues)

## Development

### Running the Web UI Locally

```bash
# Clone the repository
git clone https://github.com/neckolis/delovable.git
cd delovable

# Install dependencies
npm install

# Start the web UI development server
npm run dev:web

# In a separate terminal, start the worker
npm run worker:dev
```

### Deploying the Web UI

```bash
# Deploy the web UI to Cloudflare Pages
npm run pages:deploy

# Deploy the worker to Cloudflare Workers
npm run worker:deploy
```

## License

MIT
