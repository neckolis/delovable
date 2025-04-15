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

### Global Installation

```bash
npm install -g delovable
```

### Using npx

```bash
npx delovable <project-path> [options]
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

## License

MIT
