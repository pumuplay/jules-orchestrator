"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getGitHubClient, fetchRepos } from "@/lib/github";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Folder, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams();

  const currentRepoPath =
    params.owner && params.repo ? `${params.owner}/${params.repo}` : null;

  useEffect(() => {
    async function loadRepos() {
      if (session?.accessToken) {
        setLoading(true);
        try {
          const octokit = getGitHubClient(session.accessToken);
          const data = await fetchRepos(octokit);
          setRepos(data);
        } catch (error) {
          console.error("Failed to fetch repos:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadRepos();
  }, [session?.accessToken]);

  const filteredRepos = repos.filter((repo) =>
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!session) return null;

  return (
    <aside className="w-80 flex-col flex border-r bg-sidebar/50 backdrop-blur-sm h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            className="pl-9 bg-background/50 border-primary/10 focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 pb-4">
        <div className="space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading repositories...</span>
            </div>
          ) : filteredRepos.length > 0 ? (
            filteredRepos.map((repo) => (
              <Link
                key={repo.id}
                href={`/repo/${repo.full_name}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all group",
                  currentRepoPath === repo.full_name
                    ? "bg-primary/20 border border-primary/30 text-primary shadow-[0_0_15px_rgba(57,255,20,0.1)]"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground border border-transparent",
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-sm transition-colors",
                    currentRepoPath === repo.full_name
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary",
                  )}
                >
                  {repo.private ? (
                    <Folder className="h-4 w-4" />
                  ) : (
                    <Folder className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate leading-tight">
                    {repo.name}
                  </span>
                  <span className="text-[10px] opacity-60 truncate">
                    {repo.owner.login}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No repositories found.
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
