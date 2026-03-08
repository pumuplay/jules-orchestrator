"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Sparkles, Github, AlertCircle } from "lucide-react";
import { getGitHubClient, createJulesIssue, GitHubIssue } from "@/lib/github";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CreateIssueDialogProps {
  owner: string;
  repo: string;
  onSuccess?: (issue: GitHubIssue) => void;
}

export function CreateIssueDialog({
  owner,
  repo,
  onSuccess,
}: CreateIssueDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || !title) return;

    setLoading(true);
    try {
      setError(null);
      const octokit = getGitHubClient(session.accessToken);
      const response = await createJulesIssue(octokit, owner, repo, title, body);

      setOpen(false);
      setTitle("");
      setBody("");
      onSuccess?.();
      router.refresh();
    } catch (err: any) {
      console.error("Failed to create issue:", err);
      setError(
        err?.message ||
          "An unexpected error occurred while creating the issue.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2 shadow-[0_0_15px_rgba(57,255,20,0.15)] hover:shadow-[0_0_25px_rgba(57,255,20,0.25)] transition-all">
            <Plus className="h-4 w-4" />
            Create New Issue
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] border-primary/20 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5 text-primary" />
            New GitHub Issue
          </DialogTitle>
          <DialogDescription>
            Create an issue in{" "}
            <span className="text-foreground font-medium">
              {owner}/{repo}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {error && (
            <Alert
              variant="destructive"
              className="bg-destructive/10 border-destructive/20 text-destructive-foreground animate-in fade-in zoom-in duration-200"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-xs opacity-90">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Issue title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-background/50 border-primary/10 focus-visible:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Description</Label>
              <Textarea
                id="body"
                placeholder="Describe the issue..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[150px] bg-background/50 border-primary/10 focus-visible:ring-primary/30"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                Auto-assigned:
              </span>
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 decoration-none"
              >
                jules
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Issue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
