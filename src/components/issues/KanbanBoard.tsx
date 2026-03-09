"use client";

import { GitHubIssue, JULES_LABEL } from "@/lib/github";
import { Badge } from "@/components/ui/badge";
import {
  CircleDot,
  Clock,
  MessageSquare,
  ExternalLink,
  GitPullRequest,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface KanbanBoardProps {
  issues: GitHubIssue[];
  pullRequests: GitHubIssue[];
}

export function KanbanBoard({ issues, pullRequests }: KanbanBoardProps) {
  const { t } = useLanguage();

  // Column 1: Open issues (not labeled with JULES_LABEL and not PRs)
  const openIssues = issues.filter(
    (issue) =>
      issue.state === "open" &&
      !issue.pull_request &&
      !issue.labels.some((l) => l.name === JULES_LABEL)
  );

  // Column 2: Jules is working on (labeled with JULES_LABEL)
  const julesIssues = issues.filter(
    (issue) =>
      issue.state === "open" &&
      !issue.pull_request &&
      issue.labels.some((l) => l.name === JULES_LABEL)
  );

  // Column 3: Pull Requests (Open PRs from Jules)
  // Filtering for 'jules' label or user if possible,
  // but according to the prompt 'the opened pull request from jules'
  const julesPRs = pullRequests.filter(
    (pr) =>
      pr.labels.some((l) => l.name === JULES_LABEL) ||
      pr.user.login.toLowerCase().includes("jules")
  );

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 h-full overflow-hidden">
      <KanbanColumn
        title={t("openIssues")}
        count={openIssues.length}
        issues={openIssues}
        type="issue"
      />
      <KanbanColumn
        title={t("julesIsWorking")}
        count={julesIssues.length}
        issues={julesIssues}
        type="jules"
      />
      <KanbanColumn
        title={t("prs")}
        count={julesPRs.length}
        issues={julesPRs}
        type="pr"
      />
    </div>
  );
}

function KanbanColumn({
  title,
  count,
  issues,
  type,
}: {
  title: string;
  count: number;
  issues: GitHubIssue[];
  type: "issue" | "jules" | "pr";
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-0 h-full bg-accent/20 rounded-2xl border border-primary/5">
      <div className="p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm tracking-tight text-foreground/80">
            {title}
          </h3>
          <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-background border-primary/10">
            {count}
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {issues.map((item, index) => (
              <KanbanCard key={item.id} item={item} type={type} index={index} />
            ))}
          </AnimatePresence>
          {issues.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
              <div className="h-8 w-8 rounded-full border-2 border-dashed border-current mb-2" />
              <p className="text-xs font-medium">{t("noItems")}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function KanbanCard({ item, type, index }: { item: GitHubIssue; type: string; index: number }) {
  const isPR = type === "pr";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group p-4 rounded-xl border border-border bg-card hover:bg-card/80 hover:border-primary/20 transition-all shadow-sm flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2 min-w-0">
          <div
            className={cn(
              "mt-0.5 shrink-0",
              isPR
                ? "text-purple-500"
                : type === "jules"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {isPR ? (
              <GitPullRequest className="h-4 w-4" />
            ) : (
              <CircleDot className="h-4 w-4" />
            )}
          </div>
          <h4 className="text-sm font-semibold leading-snug line-clamp-2">
            {item.title}
          </h4>
        </div>
        <a
          href={item.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {item.labels?.map((label) => (
          <Badge
            key={label.id}
            variant="outline"
            className={cn(
              "px-1.5 py-0 text-[9px] h-3.5 uppercase tracking-wider font-bold",
              label.name === JULES_LABEL
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted/50 text-muted-foreground border-transparent"
            )}
          >
            {label.name}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
        <div className="flex items-center gap-3">
          <span className="font-mono opacity-70">#{item.number}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 opacity-60" />
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
        {item.comments > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 opacity-60" />
            {item.comments}
          </div>
        )}
      </div>
    </motion.div>
  );
}
