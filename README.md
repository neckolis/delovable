# Delovable

A CLI tool to remove Lovable metadata and tracking from Lovable projects and prepare them for deployment to various platforms.

## Features

- Removes Lovable-specific dependencies from package.json
- Cleans up Lovable tracking scripts and metadata from HTML files
- Sets up deployment configurations for popular platforms:
  - Cloudflare Pages
  - Vercel
  - Netlify

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

```bash
delovable <project-path> [options]
```

### Arguments

- `project-path`: Path to your Lovable project (required)

### Options

- `-p, --platform <platform>`: Target deployment platform (cloudflare, vercel, netlify, none) (default: "none")
- `-v, --verbose`: Enable verbose output
- `--version`: Show version number
- `-h, --help`: Display help

### Examples

Remove Lovable metadata from a project:

```bash
delovable ./my-lovable-project
```

Remove Lovable metadata and prepare for Cloudflare Pages deployment:

```bash
delovable ./my-lovable-project --platform cloudflare
```

Remove Lovable metadata with verbose output:

```bash
delovable ./my-lovable-project --verbose
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
# Basic usage
node dist/index.js /path/to/your/lovable-project

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

### Other Issues

If you encounter any other issues:

1. Make sure you're using the latest version by pulling from the repository
2. Try running with the `--verbose` flag to get more detailed output
3. Open an issue on the [GitHub repository](https://github.com/neckolis/delovable/issues)

## License

MIT
