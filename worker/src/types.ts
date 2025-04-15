/**
 * Type definitions for the Delovable Worker
 */

export interface Env {
  // R2 bucket for storing temporary files
  DELOVABLE_BUCKET: R2Bucket;
  
  // Environment variables
  WORKER_ENV: string;
}

export interface ProcessResult {
  success: boolean;
  fileId?: string;
  error?: string;
  message?: string;
  logs?: string[];
}

export interface RepositoryInfo {
  owner: string;
  repo: string;
}

export type TargetPlatform = 'cloudflare' | 'vercel' | 'netlify' | 'none';
