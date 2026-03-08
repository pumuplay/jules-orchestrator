"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  Check,
  ChevronsUpDown,
  Folder,
  Building2,
  User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function RepoSelector() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [orgs, setOrgs] = useState<GitHubOrg[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const currentOwner = params.owner as string;
  const currentRepo = params.repo as string;
  const fullPath =
    currentOwner && currentRepo ? `${currentOwner}/${currentRepo}` : null;

  const loadInitialData = useCallback(async () => {
    if (session?.accessToken) {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
  }, [session?.accessToken]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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
            className="w-full sm:w-[280px] justify-between bg-background/50 border-primary/20 hover:bg-primary/5 transition-all"
          />
        }
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
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command className="bg-background" shouldFilter={true}>
          <CommandInput
            placeholder="Search your repositories..."
            onValueChange={handleSearch}
          />
          <CommandList>
            {loading && (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
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
                        fullPath === repo.full_name
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{repo.full_name}</span>
                  </CommandItem>
                ))}
            </CommandGroup>

            {/* Organizations from membership or search results */}
            {Array.from(
              new Set([
                ...orgs.map((o) => o.login),
                ...repos
                  .filter((r) => r.owner.type.includes("Organization"))
                  .map((r) => r.owner.login),
              ]),
            ).map((orgLogin) => {
              const orgRepos = repos.filter((r) => r.owner.login === orgLogin);
              if (orgRepos.length === 0 && !searchQuery) return null;
              if (orgRepos.length === 0 && searchQuery) return null;

              return (
                <CommandGroup key={orgLogin} heading={orgLogin}>
                  {orgRepos.map((repo) => (
                    <CommandItem
                      key={repo.id}
                      value={repo.full_name}
                      onSelect={() => onSelect(repo.full_name)}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          fullPath === repo.full_name
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{repo.full_name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
