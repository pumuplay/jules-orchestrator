"use client";

import { useSession, signIn } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Github,
  Rocket,
  Github as GithubIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Rocket className="w-10 h-10 text-primary animate-bounce" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>The Next-Gen Github Issue Manager</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Orchestrate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-500">
                Google Jules workflow
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Log in with GitHub, select your repository, and manage issues with
              automated Jules labelling. Designed for speed, built for
              reliability.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md"
          >
            <Button
              size="lg"
              onClick={() => signIn("github")}
              className="h-14 px-8 text-lg font-bold gap-3 group relative overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <GithubIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
              Get Started with GitHub
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              Learn More
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full py-12 border-t border-primary/10">
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-primary" />}
              title="Secure OAuth"
              description="Direct authentication with GitHub API. We don't store your tokens."
            />
            <FeatureCard
              icon={<Rocket className="w-6 h-6 text-primary" />}
              title="Fast Interaction"
              description="Fluid interface with framer-motion animations and instant updates."
            />
            <FeatureCard
              icon={<GithubIcon className="w-6 h-6 text-primary" />}
              title="Native Jules Integration"
              description="Automated labelling ensures Jules picks up your issues instantly."
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 p-6 rounded-3xl border border-primary/20 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
          >
            <GithubIcon className="w-16 h-16 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight">
            Select a Repository
          </h2>
          <p className="text-muted-foreground max-w-md">
            Choose a repository from the sidebar to view and manage its issues.
            New issues created here will be automatically tagged with the{" "}
            <span className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">
              jules
            </span>{" "}
            label.
          </p>
        </main>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-card/50 transition-colors hover:border-primary/30 group">
      <div className="mb-2 p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-xl">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
