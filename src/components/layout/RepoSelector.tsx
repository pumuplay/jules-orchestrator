"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  getGitHubClient,
  fetchRepos,
  fetchOrganizations,
  GitHubRepo,
  GitHubOrg,
} from "@/lib/github";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Folder, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function RepoSelector() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [orgs, setOrgs] = useState<GitHubOrg[]>([]);

  const currentOwner = params.owner as string;
  const currentRepo = params.repo as string;
  const fullPath = currentOwner && currentRepo ? `${currentOwner}/${currentRepo}` : null;

  useEffect(() => {
    async function loadInitialData() {
      if (session?.accessToken) {
        try {
          const octokit = getGitHubClient(session.accessToken as string);
          const [repoData, orgData] = await Promise.all([
            fetchRepos(octokit),
            fetchOrganizations(octokit),
          ]);
          setRepos(repoData);
          setOrgs(orgData);
        } catch (error) {
          console.error("Failed to fetch initial data:", error);
        }
      }
    }
    loadInitialData();
  }, [session?.accessToken]);

  const onSelect = (path: string) => {
    setOpen(false);
    router.push(`/repo/${path}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[280px] justify-between bg-background/50 border-primary/20 hover:bg-primary/5 transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              {fullPath ? (
                <>
                  <Folder className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate font-medium">{fullPath}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Select repository...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command className="bg-background">
          <CommandInput placeholder="Search repositories..." />
          <CommandList>
            <CommandEmpty>No repository found.</CommandEmpty>
            <CommandGroup heading="Personal Repositories">
              {repos
                .filter((r) => !r.owner.type.includes("Organization"))
                .map((repo) => (
                  <CommandItem
                    key={repo.id}
                    value={repo.full_name}
                    onSelect={() => onSelect(repo.full_name)}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        fullPath === repo.full_name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{repo.full_name}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
            {orgs.map((org) => (
              <CommandGroup key={org.id} heading={org.login}>
                {repos
                  .filter((r) => r.owner.login === org.login)
                  .map((repo) => (
                    <CommandItem
                      key={repo.id}
                      value={repo.full_name}
                      onSelect={() => onSelect(repo.full_name)}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          fullPath === repo.full_name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{repo.full_name}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
