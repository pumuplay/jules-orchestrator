"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { getGitHubClient, fetchIssues, JULES_LABEL } from "@/lib/github";
import { CreateIssueDialog } from "@/components/issues/CreateIssueDialog";
import {
  Loader2,
  ExternalLink,
  MessageSquare,
  Clock,
  CircleDot,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function RepoPage() {
  const { data: session } = useSession();
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIssues = async () => {
    if (session?.accessToken && owner && repo) {
      setLoading(true);
      try {
        const octokit = getGitHubClient(session.accessToken);
        const data = await fetchIssues(octokit, owner, repo);
        setIssues(data);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadIssues();
  }, [session?.accessToken, owner, repo]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-0 bg-background/30">
          <header className="px-8 py-6 border-b bg-background/50 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hover:text-primary transition-colors cursor-default">
                  {owner}
                </span>
                <span className="opacity-40">/</span>
                <span className="text-foreground font-semibold">{repo}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Issue Management
              </h1>
            </div>

            <CreateIssueDialog
              owner={owner}
              repo={repo}
              onSuccess={loadIssues}
            />
          </header>

          <ScrollArea className="flex-1">
            <div className="p-8 max-w-5xl mx-auto space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground animate-pulse">
                    Synchronizing with GitHub...
                  </p>
                </div>
              ) : issues.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {issues.map((issue, index) => (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group p-5 rounded-xl border border-border bg-card/40 hover:bg-card/70 hover:border-primary/20 transition-all flex items-start justify-between gap-4"
                    >
                      <div className="flex gap-4 min-w-0">
                        <div
                          className={cn(
                            "mt-1 shrink-0",
                            issue.state === "open"
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        >
                          {issue.state === "open" ? (
                            <CircleDot className="h-5 w-5" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5" />
                          )}
                        </div>
                        <div className="space-y-2 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base leading-tight truncate max-w-[400px]">
                              {issue.title}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {issue.labels.map((label: any) => (
                                <Badge
                                  key={label.id}
                                  variant="outline"
                                  className={cn(
                                    "px-1.5 py-0 text-[10px] h-4 uppercase tracking-wider font-semibold",
                                    label.name === JULES_LABEL
                                      ? "bg-primary/20 text-primary border-primary/30"
                                      : "bg-muted text-muted-foreground border-transparent",
                                  )}
                                >
                                  {label.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="opacity-70">
                                #{issue.number}
                              </span>{" "}
                              by{" "}
                              <span className="hover:text-primary transition-colors">
                                {issue.user.login}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 opacity-70" />
                              {new Date(issue.created_at).toLocaleDateString()}
                            </span>
                            {issue.comments > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3 opacity-70" />
                                {issue.comments}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-primary/10 rounded-3xl space-y-4">
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
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
