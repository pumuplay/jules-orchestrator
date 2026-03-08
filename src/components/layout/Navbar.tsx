"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Github, PanelLeft } from "lucide-react";
import { useUI } from "./UIContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RepoSelector } from "./RepoSelector";

export function Navbar() {
  const { data: session, status } = useSession();
  const { toggleSidebar, isTitleAbbreviated } = useUI();

  if (status === "loading") return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {session && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hover:bg-primary/10 hover:text-primary transition-colors h-8 w-8"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            )}
            <Link href="/" className="flex items-center gap-2 select-none group">
              <div className="bg-primary p-1 rounded-lg group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Github className="w-5 h-5 text-primary-foreground" />
              </div>
              <AnimatePresence mode="wait">
                {isTitleAbbreviated ? (
                  <motion.span
                    key="abbreviated"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="text-lg font-bold tracking-tight"
                  >
                    J<span className="text-primary">O</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="full"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="text-lg font-bold tracking-tight"
                  >
                    Jules<span className="text-primary">Orchestrator</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {session && (
            <div className="hidden md:flex items-center pl-6 border-l border-primary/10">
              <RepoSelector />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-xs">
                <span className="font-semibold">{session.user?.name}</span>
                <span className="text-muted-foreground opacity-70">
                  {session.user?.email}
                </span>
              </div>
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback>
                  {session.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => signIn("github")}
              className="gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all h-9"
            >
              <Github className="h-4 w-4" />
              Login with GitHub
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
