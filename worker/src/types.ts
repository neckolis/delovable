/**
 * Type definitions for the Delovable Worker
 */

export interface Env {
  // R2 bucket for storing temporary files
  DELOVABLE_BUCKET: R2Bucket;

  // Environment variables
  WORKER_ENV: string;

  // GitHub OAuth credentials
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export interface ProcessResult {
  success: boolean;
  fileId?: string;
  error?: string;
  message?: string;
  logs?: string[];
  repoUrl?: string; // URL to the newly created GitHub repository
}

export interface RepositoryInfo {
  owner: string;
  repo: string;
}

export type TargetPlatform = 'cloudflare' | 'vercel' | 'netlify' | 'none';

export interface GitHubAuthState {
  redirectUrl: string;
  originalFileId: string;
  newRepoName: string;
  newRepoDescription?: string;
  isPrivate: boolean;
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GitHubCreateRepoRequest {
  name: string;
  description?: string;
  private: boolean;
  auto_init?: boolean;
}

export interface GitHubCreateRepoResponse {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url: string | null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: any;
  allow_forking: boolean;
  is_template: boolean;
  topics: string[];
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
}
