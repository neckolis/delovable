#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define interfaces
interface DelovableConfig {
  targetPlatform: 'cloudflare' | 'vercel' | 'netlify' | 'none';
  projectPath: string;
  verbose: boolean;
}

interface LovableMetadata {
  dependencies: string[];
  scripts: string[];
  htmlPatterns: RegExp[];
  metaTagPatterns: RegExp[];
}

// Known Lovable-specific patterns to remove
const LOVABLE_METADATA: LovableMetadata = {
  dependencies: [
    'lovable-tagger',
    'lovable-analytics',
    '@lovable/core',
    '@lovable/tracking',
    '@lovable/utils'
  ],
  scripts: [
    'lovable-deploy',
    'lovable-build',
    'lovable-start'
  ],
  htmlPatterns: [
    /<script[^>]*src="[^"]*lovable[^"]*"[^>]*>[\s\S]*?<\/script>/g,
    /<script[^>]*data-lovable[^>]*>[\s\S]*?<\/script>/g,
    /<script[\s\S]*?lovable\.init[\s\S]*?<\/script>/g
  ],
  metaTagPatterns: [
    /<meta[^>]*name="lovable[^"]*"[^>]*>/g,
    /<meta[^>]*property="lovable:[^"]*"[^>]*>/g
  ]
};

/**
 * Main function to remove Lovable metadata from a project
 */
async function removeLovableMetadata(config: DelovableConfig) {
  const { projectPath, targetPlatform, verbose } = config;

  if (verbose) {
    console.log(`🔍 Scanning project at: ${projectPath}`);
    console.log(`🎯 Target platform: ${targetPlatform}`);
  }

  // Ensure the project path exists
  if (!await fs.pathExists(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }

  // Clean package.json
  await cleanPackageJson(projectPath, verbose);

  // Clean HTML files
  await cleanHtmlFiles(projectPath, verbose);

  // Set up deployment configuration if needed
  if (targetPlatform !== 'none') {
    await setupDeploymentConfig(projectPath, targetPlatform, verbose);
  }

  if (verbose) {
    console.log('✅ Lovable metadata removal complete!');
  }
}

/**
 * Clean package.json by removing Lovable-specific dependencies and scripts
 */
async function cleanPackageJson(projectPath: string, verbose: boolean) {
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!await fs.pathExists(packageJsonPath)) {
    if (verbose) {
      console.log('⚠️ No package.json found, skipping package cleanup');
    }
    return;
  }

  if (verbose) {
    console.log('🧹 Cleaning package.json...');
  }

  try {
    const pkg = await fs.readJSON(packageJsonPath);
    let modified = false;

    // Remove Lovable dependencies
    if (pkg.dependencies) {
      for (const dep of LOVABLE_METADATA.dependencies) {
        if (pkg.dependencies[dep]) {
          delete pkg.dependencies[dep];
          modified = true;
          if (verbose) {
            console.log(`  - Removed dependency: ${dep}`);
          }
        }
      }
    }

    // Remove Lovable scripts
    if (pkg.scripts) {
      for (const script of LOVABLE_METADATA.scripts) {
        if (pkg.scripts[script]) {
          delete pkg.scripts[script];
          modified = true;
          if (verbose) {
            console.log(`  - Removed script: ${script}`);
          }
        }
      }
    }

    // Remove Lovable-specific fields
    if (pkg.lovable) {
      delete pkg.lovable;
      modified = true;
      if (verbose) {
        console.log('  - Removed lovable configuration');
      }
    }

    if (modified) {
      await fs.writeJSON(packageJsonPath, pkg, { spaces: 2 });
      if (verbose) {
        console.log('  ✅ Updated package.json');
      }
    } else {
      if (verbose) {
        console.log('  ℹ️ No Lovable metadata found in package.json');
      }
    }
  } catch (error) {
    console.error('Error cleaning package.json:', error);
    throw error;
  }
}

/**
 * Clean HTML files by removing Lovable-specific scripts and meta tags
 */
