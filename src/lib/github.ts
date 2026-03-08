import { Octokit } from "@octokit/rest";
import { RequestError } from "@octokit/request-error";

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
    if (error instanceof RequestError && error.status === 404) {
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

export const fetchRepos = async (octokit: Octokit) => {
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
  });
  return data;
};

export const fetchIssues = async (
  octokit: Octokit,
  owner: string,
  repo: string,
) => {
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "all",
    sort: "updated",
    per_page: 50,
  });
  return data;
};
