"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  getGitHubClient,
  fetchIssues,
  fetchPullRequests,
  GitHubIssue,
} from "@/lib/github";
import { CreateIssueDialog } from "@/components/issues/CreateIssueDialog";
import {
  Loader2,
  AlertCircle,
  Folder,
} from "lucide-react";
import { KanbanBoard } from "@/components/issues/KanbanBoard";

export default function RepoPage() {
  const { data: session } = useSession();
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [pullRequests, setPullRequests] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const accessToken = session?.accessToken as string | undefined;
    if (accessToken && owner && repo) {
      setLoading(true);
      try {
        const octokit = getGitHubClient(accessToken);
        const [issuesData, prData] = await Promise.all([
          fetchIssues(octokit, owner, repo),
          fetchPullRequests(octokit, owner, repo),
        ]);
        setIssues(issuesData);
        setPullRequests(prData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [session, owner, repo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-0 bg-background/30">
          <header className="px-8 py-4 border-b bg-background/50 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                <Folder className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  <span className="hover:text-primary transition-colors cursor-default">
                    {owner}
                  </span>
                  <span className="opacity-40">/</span>
                  <span className="text-foreground">{repo}</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                  Kanban Board
                </h1>
              </div>
            </div>

            <CreateIssueDialog
              owner={owner}
              repo={repo}
              onSuccess={(newIssue) => {
                setIssues((prev) => [newIssue, ...prev]);
              }}
            />
          </header>

          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse text-sm font-medium">
                  Synchronizing with GitHub...
                </p>
              </div>
            ) : issues.length > 0 || pullRequests.length > 0 ? (
              <KanbanBoard issues={issues} pullRequests={pullRequests} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="text-center py-20 border-2 border-dashed border-primary/10 rounded-3xl space-y-4 max-w-md w-full">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-primary/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">
                      No issues found in this repository.
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Start by creating a new issue above.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
