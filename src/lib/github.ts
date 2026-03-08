import { Octokit } from "@octokit/rest";

export interface GitHubUser {
  login: string;
  avatar_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: GitHubUser;
  labels: GitHubLabel[];
  created_at: string;
  updated_at: string;
  comments: number;
  body?: string | null;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
  };
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser & { type: string };
  html_url: string;
}

export interface GitHubOrg {
  login: string;
  id: number;
  avatar_url: string;
  description: string | null;
}

export const getGitHubClient = (accessToken: string) => {
  return new Octokit({
    auth: accessToken,
  });
};

export const JULES_LABEL = "jules";

export const ensureJulesLabel = async (
  octokit: Octokit,
  owner: string,
  repo: string,
) => {
  try {
    await octokit.issues.getLabel({
      owner,
      repo,
      name: JULES_LABEL,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 404
    ) {
      await octokit.issues.createLabel({
        owner,
        repo,
        name: JULES_LABEL,
        color: "39FF14", // Neon Green
        description: "Issues managed by Jules Orchestrator",
      });
    } else {
      throw error;
    }
  }
};

export const createJulesIssue = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  title: string,
  body: string,
) => {
  await ensureJulesLabel(octokit, owner, repo);

  return await octokit.issues.create({
    owner,
    repo,
    title,
    body,
    labels: [JULES_LABEL],
  });
};

export const fetchRepos = async (octokit: Octokit): Promise<GitHubRepo[]> => {
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
  });
  return data as unknown as GitHubRepo[];
};

export const fetchOrganizations = async (octokit: Octokit): Promise<GitHubOrg[]> => {
  const { data } = await octokit.orgs.listForAuthenticatedUser({
    per_page: 100,
  });
  return data as unknown as GitHubOrg[];
};

export const fetchOrgRepos = async (octokit: Octokit, org: string): Promise<GitHubRepo[]> => {
  const { data } = await octokit.repos.listForOrg({
    org,
    sort: "updated",
    per_page: 100,
  });
  return data as unknown as GitHubRepo[];
};

export const fetchIssues = async (
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<GitHubIssue[]> => {
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "all",
    sort: "updated",
    per_page: 50,
  });
  return data as unknown as GitHubIssue[];
};

export const fetchPullRequests = async (
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<GitHubIssue[]> => {
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    sort: "updated",
    per_page: 50,
  });
  return data as unknown as GitHubIssue[];
};
