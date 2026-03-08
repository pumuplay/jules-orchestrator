"use client";

import { useSession } from "next-auth/react";
import {
  Settings,
  Github,
  MessageSquare,
  History,
  Kanban,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUI } from "./UIContext";
import { motion } from "framer-motion";

export function Sidebar() {
  const { data: session } = useSession();
  const params = useParams();
  const pathname = usePathname();
  const { isSidebarCollapsed } = useUI();

  const owner = params.owner as string;
  const repo = params.repo as string;

  if (!session) return null;

  const navItems = [
    {
      name: "Kanban Board",
      icon: Kanban,
      href: owner && repo ? `/repo/${owner}/${repo}` : "#",
      disabled: !owner || !repo,
    },
    {
      name: "Activity",
      icon: History,
      href: "#",
      disabled: true,
    },
    {
      name: "Discussions",
      icon: MessageSquare,
      href: "#",
      disabled: true,
    },
    {
      name: "Settings",
      icon: Settings,
      href: "#",
      disabled: true,
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 64 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-col flex border-r bg-sidebar/50 backdrop-blur-sm h-[calc(100vh-4rem)] overflow-hidden shrink-0"
    >
      <div className="p-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href && !item.disabled;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                isActive
                  ? "bg-primary/15 text-primary shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                  : item.disabled
                  ? "opacity-40 cursor-not-allowed text-muted-foreground"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground",
                isSidebarCollapsed && "justify-center px-0"
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {!isSidebarCollapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto p-4 border-t border-primary/10">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground",
            isSidebarCollapsed && "justify-center px-0"
          )}
        >
          <Github className="h-5 w-5 shrink-0" />
          {!isSidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium truncate">GitHub Status</span>
              <span className="text-[10px] text-green-500 font-medium">Operational</span>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
