import { Octokit } from "@octokit/rest";

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
  } catch (error: any) {
    if (error.status === 404) {
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
