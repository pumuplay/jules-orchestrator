"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Github, Plus } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Github className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Jules<span className="text-primary">Orchestrator</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end text-sm">
                <span className="font-medium">{session.user?.name}</span>
                <span className="text-muted-foreground text-xs">
                  {session.user?.email}
                </span>
              </div>
              <Avatar className="h-9 w-9 border border-primary/20">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback>
                  {session.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => signIn("github")} className="gap-2">
              <Github className="h-4 w-4" />
              Login with GitHub
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