async function cleanHtmlFiles(projectPath: string, verbose: boolean) {
  if (verbose) {
    console.log('🧹 Cleaning HTML files...');
  }

  try {
    // Find all HTML files in the project
    const htmlFiles = await globby('**/*.html', {
      cwd: projectPath,
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    });

    if (htmlFiles.length === 0) {
      if (verbose) {
        console.log('  ℹ️ No HTML files found');
      }
      return;
    }

    for (const htmlFile of htmlFiles) {
      const filePath = path.join(projectPath, htmlFile);
      let content = await fs.readFile(filePath, 'utf-8');
      const originalContent = content;
      let modified = false;

      // Direct string replacements for known Lovable patterns
      // 1. Remove script tags with lovable in src attribute
      content = content.replace(/<script[^>]*src="[^"]*lovable[^"]*"[^>]*>[\s\S]*?<\/script>/g, '');

      // 2. Remove script tags with data-lovable attribute
      content = content.replace(/<script[^>]*data-lovable[^>]*>[\s\S]*?<\/script>/g, '');

      // 3. Remove script tags containing lovable.init
      content = content.replace(/<script[\s\S]*?lovable\.init[\s\S]*?<\/script>/g, '');

      // 4. Remove meta tags with lovable in name attribute
      content = content.replace(/<meta[^>]*name="lovable:[^"]*"[^>]*>/g, '');
      content = content.replace(/<meta[^>]*name="lovable[^"]*"[^>]*>/g, '');

      // 5. Remove meta tags with lovable in property attribute
      content = content.replace(/<meta[^>]*property="lovable:[^"]*"[^>]*>/g, '');

      // Check if content was modified
      if (content !== originalContent) {
        modified = true;
        await fs.writeFile(filePath, content);
        if (verbose) {
          console.log(`  - Removed Lovable metadata from ${htmlFile}`);
          console.log(`  ✅ Updated ${htmlFile}`);
        }
      } else {
        if (verbose) {
          console.log(`  ℹ️ No Lovable metadata found in ${htmlFile}`);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning HTML files:', error);
    throw error;
  }
}

/**
 * Set up deployment configuration for the target platform
 */
async function setupDeploymentConfig(
  projectPath: string,
  targetPlatform: 'cloudflare' | 'vercel' | 'netlify',
  verbose: boolean
) {
  if (verbose) {
    console.log(`🔧 Setting up deployment configuration for ${targetPlatform}...`);
  }

  try {
    switch (targetPlatform) {
      case 'cloudflare':
        await setupCloudflareConfig(projectPath, verbose);
        break;
      case 'vercel':
        await setupVercelConfig(projectPath, verbose);
        break;
      case 'netlify':
        await setupNetlifyConfig(projectPath, verbose);
        break;
    }
  } catch (error) {
    console.error(`Error setting up ${targetPlatform} configuration:`, error);
    throw error;
  }
}

/**
 * Set up Cloudflare Pages configuration
 */
async function setupCloudflareConfig(projectPath: string, verbose: boolean) {
  const wranglerPath = path.join(projectPath, 'wrangler.toml');

  // Check if wrangler.toml already exists
  if (await fs.pathExists(wranglerPath)) {
    if (verbose) {
      console.log('  ℹ️ wrangler.toml already exists, skipping');
    }
    return;
  }

  const projectName = path.basename(projectPath)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');

  const wranglerContent = `
# Cloudflare Pages configuration
name = "${projectName}"
compatibility_date = "${new Date().toISOString().split('T')[0]}"

[build]
command = "npm run build"
output_dir = "dist"

[site]
bucket = "./dist"
`;

  await fs.writeFile(wranglerPath, wranglerContent.trim());

  if (verbose) {
    console.log('  ✅ Created wrangler.toml for Cloudflare Pages');
  }
}

/**
 * Set up Vercel configuration
 */
async function setupVercelConfig(projectPath: string, verbose: boolean) {
  const vercelConfigPath = path.join(projectPath, 'vercel.json');

  // Check if vercel.json already exists
  if (await fs.pathExists(vercelConfigPath)) {
    if (verbose) {
      console.log('  ℹ️ vercel.json already exists, skipping');
    }
    return;
  }

  const vercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/static-build",
        "config": {
          "distDir": "dist"
        }
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/$1"
      }
    ]
  };

  await fs.writeJSON(vercelConfigPath, vercelConfig, { spaces: 2 });

  if (verbose) {
    console.log('  ✅ Created vercel.json');
  }
}

/**
 * Set up Netlify configuration
 */
async function setupNetlifyConfig(projectPath: string, verbose: boolean) {
  const netlifyConfigPath = path.join(projectPath, 'netlify.toml');

  // Check if netlify.toml already exists
  if (await fs.pathExists(netlifyConfigPath)) {
    if (verbose) {
      console.log('  ℹ️ netlify.toml already exists, skipping');
    }
    return;
  }

  const netlifyContent = `
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

  await fs.writeFile(netlifyConfigPath, netlifyContent.trim());

  if (verbose) {
    console.log('  ✅ Created netlify.toml');
  }
}

// Set up the CLI
const program = new Command();

program
  .name('delovable')
  .description('Remove Lovable metadata and prepare for deployment')
  .version('0.1.0')
  .argument('<project-path>', 'Path to your Lovable project')
  .option('-p, --platform <platform>', 'Target platform (cloudflare, vercel, netlify, none)', 'none')
  .option('-v, --verbose', 'Enable verbose output', false)
  .action(async (projectPath, options) => {
    try {
      const resolvedPath = path.resolve(projectPath);

      await removeLovableMetadata({
        projectPath: resolvedPath,
        targetPlatform: options.platform,
        verbose: options.verbose
      });

      console.log('✅ Successfully removed Lovable metadata');

      if (options.platform !== 'none') {
        console.log(`🚀 Project is now ready for deployment to ${options.platform}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

program.parse();
